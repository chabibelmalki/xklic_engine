#!/usr/bin/env node
// @ts-check
/**
 * Héberge un fichier quelconque sur le stockage objet Scaleway et IMPRIME l'URL
 * publique. Ne touche à AUCUNE config : utilitaire bas niveau « upload -> URL ».
 *
 *   node scripts/upload-blob.mjs <fichier> [pathname]
 *
 *   ex : node scripts/upload-blob.mjs .temp/photo.png parfait-menage-26/apropos.png
 *
 * - <fichier>  : chemin local (relatif à la racine du repo ou absolu).
 * - [pathname] : destination DANS le préfixe « sites/ » du bucket. Si omis :
 *                <basename> tel quel. Ne pas préfixer par « sites/ » soi-même.
 *
 * La dernière ligne de stdout est l'URL seule (parsable par un autre script).
 *
 * Credentials : S3_* + MEDIA_BASE_URL, lus depuis `.env.local` (jamais commités).
 *
 * `--dry-run` : montre ce qui serait fait, n'upload rien.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, loadEnvLocal, die } from "./onboard/util.mjs";
import { scalewayFromEnv, contentTypeFor, SITES_PREFIX } from "./lib/scaleway.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");
const args = process.argv.slice(2).filter((a) => a !== "--dry-run");

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

// pathname relatif -> clé sous « sites/ ». On retire un éventuel « sites/ » de
// tête pour éviter le doublon si l'appelant l'a déjà mis.
const rel = (args[1]?.trim() || path.basename(sourceFile))
  .replace(/^\/+/, "")
  .replace(new RegExp(`^${SITES_PREFIX}/`), "");
const key = `${SITES_PREFIX}/${rel}`;

console.log(`${c.bold("source")}    ${path.relative(ROOT, sourceFile)}`);
console.log(`${c.bold("key")}       ${key}`);

// --- upload ----------------------------------------------------------------
const s3 = scalewayFromEnv();

if (DRY_RUN) {
  console.log(c.yellow(`[dry-run] s3 put ${key} -> ${s3.publicURL(key)}`));
  console.log(c.yellow("[dry-run] terminé — rien n'a été uploadé."));
  process.exit(0);
}

console.log(c.dim(`↑ upload  ${key} …`));
const data = fs.readFileSync(sourceFile);
const url = await s3.upload(key, data, contentTypeFor(path.extname(sourceFile)));
console.log(`${c.green("✔ scaleway")} ${url}`);
// dernière ligne = URL seule, pour réutilisation par un autre script/pipe
console.log(url);
