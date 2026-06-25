#!/usr/bin/env node
// @ts-check
/**
 * Héberge le logo d'un client sur Vercel Blob, branche l'URL dans sa config,
 * et nettoie l'image locale.
 *
 *   node scripts/upload-logo.mjs <slug> [fichier]
 *
 * Ce que ça fait, dans l'ordre :
 *   1. Trouve l'image source. Si [fichier] est omis, on la cherche dans `.temp/`
 *      (un seul candidat -> pris ; ou un fichier dont le nom contient le slug).
 *   2. `vercel blob put` -> URL publique stable sur le store `blob-agency`.
 *   3. Patch `config/sites/<slug>/config.json` :
 *        branding.logo  (= le HEADER)   = URL Blob
 *        branding.icon  (= le FAVICON)  = URL Blob   (même image, c'est voulu)
 *
 * Le logo (header) et le favicon sont la MÊME image : un seul upload, deux refs.
 *
 * Par défaut l'image source est CONSERVÉE en local. `--clean-source` la supprime
 * (et `public/sites/<slug>` si l'image venait de l'ancien schéma local).
 *
 * Token : BLOB_READ_WRITE_TOKEN, lu depuis `.env.local` (jamais commité).
 *         Passé en `--rw-token` ; on retire BLOB_STORE_ID de l'env de l'enfant
 *         pour ne pas déclencher le mode OIDC du CLI (« must both be set »).
 *
 * `--dry-run` : montre ce qui serait fait, n'upload/écrit/supprime rien.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { c, loadEnvLocal, die } from "./onboard/util.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");
const CLEAN_SOURCE = process.argv.includes("--clean-source");
const FLAGS = new Set(["--dry-run", "--clean-source"]);
const args = process.argv.slice(2).filter((a) => !FLAGS.has(a));

const BLOB_HOST_RE = /https:\/\/[^\s"']*\.public\.blob\.vercel-storage\.com\/\S+/;
const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".gif", ".avif"]);

loadEnvLocal(ROOT);

// --- args -----------------------------------------------------------------
const slug = args[0]?.trim();
if (!slug) {
  die(
    "Usage : node scripts/upload-logo.mjs <slug> [fichier]\n" +
      "  ex : node scripts/upload-logo.mjs parfait-menage-26 .temp/logo.png\n" +
      "  (sans fichier, le logo est cherché dans .temp/)",
  );
}

const siteDir = path.join(ROOT, "config", "sites", slug);
const configPath = path.join(siteDir, "config.json");
if (!fs.existsSync(configPath)) {
  die(`Config introuvable pour « ${slug} » : ${path.relative(ROOT, configPath)}`);
}

// --- 1. trouver l'image source -------------------------------------------
const sourceFile = resolveSourceImage(args[1], slug);
const ext = path.extname(sourceFile).toLowerCase();
if (!IMG_EXT.has(ext)) {
  die(`Extension non gérée (${ext || "aucune"}) : ${path.relative(ROOT, sourceFile)}`);
}
console.log(`${c.bold("slug")}    ${slug}`);
console.log(`${c.bold("source")}  ${path.relative(ROOT, sourceFile)}`);

// --- 2. upload vers Vercel Blob ------------------------------------------
const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();
if (!token) {
  die(
    "BLOB_READ_WRITE_TOKEN manquant dans .env.local.\n" +
      "  Ajoute-le :  echo 'BLOB_READ_WRITE_TOKEN=vercel_blob_rw_…' >> .env.local",
  );
}

const pathname = `${slug}/logo${ext}`;
let url;
if (DRY_RUN) {
  url = `https://<host>.public.blob.vercel-storage.com/${slug}/logo-XXXX${ext}`;
  console.log(c.yellow(`[dry-run] vercel blob put ${path.relative(ROOT, sourceFile)} --pathname ${pathname}`));
} else {
  console.log(c.dim(`↑ upload  ${pathname} …`));
  url = uploadToBlob(sourceFile, pathname, token);
  console.log(`${c.green("✔ blob")}  ${url}`);
}

// --- 3. patcher la config (header = logo, favicon = icon) ----------------
patchConfig(configPath, url);

// --- 4. nettoyer le local (opt-in via --clean-source) --------------------
if (CLEAN_SOURCE) cleanupLocal(sourceFile, slug);
else console.log(`${c.dim("○ source conservée")} ${path.relative(ROOT, sourceFile)} ${c.dim("(--clean-source pour la supprimer)")}`);

console.log(
  DRY_RUN
    ? c.yellow("\n[dry-run] terminé — rien n'a été modifié.")
    : c.green("\n✔ terminé.") + c.dim("  Vérifie le rendu, puis commit la config."),
);

// =========================================================================
// helpers
// =========================================================================

/**
 * Résout l'image source : argument explicite, sinon recherche dans `.temp/`.
 * @param {string|undefined} explicit
 * @param {string} slug
 * @returns {string} chemin absolu
 */
function resolveSourceImage(explicit, slug) {
  if (explicit) {
    const p = path.resolve(ROOT, explicit);
    if (!fs.existsSync(p)) die(`Fichier introuvable : ${explicit}`);
    if (!fs.statSync(p).isFile()) die(`Pas un fichier : ${explicit}`);
    return p;
  }

  const tempDir = path.join(ROOT, ".temp");
  if (!fs.existsSync(tempDir)) {
    die(
      "Aucun fichier fourni et `.temp/` n'existe pas.\n" +
        "  Dépose l'image dans .temp/ ou passe le chemin en 2e argument.",
    );
  }
  const images = fs
    .readdirSync(tempDir)
    .filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()))
    .map((f) => path.join(tempDir, f));

  if (images.length === 0) die("Aucune image trouvée dans `.temp/`.");

  // priorité : un nom qui contient le slug
  const bySlug = images.filter((p) => path.basename(p).toLowerCase().includes(slug.toLowerCase()));
  if (bySlug.length === 1) return bySlug[0];
  if (bySlug.length > 1) {
    die(`Plusieurs images contiennent « ${slug} » dans .temp/ :\n  ${bySlug.map((p) => path.relative(ROOT, p)).join("\n  ")}\n  Précise le fichier en 2e argument.`);
  }
  if (images.length === 1) return images[0];
  die(
    `Plusieurs images dans .temp/ et aucune ne nomme « ${slug} » :\n  ${images
      .map((p) => path.relative(ROOT, p))
      .join("\n  ")}\n  Précise le fichier en 2e argument.`,
  );
}

/**
 * `vercel blob put` avec un env nettoyé (sans BLOB_STORE_ID -> évite le mode
 * OIDC), parse l'URL publique renvoyée.
 * @param {string} file
 * @param {string} pathname
 * @param {string} token
 * @returns {string}
 */
function uploadToBlob(file, pathname, token) {
  const childEnv = { ...process.env };
  delete childEnv.BLOB_STORE_ID; // sinon le CLI exige le couple OIDC -> erreur
  delete childEnv.BLOB_READ_WRITE_TOKEN; // passé en --rw-token, pas via l'env

  const res = spawnSync(
    "vercel",
    [
      "blob",
      "put",
      file,
      "--pathname",
      pathname,
      "--access",
      "public",
      "--allow-overwrite",
      "true",
      "--rw-token",
      token,
    ],
    { cwd: ROOT, env: childEnv, encoding: "utf8" },
  );

  // le CLI Vercel écrit « Success! <url> » sur stderr -> on lit les deux flux
  const output = [res.stdout, res.stderr].filter(Boolean).join("\n");
  if (res.error) die(`Échec du lancement de « vercel ».\n${res.error.message}`);
  if (res.status !== 0) {
    die(`Échec de l'upload Vercel Blob (code ${res.status}).\n${output.trim()}`);
  }

  const match = output.match(BLOB_HOST_RE);
  if (!match) {
    die(`Upload OK mais URL Blob introuvable dans la sortie :\n${output}`);
  }
  return match[0].replace(/[)"'.,]+$/, "");
}

/**
 * Patch branding.logo + branding.icon. Parse/stringify préserve l'ordre des
 * clés -> diff minimal (config en 2 espaces + newline final).
 * @param {string} file
 * @param {string} url
 */
function patchConfig(file, url) {
  const raw = fs.readFileSync(file, "utf8");
  /** @type {any} */
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (err) {
    die(`config.json illisible (JSON invalide) : ${err?.message || err}`);
  }
  cfg.branding = cfg.branding || {};
  const before = { logo: cfg.branding.logo, icon: cfg.branding.icon };
  cfg.branding.logo = url; // HEADER
  cfg.branding.icon = url; // FAVICON (même image)

  console.log(`${c.bold("logo")}    ${c.dim(before.logo || "(vide)")} -> ${url}`);
  console.log(`${c.bold("icon")}    ${c.dim(before.icon || "(vide)")} -> ${url}`);

  if (DRY_RUN) return;
  fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
  console.log(`${c.green("✔ config")} ${path.relative(ROOT, file)}`);
}

/**
 * Supprime l'image source. Si elle vient de `public/sites/<slug>` (ancien
 * schéma local), nettoie le dossier devenu inutile.
 * @param {string} sourceFile
 * @param {string} slug
 */
function cleanupLocal(sourceFile, slug) {
  const rel = path.relative(ROOT, sourceFile);
  const publicSiteDir = path.join(ROOT, "public", "sites", slug);
  const removePublicDir =
    fs.existsSync(publicSiteDir) && sourceFile.startsWith(publicSiteDir + path.sep);

  if (DRY_RUN) {
    console.log(c.yellow(`[dry-run] rm ${rel}`));
    if (removePublicDir) console.log(c.yellow(`[dry-run] rm -rf ${path.relative(ROOT, publicSiteDir)}`));
    return;
  }

  if (removePublicDir) {
    fs.rmSync(publicSiteDir, { recursive: true, force: true });
    console.log(`${c.green("✔ rm")}    ${path.relative(ROOT, publicSiteDir)} ${c.dim("(dossier local)")}`);
  } else {
    fs.rmSync(sourceFile, { force: true });
    console.log(`${c.green("✔ rm")}    ${rel}`);
  }
}
