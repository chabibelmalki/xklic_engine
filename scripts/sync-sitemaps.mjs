#!/usr/bin/env node
// @ts-check
/**
 * Soumet à Google Search Console les sitemaps des sites du moteur qui ne sont
 * pas encore soumis.
 *
 *   config/sites/<slug>/config.json   ->   <origin>/sitemap.xml
 *
 * SOURCE DE VÉRITÉ = les dossiers config/sites/*. L'URL publique de chaque site
 * (origin) est calculée par la MÊME règle que le reste du moteur (siteOrigin,
 * voir src/lib/urls.ts) : domaine perso `config.domain` si présent, sinon
 * `https://<config.slug>.<NEXT_PUBLIC_ROOT_DOMAIN>`.
 *
 * La propriété GSC est de type DOMAINE -> siteUrl = "sc-domain:xklic.com",
 * qui couvre xklic.com et tous ses sous-domaines.
 *
 *   • GET  webmasters/v3/sites/{siteUrl}/sitemaps            (déjà soumis)
 *   • PUT  webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath} (soumet le manquant)
 *
 * Idempotent. `--dry-run` affiche ce qui SERAIT soumis sans rien envoyer.
 *
 * GARDE-FOUS :
 *   • 0 slug local trouvé -> abort.
 *   • on ignore (avec warning) tout sitemap dont l'hôte n'est PAS couvert par
 *     la propriété (ex. domaine perso hors xklic.com) : GSC le rejetterait.
 *
 * Auth : COMPTE DE SERVICE (clé JSON), scope
 *   https://www.googleapis.com/auth/webmasters.
 * JWT RS256 signé localement (node:crypto) puis échangé contre un access token
 * — aucune dépendance externe.
 *
 * Env (lues depuis .env.local) :
 *   GSC_SERVICE_ACCOUNT_KEY   chemin du JSON du compte de service
 *                             (ex. ./gsc-service-account.json)
 *   GSC_PROPERTY              propriété GSC (ex. "sc-domain:xklic.com")
 *   NEXT_PUBLIC_ROOT_DOMAIN   domaine racine (défaut "xklic.com")
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DRY_RUN = process.argv.includes("--dry-run");
const ROOT = process.cwd();
const SITES_DIR = path.join(ROOT, "config", "sites");
const BASE_FILE = "config.json";
const TOKEN_URI = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters";
const GSC_API = "https://www.googleapis.com/webmasters/v3";

// --- petites aides de log (calquées sur sync-domains.mjs) -----------------
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
function die(msg) {
  console.error(c.red(`✖ ${msg}`));
  process.exit(1);
}

// --- .env.local : chargé sans écraser l'env déjà présent ------------------
function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (key in process.env) continue; // l'env réel a la priorité
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}
loadEnvLocal();

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "xklic.com";
const KEY_PATH = process.env.GSC_SERVICE_ACCOUNT_KEY?.trim();
const PROPERTY = process.env.GSC_PROPERTY?.trim();

// --- origin d'un site -----------------------------------------------------
// ⚠️ MIROIR de `siteOrigin` (src/lib/urls.ts). Node 20 ne peut pas importer le
// .ts (pas de résolution de l'alias `@/`, pas de strip TS natif), donc on
// réplique la règle à l'identique. Toute évolution de siteOrigin doit être
// reportée ici (même contrat : domain perso, sinon <slug>.<root>).
/** @param {{ slug: string, domain?: string }} config */
function siteOrigin(config) {
  if (config.domain) {
    return config.domain.startsWith("http")
      ? config.domain.replace(/\/$/, "")
      : `https://${config.domain}`;
  }
  return `https://${config.slug}.${ROOT_DOMAIN}`;
}

// --- sites locaux (mêmes règles que config-loader / generate-manifest) ----
/** @returns {{ dir: string, slug: string, domain?: string, sitemap: string }[]} */
function readLocalSites() {
  if (!fs.existsSync(SITES_DIR)) return [];
  const sites = [];
  for (const entry of fs.readdirSync(SITES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue; // un client = un DOSSIER
    const cfgPath = path.join(SITES_DIR, entry.name, BASE_FILE);
    if (!fs.existsSync(cfgPath)) continue;
    /** @type {{ slug?: string, domain?: string }} */
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    // `slug` du JSON pilote l'origin (peut différer du nom de dossier) ; on
    // retombe sur le dossier par sécurité s'il manque.
    const slug = cfg.slug?.trim() || entry.name;
    const config = { slug, domain: cfg.domain };
    sites.push({
      dir: entry.name,
      slug,
      domain: cfg.domain,
      sitemap: `${siteOrigin(config)}/sitemap.xml`,
    });
  }
  // dédup par URL de sitemap, trié pour des logs stables.
  const seen = new Set();
  return sites
    .filter((s) => (seen.has(s.sitemap) ? false : seen.add(s.sitemap)))
    .sort((a, b) => a.sitemap.localeCompare(b.sitemap));
}

// --- auth compte de service : JWT RS256 -> access token -------------------
/** base64url d'un Buffer/string. @param {Buffer|string} input */
function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** @param {{ client_email: string, private_key: string, token_uri?: string }} key */
async function getAccessToken(key) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPE,
      aud: key.token_uri || TOKEN_URI,
      iat,
      exp,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const signature = b64url(
    crypto.sign("RSA-SHA256", Buffer.from(signingInput), key.private_key),
  );
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch(key.token_uri || TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = body?.error_description || body?.error || res.statusText;
    throw new Error(`token endpoint -> ${res.status} ${detail}`);
  }
  if (!body?.access_token) throw new Error("token endpoint : access_token absent.");
  return body.access_token;
}

// --- client GSC -----------------------------------------------------------
/** @param {string} accessToken @param {string} url @param {RequestInit} [init] */
async function gsc(accessToken, url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = body?.error?.message ?? text ?? res.statusText;
    throw new Error(`${init.method ?? "GET"} ${url} -> ${res.status} ${detail}`);
  }
  return body;
}

/** Sitemaps déjà soumis pour la propriété. @returns {Promise<Set<string>>} */
async function listSubmittedSitemaps(accessToken, siteUrl) {
  const url = `${GSC_API}/sites/${encodeURIComponent(siteUrl)}/sitemaps`;
  const data = await gsc(accessToken, url);
  return new Set((data?.sitemap ?? []).map((s) => s.path).filter(Boolean));
}

/** Soumet un sitemap. */
async function submitSitemap(accessToken, siteUrl, sitemapUrl) {
  const url = `${GSC_API}/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  await gsc(accessToken, url, { method: "PUT" });
}

// --- l'hôte du sitemap est-il couvert par la propriété ? ------------------
// sc-domain:xklic.com couvre xklic.com et tous ses sous-domaines.
/** @param {string} property @param {string} sitemapUrl */
function isCoveredByProperty(property, sitemapUrl) {
  const m = property.match(/^sc-domain:(.+)$/);
  if (!m) {
    // Propriété de type URL-prefix : on exige le même préfixe.
    return sitemapUrl.startsWith(property.replace(/\/$/, ""));
  }
  const base = m[1].trim().toLowerCase();
  let host;
  try {
    host = new URL(sitemapUrl).hostname.toLowerCase();
  } catch {
    return false;
  }
  return host === base || host.endsWith(`.${base}`);
}

// --- main -----------------------------------------------------------------
async function main() {
  if (!KEY_PATH) die("GSC_SERVICE_ACCOUNT_KEY manquant (chemin du JSON du compte de service).");
  if (!PROPERTY) die('GSC_PROPERTY manquant (ex. "sc-domain:xklic.com").');

  const keyAbs = path.resolve(ROOT, KEY_PATH);
  if (!fs.existsSync(keyAbs)) die(`Clé compte de service introuvable : ${keyAbs}`);
  /** @type {{ client_email: string, private_key: string, token_uri?: string }} */
  let key;
  try {
    key = JSON.parse(fs.readFileSync(keyAbs, "utf8"));
  } catch (e) {
    die(`Clé compte de service illisible (${KEY_PATH}) : ${e.message}`);
  }
  if (!key.client_email || !key.private_key) {
    die("Clé compte de service invalide : champs client_email / private_key requis.");
  }

  const sites = readLocalSites();
  // Garde-fou : aucun site local = on ne soumet rien (mauvais dossier/branche).
  if (sites.length === 0) {
    die("Aucun site local trouvé dans config/sites/ — abandon. (Vérifie le dossier / la branche.)");
  }

  console.log(
    c.bold("Sync sitemaps -> Google Search Console") +
      c.dim(` — property=${PROPERTY} root=${ROOT_DOMAIN}`) +
      (DRY_RUN ? c.yellow("  [DRY-RUN]") : ""),
  );
  console.log(c.dim(`Sites locaux (${sites.length}) : ${sites.map((s) => s.dir).join(", ")}`));

  // Filtre les sitemaps hors propriété (GSC les rejetterait).
  const eligible = [];
  for (const s of sites) {
    if (isCoveredByProperty(PROPERTY, s.sitemap)) {
      eligible.push(s);
    } else {
      console.log(c.yellow(`  ! ignoré (hors propriété ${PROPERTY}) : ${s.sitemap}`));
    }
  }
  if (eligible.length === 0) {
    die(`Aucun sitemap couvert par la propriété ${PROPERTY} — rien à soumettre.`);
  }

  // En dry-run, on tente quand même l'auth + le GET pour un diff fiable ;
  // si l'auth échoue, on se rabat sur un diff "tout à soumettre".
  let accessToken = null;
  let submitted = new Set();
  try {
    accessToken = await getAccessToken(key);
    submitted = await listSubmittedSitemaps(accessToken, PROPERTY);
  } catch (e) {
    if (!DRY_RUN) throw e;
    console.log(c.yellow(`  ! [DRY-RUN] auth/lecture GSC indisponible (${e.message}) — diff approximatif.`));
  }

  const toSubmit = eligible.filter((s) => !submitted.has(s.sitemap));
  const present = eligible.filter((s) => submitted.has(s.sitemap));

  for (const s of present) console.log(c.dim(`  = déjà présent  ${s.sitemap}`));

  if (toSubmit.length === 0) {
    console.log(c.green("✓ Tous les sitemaps sont déjà soumis — rien à faire."));
    return;
  }

  for (const s of toSubmit) console.log(c.green(`  + ${s.sitemap}`));

  if (DRY_RUN) {
    console.log(c.yellow(`\n[DRY-RUN] ${toSubmit.length} sitemap(s) seraient soumis — aucune modification.`));
    return;
  }

  let ok = 0;
  for (const s of toSubmit) {
    try {
      await submitSitemap(accessToken, PROPERTY, s.sitemap);
      ok++;
      console.log(c.green(`  ✓ soumis  ${s.sitemap}`));
    } catch (e) {
      console.log(c.red(`  ✖ échec   ${s.sitemap} : ${e.message}`));
    }
  }

  console.log(c.green(`\n✓ Sync terminée : ${ok}/${toSubmit.length} sitemap(s) soumis.`));
  if (ok < toSubmit.length) process.exitCode = 1;
}

main().catch((e) => die(e.message));
