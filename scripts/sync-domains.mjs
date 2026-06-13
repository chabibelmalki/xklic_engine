#!/usr/bin/env node
// @ts-check
/**
 * Synchronise les domaines du projet Vercel avec les sites locaux.
 *
 *   config/sites/<slug>/config.json   <->   <slug>.xklic.com (domaine Vercel)
 *
 *   • slug local sans domaine          -> POST  /v10/projects/{id}/domains
 *   • <slug>.xklic.com sans config     -> DELETE /v9/projects/{id}/domains/...
 *
 * GARDE-FOUS (critiques) :
 *   • on ne TOUCHE QU'aux sous-domaines à UN SEUL label sous .xklic.com
 *   • jamais : xklic.com (apex), www.xklic.com, le wildcard *.xklic.com,
 *     ni aucun *.vercel.app (ni quoi que ce soit hors .xklic.com)
 *   • si la liste des slugs locaux est VIDE -> abort (anti-suppression massive)
 *
 * Idempotent. `--dry-run` affiche le diff sans rien modifier.
 *
 * Env : VERCEL_TOKEN (requis), VERCEL_PROJECT_ID (requis), VERCEL_TEAM_ID (opt).
 *       NEXT_PUBLIC_ROOT_DOMAIN (opt, défaut "xklic.com").
 */
import fs from "node:fs";
import path from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const ROOT = process.cwd();
const SITES_DIR = path.join(ROOT, "config", "sites");
const BASE_FILE = "config.json";
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "xklic.com";
const API = "https://api.vercel.com";

const TOKEN = process.env.VERCEL_TOKEN?.trim();
const PROJECT_ID = process.env.VERCEL_PROJECT_ID?.trim();
const TEAM_ID = process.env.VERCEL_TEAM_ID?.trim();

// --- petites aides de log -------------------------------------------------
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

// --- slugs locaux (mêmes règles que config-loader) ------------------------
/** @returns {string[]} */
function readLocalSlugs() {
  if (!fs.existsSync(SITES_DIR)) return [];
  const slugs = [];
  for (const entry of fs.readdirSync(SITES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (fs.existsSync(path.join(SITES_DIR, entry.name, BASE_FILE))) {
      slugs.push(entry.name);
    }
  }
  return [...new Set(slugs)].sort();
}

// --- prédicat de domaine GÉRABLE (le coeur des garde-fous) ----------------
const SINGLE_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
/**
 * Vrai uniquement pour `<label>.<ROOT_DOMAIN>` où <label> est un SEUL label DNS
 * (pas de point, pas de `*`) et n'est pas `www`. Exclut donc, par construction :
 * l'apex, www.<root>, le wildcard *.<root>, les sous-sous-domaines (a.b.<root>),
 * et tout ce qui n'est pas sous .<root> (ex. *.vercel.app).
 * @param {string} name
 */
function isManagedSubdomain(name) {
  const suffix = `.${ROOT_DOMAIN}`;
  if (!name.endsWith(suffix)) return false;
  const label = name.slice(0, -suffix.length);
  return label !== "www" && SINGLE_LABEL.test(label);
}
/** @param {string} slug */
const domainForSlug = (slug) => `${slug}.${ROOT_DOMAIN}`;

// --- client API Vercel ----------------------------------------------------
/** @param {string} pathname @param {Record<string,string>} [extra] */
function apiUrl(pathname, extra = {}) {
  const u = new URL(pathname, API);
  if (TEAM_ID) u.searchParams.set("teamId", TEAM_ID);
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
  return u;
}
/** @param {URL} url @param {RequestInit} [init] */
async function api(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = body?.error?.message ?? text ?? res.statusText;
    throw new Error(`${init.method ?? "GET"} ${url.pathname} -> ${res.status} ${detail}`);
  }
  return body;
}

/** Liste TOUS les domaines du projet (paginé). @returns {Promise<string[]>} */
async function listProjectDomains() {
  /** @type {string[]} */
  const names = [];
  let since;
  for (;;) {
    const extra = { limit: "100" };
    if (since) extra.since = String(since);
    const data = await api(apiUrl(`/v9/projects/${PROJECT_ID}/domains`, extra));
    for (const d of data.domains ?? []) names.push(d.name);
    const next = data.pagination?.next;
    if (!next) break;
    since = next;
  }
  return names;
}

/** @param {string} name */
async function addDomain(name) {
  await api(apiUrl(`/v10/projects/${PROJECT_ID}/domains`), {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
/** @param {string} name */
async function removeDomain(name) {
  await api(apiUrl(`/v9/projects/${PROJECT_ID}/domains/${name}`), {
    method: "DELETE",
  });
}

// --- main -----------------------------------------------------------------
async function main() {
  if (!TOKEN) die("VERCEL_TOKEN manquant.");
  if (!PROJECT_ID) die("VERCEL_PROJECT_ID manquant.");

  const localSlugs = readLocalSlugs();
  // Garde-fou anti-suppression massive : 0 slug local = on n'efface rien.
  if (localSlugs.length === 0) {
    die(
      "Aucun slug local trouvé dans config/sites/ — abandon pour éviter une " +
        "suppression massive de domaines. (Vérifie le dossier / la branche.)",
    );
  }

  console.log(
    c.bold(`Sync domaines Vercel`) +
      c.dim(` — root=${ROOT_DOMAIN} project=${PROJECT_ID}${TEAM_ID ? ` team=${TEAM_ID}` : ""}`) +
      (DRY_RUN ? c.yellow("  [DRY-RUN]") : ""),
  );
  console.log(c.dim(`Slugs locaux (${localSlugs.length}) : ${localSlugs.join(", ")}`));

  const remoteNames = await listProjectDomains();
  const remoteSet = new Set(remoteNames);

  // Domaines gérés actuellement présents côté Vercel (les seuls supprimables).
  const managedRemote = remoteNames.filter(isManagedSubdomain);
  const localSet = new Set(localSlugs);

  // À AJOUTER : slug local dont le domaine n'existe pas encore.
  const toAdd = localSlugs
    .map(domainForSlug)
    .filter((name) => !remoteSet.has(name));

  // À SUPPRIMER : domaine géré dont le label n'est plus un slug local.
  const toDelete = managedRemote.filter((name) => {
    const label = name.slice(0, -`.${ROOT_DOMAIN}`.length);
    return !localSet.has(label);
  });

  if (toAdd.length === 0 && toDelete.length === 0) {
    console.log(c.green("✓ Déjà synchronisé — rien à faire."));
    return;
  }

  // Résumé du diff.
  for (const name of toAdd) console.log(c.green(`  + ${name}`));
  for (const name of toDelete) console.log(c.red(`  - ${name}`));

  if (DRY_RUN) {
    console.log(c.yellow(`\n[DRY-RUN] ${toAdd.length} ajout(s), ${toDelete.length} suppression(s) — aucune modification.`));
    return;
  }

  // Application.
  for (const name of toAdd) {
    await addDomain(name);
    console.log(c.green(`  ✓ ajouté   ${name}`));
  }
  for (const name of toDelete) {
    // Double garde-fou avant toute suppression (belt & suspenders).
    if (!isManagedSubdomain(name)) {
      console.log(c.yellow(`  ! ignoré (non gérable) ${name}`));
      continue;
    }
    await removeDomain(name);
    console.log(c.red(`  ✓ supprimé ${name}`));
  }

  console.log(c.green(`\n✓ Sync terminée : ${toAdd.length} ajout(s), ${toDelete.length} suppression(s).`));
}

main().catch((e) => die(e.message));
