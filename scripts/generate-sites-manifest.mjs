#!/usr/bin/env node
// @ts-check
/**
 * Génère le MANIFESTE edge-safe importé par le proxy (src/proxy.ts).
 *
 * Le proxy tourne en amont du rendu (potentiellement déployé sur CDN) et ne
 * doit PAS lire le disque : il importe des structures statiques. Ce script
 * scanne `config/sites/<slug>/config.json` et écrit `src/lib/sites-manifest.ts`,
 * qui expose :
 *   - SITE_SLUGS / SITE_SLUG_SET : slugs valides (= sous-domaines) ;
 *   - CUSTOM_DOMAINS : host perso (apex + variantes) -> slug, pour la résolution ;
 *   - CANONICAL_DOMAIN : slug -> apex canonique, pour les redirections 301 SEO.
 *
 * Un slug est valide selon les mêmes règles que le chargeur de config
 * (src/lib/config-loader.ts) : un DOSSIER contenant un `config.json`. Les
 * domaines perso viennent de `customDomains` (apex en premier), avec repli sur
 * le champ legacy `domain` — même règle que `canonicalDomain` dans lib/urls.ts.
 *
 * Branché sur `prebuild` et `predev` → toujours à jour avant build/dev.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITES_DIR = path.join(ROOT, "config", "sites");
const OUT_FILE = path.join(ROOT, "src", "lib", "sites-manifest.ts");
const BASE_FILE = "config.json";

/** Réduit une valeur de domaine (URL, host:port, host/path) à un host nu. */
function bareHost(raw) {
  return String(raw)
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
}

/**
 * Scanne les sites.
 * @returns {{ slugs: string[], customDomains: Record<string,string>, canonical: Record<string,string> }}
 */
function readSites() {
  if (!fs.existsSync(SITES_DIR)) {
    console.warn(`[manifest] ${SITES_DIR} introuvable — manifeste vide.`);
    return { slugs: [], customDomains: {}, canonical: {} };
  }
  const slugs = [];
  /** @type {Record<string,string>} */
  const customDomains = {};
  /** @type {Record<string,string>} */
  const canonical = {};

  for (const entry of fs.readdirSync(SITES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue; // un client = un DOSSIER
    const slug = entry.name;
    const configPath = path.join(SITES_DIR, slug, BASE_FILE);
    if (!fs.existsSync(configPath)) {
      console.warn(`[manifest] ${slug}/ : pas de ${BASE_FILE}, ignoré.`);
      continue;
    }
    slugs.push(slug);

    let cfg;
    try {
      cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.warn(
        `[manifest] ${slug}/${BASE_FILE} : JSON invalide, domaines perso ignorés — ${e.message}`,
      );
      continue;
    }

    // Domaines perso : customDomains (apex en premier), repli sur `domain` legacy.
    const hosts = Array.isArray(cfg.customDomains)
      ? cfg.customDomains
      : cfg.domain
        ? [cfg.domain]
        : [];
    const cleaned = hosts.map(bareHost).filter(Boolean);
    if (!cleaned.length) continue;

    canonical[slug] = cleaned[0]; // apex canonique
    for (const host of cleaned) {
      if (customDomains[host] && customDomains[host] !== slug) {
        console.warn(
          `[manifest] conflit : "${host}" déclaré par "${customDomains[host]}" ET "${slug}" — on garde "${customDomains[host]}".`,
        );
        continue;
      }
      customDomains[host] = slug;
    }
  }

  return { slugs: [...new Set(slugs)].sort(), customDomains, canonical };
}

/** Rend un `Record<string,string>` trié par clé en littéral TS indenté. */
function renderRecord(rec) {
  const keys = Object.keys(rec).sort();
  if (!keys.length) return "{}";
  const body = keys
    .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(rec[k])},`)
    .join("\n");
  return `{\n${body}\n}`;
}

function render({ slugs, customDomains, canonical }) {
  const list = slugs.map((s) => `  ${JSON.stringify(s)},`).join("\n");
  return `// @generated par scripts/generate-sites-manifest.mjs — NE PAS ÉDITER À LA MAIN.
// Régénéré automatiquement via les scripts npm "prebuild" et "predev".
//
// Structures statiques importées par le proxy (src/proxy.ts), qui tourne en
// amont du rendu sans accès au système de fichiers.

export const SITE_SLUGS: string[] = [
${list}
];

/** Lookup O(1) pour le proxy. */
export const SITE_SLUG_SET: ReadonlySet<string> = new Set(SITE_SLUGS);

/**
 * Domaine perso (host : apex + variantes, ex. "www…") -> slug du site.
 * Sert à la RÉSOLUTION entrante du tenant par Host complet dans le proxy.
 */
export const CUSTOM_DOMAINS: Readonly<Record<string, string>> = ${renderRecord(customDomains)};

/**
 * slug -> domaine CANONIQUE (apex perso = customDomains[0]).
 * Sert aux redirections 301 SEO (variante/sous-domaine -> apex).
 */
export const CANONICAL_DOMAIN: Readonly<Record<string, string>> = ${renderRecord(canonical)};
`;
}

function main() {
  const sites = readSites();
  const { slugs, customDomains } = sites;
  const next = render(sites);

  // Idempotent : n'écrit que si le contenu change (évite de salir mtime / HMR).
  const prev = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : null;
  if (prev === next) {
    console.log(`[manifest] à jour (${slugs.length} slugs) — aucune écriture.`);
    return;
  }
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, next, "utf8");
  const nbDomains = Object.keys(customDomains).length;
  console.log(
    `[manifest] écrit ${path.relative(ROOT, OUT_FILE)} — ${slugs.length} slugs, ${nbDomains} domaine(s) perso : ${slugs.join(", ") || "(aucun)"}`,
  );
}

main();
