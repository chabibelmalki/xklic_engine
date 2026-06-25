// @ts-check
/**
 * Auth compte de service Google + clients Site Verification & Search Console.
 *
 * L'auth JWT RS256 est IDENTIQUE à scripts/sync-sitemaps.mjs (signée localement,
 * aucune dépendance). On élargit juste le scope pour couvrir la VÉRIFICATION de
 * propriété (siteverification) en plus de webmasters.
 *
 * Pré-requis (sinon les appels échouent — signalé en manuel) :
 *   • clé JSON du compte de service -> GSC_SERVICE_ACCOUNT_KEY (déjà en place)
 *   • APIs activées sur le projet GCP : "Site Verification API" + "Search Console API"
 *   • le compte de service doit pouvoir vérifier le domaine (DNS_TXT) : il devient
 *     propriétaire vérifié une fois le TXT posé.
 *
 * ── Endpoints (NON couverts par les scripts existants -> documentés) ──────
 * Site Verification API (https://www.googleapis.com/siteVerification/v1) :
 *   • POST /token
 *       body {verificationMethod:"DNS_TXT", site:{type:"INET_DOMAIN", identifier:"<domaine>"}}
 *       -> { token: "google-site-verification=XXXX" }   (valeur du TXT à poser sur @)
 *   • POST /webResource?verificationMethod=DNS_TXT
 *       body {site:{type:"INET_DOMAIN", identifier:"<domaine>"}}
 *       -> 200 si le TXT est trouvé/valide (sinon 400 -> propagation, réessayer)
 *
 * Search Console API (https://www.googleapis.com/webmasters/v3) :
 *   • PUT /sites/{sc-domain:<domaine>}                         — ajoute la propriété Domaine
 *   • GET /sites/{prop}/sitemaps  &  PUT /sites/{prop}/sitemaps/{feedpath}  — cf. sync-sitemaps
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { MissingTokenError } from "./util.mjs";

const TOKEN_URI = "https://oauth2.googleapis.com/token";
const SCOPES = [
  "https://www.googleapis.com/auth/siteverification",
  "https://www.googleapis.com/auth/webmasters",
].join(" ");
const SV_API = "https://www.googleapis.com/siteVerification/v1";
const SC_API = "https://www.googleapis.com/webmasters/v3";

export function isConfigured() {
  return !!process.env.GSC_SERVICE_ACCOUNT_KEY;
}

/** @param {string} root @returns {{client_email:string, private_key:string, token_uri?:string}} */
function loadKey(root) {
  const keyPath = process.env.GSC_SERVICE_ACCOUNT_KEY?.trim();
  if (!keyPath) throw new MissingTokenError("GSC_SERVICE_ACCOUNT_KEY manquant");
  const abs = path.resolve(root, keyPath);
  if (!fs.existsSync(abs)) throw new MissingTokenError(`Clé compte de service introuvable : ${abs}`);
  const key = JSON.parse(fs.readFileSync(abs, "utf8"));
  if (!key.client_email || !key.private_key) {
    throw new Error("Clé compte de service invalide (client_email / private_key requis).");
  }
  return key;
}

const b64url = (input) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** @param {string} root @returns {Promise<string>} access token */
export async function getAccessToken(root) {
  const key = loadKey(root);
  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: key.client_email, scope: SCOPES, aud: key.token_uri || TOKEN_URI, iat, exp: iat + 3600 }),
  );
  const signingInput = `${header}.${claims}`;
  const signature = b64url(crypto.sign("RSA-SHA256", Buffer.from(signingInput), key.private_key));
  const res = await fetch(key.token_uri || TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signingInput}.${signature}`,
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`token endpoint -> ${res.status} ${body?.error_description || body?.error || res.statusText}`);
  if (!body?.access_token) throw new Error("token endpoint : access_token absent.");
  return body.access_token;
}

/** @param {string} token @param {string} url @param {RequestInit} [init] */
async function gapi(token, url, init = {}) {
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) } });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  return { res, body };
}

/**
 * Demande le token de vérification DNS_TXT pour une propriété Domaine.
 * @param {string} token @param {string} domain
 * @returns {Promise<string>} ex. "google-site-verification=abc123"
 */
export async function getVerificationToken(token, domain) {
  const { res, body } = await gapi(token, `${SV_API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verificationMethod: "DNS_TXT", site: { type: "INET_DOMAIN", identifier: domain } }),
  });
  if (!res.ok) throw new Error(`siteVerification/token -> ${res.status} ${body?.error?.message ?? res.statusText}`);
  if (!body?.token) throw new Error("siteVerification/token : champ token absent.");
  return body.token;
}

/**
 * Lance la vérification DNS_TXT (le TXT doit déjà être posé + propagé).
 * @returns {Promise<{ ok: boolean, status: number, message?: string }>}
 */
export async function verifyDomain(token, domain) {
  const { res, body } = await gapi(token, `${SV_API}/webResource?verificationMethod=DNS_TXT`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ site: { type: "INET_DOMAIN", identifier: domain } }),
  });
  return { ok: res.ok, status: res.status, message: body?.error?.message };
}

/** Propriétés déjà vérifiées par ce compte de service. @returns {Promise<Set<string>>} identifiers */
export async function listVerifiedDomains(token) {
  const { res, body } = await gapi(token, `${SV_API}/webResource`);
  if (!res.ok) return new Set();
  const ids = (body?.items ?? [])
    .map((it) => it?.site?.identifier)
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  return new Set(ids);
}

/** sc-domain:<domaine> */
export const scDomainProperty = (domain) => `sc-domain:${domain}`;

/** Ajoute (idempotent) la propriété Domaine à Search Console. */
export async function addSearchConsoleProperty(token, domain) {
  const prop = scDomainProperty(domain);
  const { res, body } = await gapi(token, `${SC_API}/sites/${encodeURIComponent(prop)}`, { method: "PUT" });
  if (res.ok || res.status === 204) return "added";
  if (res.status === 409) return "exists";
  throw new Error(`webmasters sites.add ${prop} -> ${res.status} ${body?.error?.message ?? res.statusText}`);
}

/** Liste les sitemaps déjà soumis pour une propriété. @returns {Promise<Set<string>>} */
export async function listSubmittedSitemaps(token, property) {
  const { res, body } = await gapi(token, `${SC_API}/sites/${encodeURIComponent(property)}/sitemaps`);
  if (!res.ok) throw new Error(`sitemaps.list ${property} -> ${res.status} ${body?.error?.message ?? res.statusText}`);
  return new Set((body?.sitemap ?? []).map((s) => s.path).filter(Boolean));
}

/** Soumet un sitemap. */
export async function submitSitemap(token, property, sitemapUrl) {
  const url = `${SC_API}/sites/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const { res, body } = await gapi(token, url, { method: "PUT" });
  if (!res.ok && res.status !== 204) {
    throw new Error(`sitemaps.submit ${sitemapUrl} -> ${res.status} ${body?.error?.message ?? res.statusText}`);
  }
}
