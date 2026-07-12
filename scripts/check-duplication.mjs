#!/usr/bin/env node
/**
 * Contrôle croisé de duplication de contenu entre TOUS les sites du moteur
 * (démos et prospects compris) : détecte les séquences de 9 mots partagées
 * entre les configs de deux sites différents.
 *
 * Pourquoi : des textes identiques entre plusieurs sites du même moteur sont
 * l'empreinte « réseau de sites » la plus dangereuse pour Google (et ils
 * empêchent les clients de se différencier en SERP quand ils partagent une
 * zone). Constat de l'audit 2026-07 : la duplication revient TOUJOURS quand
 * plusieurs rédactions se font en parallèle — ce script est le seul juge.
 *
 * Usage :
 *   node scripts/check-duplication.mjs            # tout le parc
 *   node scripts/check-duplication.mjs <slug>     # paires impliquant <slug>
 * Sortie : liste des séquences par paire ; exit 1 s'il en reste.
 * Les chaînes techniques (URLs d'assets, cartes OSM) sont ignorées.
 */
import fs from "node:fs";
import path from "node:path";

const SITES_DIR = path.join(process.cwd(), "config", "sites");
const only = process.argv[2] ?? null;
const N = 9;
const TECH = ["https", "openstreetmap", "scw cloud", "xklic media", "wa me"];

function textsOf(slug) {
  const out = [];
  const dir = path.join(SITES_DIR, slug);
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const walk = (v) => {
      if (typeof v === "string" && v.length > 60) out.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  }
  return out;
}

function shingles(s) {
  const w = s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const set = new Set();
  for (let i = 0; i + N <= w.length; i++) set.add(w.slice(i, i + N).join(" "));
  return set;
}

const sites = fs
  .readdirSync(SITES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(SITES_DIR, e.name, "config.json")))
  .map((e) => e.name)
  .sort();

const sh = new Map(
  sites.map((s) => {
    const all = new Set();
    for (const t of textsOf(s)) for (const g of shingles(t)) all.add(g);
    return [s, all];
  }),
);

let total = 0;
for (let i = 0; i < sites.length; i++) {
  for (let j = i + 1; j < sites.length; j++) {
    const [a, b] = [sites[i], sites[j]];
    if (only && a !== only && b !== only) continue;
    const common = [...sh.get(a)].filter(
      (g) => sh.get(b).has(g) && !TECH.some((t) => g.includes(t)),
    );
    if (common.length) {
      total += common.length;
      console.log(`\n### ${a} × ${b} : ${common.length} séquence(s)`);
      for (const c of common.sort().slice(0, 40)) console.log("  -", c);
    }
  }
}

if (total) {
  console.error(`\n✗ ${total} séquence(s) de ${N} mots partagée(s) — à réécrire d'un côté.`);
  process.exit(1);
}
console.log(`\n✓ Aucune séquence de ${N} mots partagée entre les ${sites.length} sites.`);
