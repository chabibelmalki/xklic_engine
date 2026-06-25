// @ts-check
/**
 * Client Vercel pour l'onboarding domaine. Réutilise le MÊME client HTTP que
 * scripts/sync-domains.mjs (Bearer VERCEL_TOKEN, teamId en query).
 *
 * Env : VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID (opt).
 *
 * Endpoints utilisés :
 *   • POST   /v10/projects/{id}/domains                 — ajoute un domaine au projet
 *   • GET    /v9/projects/{id}/domains/{name}           — état (verified, redirect…)
 *   • GET    /v6/domains/{name}/config                  — records DNS RECOMMANDÉS + misconfigured
 *
 * ⚠️ La forme exacte de /v6/domains/{name}/config n'est pas couverte par les
 * scripts existants. On lit défensivement plusieurs noms de champs connus
 * (recommendedIPv4 / recommendedCNAME) et, à défaut, on RENVOIE le JSON brut
 * pour que l'humain lise lui-même les records affichés par Vercel — jamais de
 * valeur devinée en dur (cf. règle « ne pas deviner »).
 */
import { MissingTokenError, bareHost } from "./util.mjs";

const API = "https://api.vercel.com";

function cfg() {
  const token = process.env.VERCEL_TOKEN?.trim();
  const projectId = process.env.VERCEL_PROJECT_ID?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  if (!token) throw new MissingTokenError("VERCEL_TOKEN manquant");
  if (!projectId) throw new MissingTokenError("VERCEL_PROJECT_ID manquant");
  return { token, projectId, teamId };
}

/** @param {string} pathname @param {Record<string,string|number>} [extra] */
function apiUrl(pathname, teamId, extra = {}) {
  const u = new URL(pathname, API);
  if (teamId) u.searchParams.set("teamId", teamId);
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, String(v));
  return u;
}

/** @param {URL} url @param {string} token @param {RequestInit} [init] */
async function api(url, token, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  return { res, body };
}

/**
 * Ajoute un domaine au projet (idempotent).
 * @param {string} name
 * @returns {Promise<"added"|"exists">}
 */
export async function addProjectDomain(name) {
  const { token, projectId, teamId } = cfg();
  const { res, body } = await api(
    apiUrl(`/v10/projects/${projectId}/domains`, teamId),
    token,
    { method: "POST", body: JSON.stringify({ name }) },
  );
  if (res.ok) return "added";
  // 409 / "domain_already_exists" : déjà rattaché -> idempotent.
  const code = body?.error?.code;
  if (res.status === 409 || code === "domain_already_exists") return "exists";
  throw new Error(`POST /v10/projects/${projectId}/domains (${name}) -> ${res.status} ${body?.error?.message ?? res.statusText}`);
}

/**
 * État d'un domaine côté projet. `null` si pas (encore) rattaché.
 * @param {string} name
 * @returns {Promise<{ name: string, verified: boolean, redirect: string|null, raw: any } | null>}
 */
export async function getProjectDomain(name) {
  const { token, projectId, teamId } = cfg();
  const { res, body } = await api(apiUrl(`/v9/projects/${projectId}/domains/${name}`, teamId), token);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET project domain ${name} -> ${res.status} ${body?.error?.message ?? res.statusText}`);
  return { name: body.name, verified: !!body.verified, redirect: body.redirect ?? null, raw: body };
}

/**
 * Aplati un champ « recommended* » de Vercel vers une liste de valeurs string.
 *
 * Forme observée en prod (juin 2026) :
 *   recommendedIPv4 : [{ rank:1, value:["216.198.79.1","64.29.17.1"] }, { rank:2, value:["76.76.21.21"] }]
 *   recommendedCNAME: [{ rank:1, value:["<hash>.vercel-dns-017.com"] }]
 * On prend le PREMIER groupe (meilleur rank) et on renvoie SES valeurs à plat.
 * On gère aussi les formes dégénérées (string nue, tableau de strings) au cas où
 * Vercel changerait — sans jamais inventer de valeur.
 */
function recommendedList(field) {
  const arr = Array.isArray(field) ? field : field ? [field] : [];
  for (const entry of arr) {
    if (typeof entry === "string") return [entry];
    const v = entry?.value ?? entry;
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
    if (typeof v === "string") return [v];
  }
  return [];
}

/**
 * Récupère la config DNS d'un domaine : misconfigured + records recommandés.
 * @param {string} name
 * @returns {Promise<{ misconfigured: boolean, recommendedIPv4: string[], recommendedCNAME: string[], raw: any }>}
 */
export async function getDomainConfig(name) {
  const { token, teamId } = cfg();
  const { res, body } = await api(apiUrl(`/v6/domains/${name}/config`, teamId), token);
  if (!res.ok) throw new Error(`GET /v6/domains/${name}/config -> ${res.status} ${body?.error?.message ?? res.statusText}`);
  return {
    misconfigured: !!body?.misconfigured,
    recommendedIPv4: recommendedList(body?.recommendedIPv4), // peut contenir PLUSIEURS IP (apex)
    recommendedCNAME: recommendedList(body?.recommendedCNAME),
    raw: body,
  };
}

/**
 * Détermine les records DNS à poser chez OVH d'après Vercel :
 *   - A     @     -> IP(s) recommandée(s) pour l'apex (souvent PLUSIEURS)
 *   - CNAME www   -> cible recommandée pour le sous-domaine www
 *
 * Renvoie aussi misconfigured (apex + www) et le JSON brut pour audit. Si Vercel
 * ne fournit pas un champ proprement, la liste est vide / la cible est `null` et
 * l'appelant imprime le brut + un rappel de lire le dashboard — on ne devine pas.
 *
 * @param {string} apex @param {string} www
 */
export async function getRecommendedRecords(apex, www) {
  const apexCfg = await getDomainConfig(apex);
  const wwwCfg = await getDomainConfig(www);
  return {
    apexARecords: apexCfg.recommendedIPv4, // string[] — une OU plusieurs IP
    wwwCnameTarget: wwwCfg.recommendedCNAME[0] ?? null,
    apexMisconfigured: apexCfg.misconfigured,
    wwwMisconfigured: wwwCfg.misconfigured,
    rawApex: apexCfg.raw,
    rawWww: wwwCfg.raw,
  };
}

export { bareHost };
