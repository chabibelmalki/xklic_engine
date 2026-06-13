#!/usr/bin/env node
// @ts-check
/**
 * Génère le MANIFESTE DE SLUGS edge-safe importé par le proxy (src/proxy.ts).
 *
 * Le proxy tourne en amont du rendu (potentiellement déployé sur CDN) et ne
 * doit PAS lire le disque : il importe une liste statique de slugs. Ce script
 * scanne `config/sites/<slug>/` et écrit `src/lib/sites-manifest.ts`.
 *
 * Un slug est valide selon les mêmes règles que le chargeur de config
 * (src/lib/config-loader.ts) : un DOSSIER contenant un `config.json`.
 *
 * Branché sur `prebuild` et `predev` → toujours à jour avant build/dev.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITES_DIR = path.join(ROOT, "config", "sites");
const OUT_FILE = path.join(ROOT, "src", "lib", "sites-manifest.ts");
const BASE_FILE = "config.json";

/** @returns {string[]} slugs valides, triés, dédupliqués */
function readSlugs() {
  if (!fs.existsSync(SITES_DIR)) {
    console.warn(`[manifest] ${SITES_DIR} introuvable — manifeste vide.`);
    return [];
  }
  const slugs = [];
  for (const entry of fs.readdirSync(SITES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue; // un client = un DOSSIER
    const hasConfig = fs.existsSync(path.join(SITES_DIR, entry.name, BASE_FILE));
    if (!hasConfig) {
      console.warn(`[manifest] ${entry.name}/ : pas de ${BASE_FILE}, ignoré.`);
      continue;
    }
    slugs.push(entry.name);
  }
  return [...new Set(slugs)].sort();
}

function render(slugs) {
  const list = slugs.map((s) => `  ${JSON.stringify(s)},`).join("\n");
  return `// @generated par scripts/generate-sites-manifest.mjs — NE PAS ÉDITER À LA MAIN.
// Régénéré automatiquement via les scripts npm "prebuild" et "predev".
//
// Liste statique des slugs de sites valides (= dossiers config/sites/<slug>/
// contenant un config.json). Importée par le proxy (src/proxy.ts), qui tourne
// en amont du rendu sans accès au système de fichiers.

export const SITE_SLUGS: string[] = [
${list}
];

/** Lookup O(1) pour le proxy. */
export const SITE_SLUG_SET: ReadonlySet<string> = new Set(SITE_SLUGS);
`;
}

function main() {
  const slugs = readSlugs();
  const next = render(slugs);

  // Idempotent : n'écrit que si le contenu change (évite de salir mtime / HMR).
  const prev = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : null;
  if (prev === next) {
    console.log(`[manifest] à jour (${slugs.length} slugs) — aucune écriture.`);
    return;
  }
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, next, "utf8");
  console.log(
    `[manifest] écrit ${path.relative(ROOT, OUT_FILE)} — ${slugs.length} slugs : ${slugs.join(", ") || "(aucun)"}`,
  );
}

main();
