#!/usr/bin/env node
// @ts-check
/**
 * Héberge un fichier quelconque sur Vercel Blob et IMPRIME l'URL publique.
 * Ne touche à AUCUNE config : c'est un utilitaire bas niveau « upload -> URL ».
 *
 *   node scripts/upload-blob.mjs <fichier> [pathname]
 *
 *   ex : node scripts/upload-blob.mjs .temp/photo.png parfait-menage-26/apropos.png
 *
 * - <fichier>  : chemin local (relatif à la racine du repo ou absolu).
 * - [pathname] : destination dans le store Blob. Si omis : <basename> tel quel.
 *
 * La dernière ligne de stdout est l'URL seule (parsable par un autre script).
 *
 * Token : BLOB_READ_WRITE_TOKEN, lu depuis `.env.local` (jamais commité).
 *         Passé en `--rw-token` ; on retire BLOB_STORE_ID de l'env de l'enfant
 *         pour ne pas déclencher le mode OIDC du CLI (« must both be set »).
 *
 * `--dry-run` : montre la commande, n'upload rien.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { c, loadEnvLocal, die } from "./onboard/util.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");
const args = process.argv.slice(2).filter((a) => a !== "--dry-run");

const BLOB_HOST_RE = /https:\/\/[^\s"']*\.public\.blob\.vercel-storage\.com\/\S+/;

loadEnvLocal(ROOT);

// --- args -----------------------------------------------------------------
const fileArg = args[0]?.trim();
if (!fileArg) {
  die(
    "Usage : node scripts/upload-blob.mjs <fichier> [pathname]\n" +
      "  ex : node scripts/upload-blob.mjs .temp/photo.png parfait-menage-26/apropos.png\n" +
      "  (la dernière ligne de sortie = l'URL publique seule)",
  );
}

const sourceFile = path.resolve(ROOT, fileArg);
if (!fs.existsSync(sourceFile) || !fs.statSync(sourceFile).isFile()) {
  die(`Fichier introuvable : ${fileArg}`);
}

const pathname = (args[1]?.trim() || path.basename(sourceFile)).replace(/^\/+/, "");

console.log(`${c.bold("source")}    ${path.relative(ROOT, sourceFile)}`);
console.log(`${c.bold("pathname")}  ${pathname}`);

// --- upload ----------------------------------------------------------------
const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();
if (!token) {
  die(
    "BLOB_READ_WRITE_TOKEN manquant dans .env.local.\n" +
      "  Ajoute-le :  echo 'BLOB_READ_WRITE_TOKEN=vercel_blob_rw_…' >> .env.local",
  );
}

if (DRY_RUN) {
  console.log(c.yellow(`[dry-run] vercel blob put ${path.relative(ROOT, sourceFile)} --pathname ${pathname}`));
  console.log(c.yellow("[dry-run] terminé — rien n'a été uploadé."));
  process.exit(0);
}

console.log(c.dim(`↑ upload  ${pathname} …`));
const url = uploadToBlob(sourceFile, pathname, token);
console.log(`${c.green("✔ blob")}    ${url}`);
// dernière ligne = URL seule, pour réutilisation par un autre script/pipe
console.log(url);

// =========================================================================
// helper (miroir de upload-logo.mjs)
// =========================================================================

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

  const output = [res.stdout, res.stderr].filter(Boolean).join("\n");
  if (res.error) die(`Échec du lancement de « vercel ».\n${res.error.message}`);
  if (res.status !== 0) {
    die(`Échec de l'upload Vercel Blob (code ${res.status}).\n${output.trim()}`);
  }

  const match = output.match(BLOB_HOST_RE);
  if (!match) die(`Upload OK mais URL Blob introuvable dans la sortie :\n${output}`);
  return match[0].replace(/[)"'.,]+$/, "");
}
