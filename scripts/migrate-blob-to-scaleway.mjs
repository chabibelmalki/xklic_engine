#!/usr/bin/env node
// @ts-check
/**
 * Migration one-shot : Vercel Blob -> stockage objet Scaleway.
 *
 * Parcourt TOUS les JSON de `config/sites/**` (config.json ET fichiers de langue
 * <locale>.json), collecte les URLs Vercel Blob, re-héberge chaque objet sur
 * Scaleway sous la clé `sites/<pathname-blob>` (octets préservés, aucun
 * transcodage), puis réécrit chaque URL dans les fichiers.
 *
 *   node scripts/migrate-blob-to-scaleway.mjs            # DRY-RUN (défaut) : n'écrit rien
 *   node scripts/migrate-blob-to-scaleway.mjs --apply    # exécute upload + réécriture
 *
 * Idempotent : relancé, il ne trouve plus d'URL Blob et ne fait rien.
 * Ne SUPPRIME rien côté Vercel (les anciens objets restent, filet de sécurité).
 *
 * Credentials Scaleway : S3_* + MEDIA_BASE_URL depuis `.env.local`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, loadEnvLocal, die } from "./onboard/util.mjs";
import { scalewayFromEnv, contentTypeFor, SITES_PREFIX } from "./lib/scaleway.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const SITES_DIR = path.join(ROOT, "config", "sites");

// Hôte(s) Vercel Blob à migrer. Le pathname (après l'hôte) devient la clé.
const BLOB_URL_RE = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^\s"')]+/g;

loadEnvLocal(ROOT);

// --- 1. collecter les fichiers JSON + les URLs Blob ------------------------
const files = listJsonFiles(SITES_DIR);
/** @type {Map<string, string[]>} url -> fichiers qui la référencent */
const urlToFiles = new Map();
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const found = raw.match(BLOB_URL_RE);
  if (!found) continue;
  for (const u of found) {
    const url = u.replace(/[)"'.,]+$/, "");
    if (!urlToFiles.has(url)) urlToFiles.set(url, []);
    const arr = urlToFiles.get(url);
    if (arr && !arr.includes(file)) arr.push(file);
  }
}

if (urlToFiles.size === 0) {
  console.log(c.green("✔ Aucune URL Vercel Blob trouvée — rien à migrer (déjà fait ?)."));
  process.exit(0);
}

console.log(
  `${c.bold(String(urlToFiles.size))} URL(s) Blob unique(s) sur ${c.bold(String(files.length))} fichier(s) JSON.`,
);
console.log(APPLY ? c.yellow("Mode --apply : upload + réécriture réels.\n") : c.dim("Mode dry-run (défaut) : aucune écriture. --apply pour exécuter.\n"));

const s3 = scalewayFromEnv();

// --- 2. re-héberger chaque objet, construire la table old -> new ----------
/** @type {Map<string, string>} */
const rewrite = new Map();
for (const [oldURL, refs] of urlToFiles) {
  const key = `${SITES_PREFIX}/${pathnameOf(oldURL)}`;
  const newURL = s3.publicURL(key);
  const label = `${c.dim(pathnameOf(oldURL))} ${c.dim(`(${refs.length} réf.)`)}`;

  if (!APPLY) {
    const ok = await head(oldURL);
    console.log(`  ${ok ? c.green("✔ joignable") : c.yellow("? injoignable")} ${label}`);
    console.log(`     → ${key}`);
    rewrite.set(oldURL, newURL);
    continue;
  }

  process.stdout.write(`  ↓ ${label} … `);
  const data = await download(oldURL);
  const url = await s3.upload(key, data, contentTypeFor(path.extname(key)));
  console.log(c.green("✔") + ` ${c.dim(`${(data.length / 1024).toFixed(0)} Ko`)} -> ${key}`);
  rewrite.set(oldURL, url);
}

// --- 3. réécrire les fichiers ----------------------------------------------
console.log();
let patched = 0;
for (const file of files) {
  let raw = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [oldURL, newURL] of rewrite) {
    if (raw.includes(oldURL)) {
      raw = raw.split(oldURL).join(newURL);
      changed = true;
    }
  }
  if (!changed) continue;
  patched++;
  const rel = path.relative(ROOT, file);
  if (APPLY) {
    fs.writeFileSync(file, raw);
    console.log(`  ${c.green("✔ patché")} ${rel}`);
  } else {
    console.log(`  ${c.yellow("→ patcherait")} ${rel}`);
  }
}

console.log();
if (APPLY) {
  console.log(c.green(`✔ Migration terminée : ${rewrite.size} objet(s), ${patched} fichier(s) réécrit(s).`));
  console.log(c.dim("  Vérifie le rendu (npm run dev), puis commit. Les objets Blob restent (à purger plus tard)."));
} else {
  console.log(c.yellow(`[dry-run] ${rewrite.size} objet(s) à migrer, ${patched} fichier(s) à réécrire.`));
  console.log(c.dim("  Relance avec --apply pour exécuter."));
}

// =========================================================================
// helpers
// =========================================================================

/** @param {string} dir @returns {string[]} tous les .json sous dir (récursif) */
function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) die(`Dossier introuvable : ${path.relative(ROOT, dir)}`);
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsonFiles(p));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(p);
  }
  return out;
}

/** pathname (sans slash de tête) d'une URL Blob. @param {string} url */
function pathnameOf(url) {
  return new URL(url).pathname.replace(/^\/+/, "");
}

/** HEAD -> true si l'objet est joignable. @param {string} url */
async function head(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/** Télécharge les octets bruts. @param {string} url @returns {Promise<Buffer>} */
async function download(url) {
  const res = await fetch(url);
  if (!res.ok) die(`Téléchargement échoué (${res.status}) : ${url}`);
  return Buffer.from(await res.arrayBuffer());
}
