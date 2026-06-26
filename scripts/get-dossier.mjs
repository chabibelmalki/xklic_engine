#!/usr/bin/env node
// @ts-check
/**
 * Récupère le dossier client COMPLET depuis Baserow (fiche + tables liées).
 *
 *   node scripts/get-dossier.mjs "<recherche>"     (nom d'entreprise, Ref, OrderId…)
 *   npm run dossier:get -- "Casa Clean"
 *
 * Suit les liens natifs du Dossier pour rassembler Paiements / Production /
 * Notes / Produits, puis sort un JSON propre sur stdout :
 *   { dossier, paiements, production, notes, produits }
 * Les menus déroulants et les liens sont aplatis (valeurs lisibles), prêt à
 * exploiter pour construire / mettre à jour le site du client.
 *
 * Un résumé lisible est imprimé sur stderr ; stdout ne contient QUE le JSON.
 *
 * Env (lues depuis .env.local) :
 *   BASEROW_TOKEN (requis),
 *   BASEROW_TABLE_DOSSIERS (requis) + _PAIEMENTS / _PRODUCTION / _NOTES / _PRODUITS,
 *   BASEROW_API_URL (opt, défaut https://api.baserow.io).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, loadEnvLocal, die } from "./onboard/util.mjs";

// Racine du moteur résolue depuis l'emplacement du script (robuste au cwd).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal(ROOT);

const API = (process.env.BASEROW_API_URL?.trim() || "https://api.baserow.io").replace(/\/$/, "");
const TOKEN = process.env.BASEROW_TOKEN?.trim();
const TABLES = {
  dossiers: process.env.BASEROW_TABLE_DOSSIERS?.trim(),
  paiements: process.env.BASEROW_TABLE_PAIEMENTS?.trim(),
  production: process.env.BASEROW_TABLE_PRODUCTION?.trim(),
  notes: process.env.BASEROW_TABLE_NOTES?.trim(),
  produits: process.env.BASEROW_TABLE_PRODUITS?.trim(),
};

const term = process.argv
  .slice(2)
  .filter((a) => !a.startsWith("-"))
  .join(" ")
  .trim();

if (!term) die('Usage : node scripts/get-dossier.mjs "<nom d\'entreprise ou Ref>"');
if (!TOKEN) die("BASEROW_TOKEN manquant dans .env.local.");
if (!TABLES.dossiers) die("BASEROW_TABLE_DOSSIERS manquant dans .env.local.");

const HEADERS = { Authorization: `Token ${TOKEN}` };

/** @param {string} url */
async function api(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) die(`Baserow ${res.status} : ${await res.text().catch(() => "")}`);
  return res.json();
}

const rowsUrl = (/** @type {string} */ tbl, qs = "") =>
  `${API}/api/database/rows/table/${tbl}/?user_field_names=true${qs}`;

// Aplatit une cellule : menu déroulant -> valeur ; lien -> [valeurs] ; sinon brut.
function flat(v) {
  if (v == null) return v;
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === "object" && "value" in x ? x.value : x));
  if (typeof v === "object" && "value" in v) return v.value;
  return v;
}

/** Nettoie une ligne (retire le bruit Baserow + champs demandés). */
function cleanRow(row, drop = []) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === "order" || drop.includes(k)) continue;
    out[k] = flat(v);
  }
  return out;
}

/** Récupère les lignes liées d'une table satellite par leurs ids. */
async function linkedRows(/** @type {string|undefined} */ tbl, /** @type {number[]} */ ids) {
  if (!tbl || !ids.length) return [];
  const out = [];
  for (const id of ids) {
    const row = await api(`${API}/api/database/rows/table/${tbl}/${id}/?user_field_names=true`);
    out.push(cleanRow(row, ["Fiche"])); // « Fiche » = lien retour vers le Dossier, redondant ici
  }
  return out;
}

// 1) Trouver le dossier (recherche plein-texte, puis désambiguïsation).
const matches = (await api(rowsUrl(TABLES.dossiers, `&search=${encodeURIComponent(term)}&size=50`))).results ?? [];

let dossier;
if (matches.length === 0) {
  die(`Aucun dossier ne correspond à « ${term} ».`);
} else if (matches.length === 1) {
  dossier = matches[0];
} else {
  const exact = matches.filter((r) => String(r.Entreprise || "").toLowerCase() === term.toLowerCase());
  if (exact.length === 1) {
    dossier = exact[0];
  } else {
    console.error(c.yellow(`Plusieurs dossiers correspondent à « ${term} » — précise le nom exact :`));
    for (const r of matches) {
      console.error(`  • ${r.Entreprise}  ${c.dim("(Ref " + r.Ref + ")")}  [${flat(r["Statut commande"])}]`);
    }
    process.exit(2);
  }
}

// 2) Suivre les liens natifs vers les tables satellites.
const linkIds = (field) => (Array.isArray(dossier[field]) ? dossier[field].map((x) => x.id) : []);

const result = {
  dossier: cleanRow(dossier, ["Paiements", "Production", "Notes", "Produits"]),
  paiements: await linkedRows(TABLES.paiements, linkIds("Paiements")),
  production: await linkedRows(TABLES.production, linkIds("Production")),
  notes: await linkedRows(TABLES.notes, linkIds("Notes")),
  produits: await linkedRows(TABLES.produits, linkIds("Produits")),
};

// 3) Résumé lisible (stderr) + JSON complet (stdout).
const d = result.dossier;
console.error(
  "\n" +
    c.bold(c.cyan(`📋 ${d.Entreprise}`)) +
    `  ${c.dim("Ref " + d.Ref)}\n` +
    `   commande: ${c.bold(String(d["Statut commande"]))}   ·   production: ${c.bold(String(d["Statut production"]))}\n` +
    `   ${d.Metier || "—"} · ${d.Ville || "—"} · ${d.Email || "—"} · ${d.Telephone || "—"}\n` +
    `   liés → paiements:${result.paiements.length}  production:${result.production.length}  notes:${result.notes.length}  produits:${result.produits.length}\n`,
);
console.log(JSON.stringify(result, null, 2));
