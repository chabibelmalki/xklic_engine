#!/usr/bin/env node
/**
 * Contrôle post-deploy : la balise <link rel="canonical"> de CHAQUE site live
 * (accueil + accueil de chaque langue) doit pointer sur son domaine canonique
 * (customDomains[0], sinon <slug>.xklic.com). Garde-fou du bug historique où
 * les pages localisées se canonicalisaient sur le sous-domaine xklic.com
 * (locale sans customDomains / prérendu sous le mauvais host).
 *
 * Usage : node scripts/check-canonicals.mjs [--slug <slug>]
 * Sortie : une ligne par URL testée ; exit 1 si au moins un canonical est faux.
 */
import fs from "node:fs";
import path from "node:path";

const SITES_DIR = path.join(process.cwd(), "config", "sites");
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "xklic.com";
const only = (() => {
  const i = process.argv.indexOf("--slug");
  return i === -1 ? null : process.argv[i + 1];
})();

function canonicalOrigin(cfg, slug) {
  const raw = cfg.customDomains?.[0]?.trim() || cfg.domain?.trim();
  if (!raw) return `https://${slug}.${ROOT_DOMAIN}`;
  const host = raw
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
  return `https://${host}`;
}

async function canonicalOf(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "xklic-check-canonicals" },
    redirect: "follow",
  });
  if (!res.ok) return { error: `HTTP ${res.status}` };
  const html = await res.text();
  const m = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)
    ?? html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i);
  return m ? { canonical: m[1] } : { error: "canonical absent" };
}

let failures = 0;
for (const slug of fs.readdirSync(SITES_DIR)) {
  if (only && slug !== only) continue;
  const basePath = path.join(SITES_DIR, slug, "config.json");
  if (!fs.existsSync(basePath)) continue;
  const cfg = JSON.parse(fs.readFileSync(basePath, "utf8"));
  if (cfg.noindexSite) continue; // hors index : canonical sans enjeu
  const origin = canonicalOrigin(cfg, slug);
  const def = cfg.i18n?.default ?? "fr";
  const locales = cfg.i18n?.languages ?? [def];
  const paths = locales.map((l) => (l === def ? "/" : `/${l}`));

  for (const p of paths) {
    const url = p === "/" ? origin : `${origin}${p}`;
    try {
      const { canonical, error } = await canonicalOf(url);
      if (error) {
        failures++;
        console.error(`✗ ${url} — ${error}`);
      } else if (!canonical.startsWith(origin)) {
        failures++;
        console.error(`✗ ${url} — canonical=${canonical} (attendu ${origin}…)`);
      } else {
        console.log(`✓ ${url} — canonical OK`);
      }
    } catch (e) {
      failures++;
      console.error(`✗ ${url} — ${e.message}`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} canonical(s) en échec.`);
  process.exit(1);
}
console.log("\nTous les canonicals sont corrects.");
