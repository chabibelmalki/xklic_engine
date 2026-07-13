#!/usr/bin/env node
// @ts-check
/**
 * Aligne un dossier agence (back-office) sur les données CANONIQUES d'un client,
 * la config engine étant la source de vérité. On lit un JSON d'entrée (produit à
 * la main / par Claude Code depuis `config/sites/<slug>/`), on compare au dossier
 * actuel, on affiche le DÉCALAGE, et — avec `--apply` — on pousse les valeurs en
 * base via l'upsert public par `ref`.
 *
 *   node scripts/sync-dossier.mjs <entree.json>            # DRY-RUN : montre le diff
 *   node scripts/sync-dossier.mjs <entree.json> --apply    # écrit en base
 *   cat entree.json | node scripts/sync-dossier.mjs -      # entrée via stdin
 *
 * Format de l'entrée :
 *   {
 *     "search": "SANAD CLEAN",        // nom d'entreprise, Ref ou OrderId
 *     "dossier": {                    // UNIQUEMENT les champs à aligner
 *       "email": "…", "telephone": "…", "adresse": "…", "siret": "…",
 *       "domaine": "sanadclean.fr",
 *       "facebook": "…", "instagram": "…", "tiktok": "…", "x": "…", "google": "…",
 *       "logo_urls": ["https://…"], "photo_urls": ["https://…"],
 *       "ville": "…", "pays": "…", "metier": "…", "ambiance": "…", "couleurs": ["…"]
 *       // … n'importe quel champ du dossier ; absent = pas touché (coalesce serveur)
 *     }
 *   }
 *
 * SÉCURITÉ : l'upsert public n'écrit QUE les champs fournis (coalesce : un champ
 * absent n'est pas touché) et NE TOUCHE JAMAIS au paiement (aucun `payment`
 * envoyé ; les clés paiement éventuelles sont retirées de l'entrée par prudence).
 * Le statut commande/production est renvoyé tel quel (lu sur le dossier).
 *
 * Env (.env.local) : BACKOFFICE_API_URL, BACKOFFICE_API_KEY (header X-API-Key).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, loadEnvLocal, die } from "./onboard/util.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal(ROOT);

const API = (process.env.BACKOFFICE_API_URL?.trim() || "").replace(/\/$/, "");
const KEY = process.env.BACKOFFICE_API_KEY?.trim();
if (!API) die("BACKOFFICE_API_URL manquante dans .env.local.");
if (!KEY) die("BACKOFFICE_API_KEY manquante dans .env.local.");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const inputArg = args.find((a) => !a.startsWith("-"));
if (!inputArg) die('Usage : node scripts/sync-dossier.mjs <entree.json | -> [--apply]');

// Jamais poussées par le sync : le paiement reste la chasse gardée de la vitrine.
const PAYMENT_KEYS = new Set(["promo_code", "discount_cents", "payment", "payments"]);

/** @param {string} method @param {string} pathname @param {any} [body] */
async function api(method, pathname, body) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: { "X-API-Key": KEY, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) die(`Back-office ${res.status} ${method} ${pathname} : ${await res.text().catch(() => "")}`);
  return res.json();
}

// ── 1) Lire l'entrée ─────────────────────────────────────────────────────────
const raw = inputArg === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(inputArg, "utf8");
let input;
try {
  input = JSON.parse(raw);
} catch (e) {
  die(`Entrée JSON invalide : ${e.message}`);
}
const search = String(input.search || "").trim();
if (!search) die('L\'entrée doit contenir "search" (nom d\'entreprise, Ref ou OrderId).');
const patch = { ...(input.dossier || {}) };
for (const k of PAYMENT_KEYS) delete patch[k]; // garde-fou paiement
if (!Object.keys(patch).length) die('L\'entrée ne contient aucun champ "dossier" à aligner.');

// ── 2) Trouver le dossier (recherche + désambiguïsation par nom exact) ────────
const found = await api("GET", `/v1/public/agency/orders?q=${encodeURIComponent(search)}`);
const matches = Array.isArray(found) ? found : (found?.orders ?? found?.results ?? []);
let match;
if (matches.length === 0) {
  die(`Aucun dossier ne correspond à « ${search} ».`);
} else if (matches.length === 1) {
  match = matches[0];
} else {
  const exact = matches.filter((r) => String(r.entreprise || "").toLowerCase() === search.toLowerCase());
  if (exact.length === 1) match = exact[0];
  else {
    console.error(c.yellow(`Plusieurs dossiers correspondent à « ${search} » — précise le nom exact / la Ref :`));
    for (const r of matches) console.error(`  • ${r.entreprise}  ${c.dim("(Ref " + r.ref + ")")}`);
    process.exit(2);
  }
}

const before = (await api("GET", `/v1/public/agency/orders/${encodeURIComponent(match.ref)}`)).order;

// ── 3) Calculer le décalage (champ par champ) ────────────────────────────────
// Normalise les dates ISO (l'API renvoie "2029-06-23T00:00:00Z", l'entrée
// "2029-06-23") pour éviter un faux « non appliqué » sur les champs date.
const norm = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) ? v.slice(0, 10) : v);
const same = (a, b) => JSON.stringify(norm(a) ?? null) === JSON.stringify(norm(b) ?? null);
const show = (v) => (Array.isArray(v) ? `[${v.join(", ")}]` : v === "" || v == null ? c.dim("∅") : String(v));
const changes = [];
for (const [k, v] of Object.entries(patch)) {
  if (!same(before[k], v)) changes.push([k, before[k], v]);
}

console.error(
  "\n" + c.bold(c.cyan(`🔄 ${before.entreprise}`)) + `  ${c.dim("Ref " + before.ref)}` +
  `  ${c.dim("· statut " + before.statut_commande + "/" + (before.statut_production || "—"))}\n`,
);
if (!changes.length) {
  console.error(c.green("✓ Déjà aligné — aucun champ à modifier.\n"));
  process.exit(0);
}
console.error(c.bold(`Décalage (${changes.length} champ${changes.length > 1 ? "s" : ""}) :`));
for (const [k, oldV, newV] of changes) {
  console.error(`  ${c.bold(k)}\n    - actuel : ${show(oldV)}\n    + config : ${c.green(show(newV))}`);
}
console.error("");

// ── 4) Appliquer (ou dry-run) ────────────────────────────────────────────────
if (!apply) {
  console.error(c.yellow("DRY-RUN — rien écrit. Relance avec --apply pour pousser en base.\n"));
  process.exit(0);
}

// Upsert par ref : statut renvoyé tel quel (pas de changement de statut), dossier
// = uniquement les champs fournis (coalesce serveur), paiement intact.
const res = await api("POST", "/v1/public/agency/orders", {
  ref: before.ref,
  statut: before.statut_commande,
  dossier: patch,
  source: "sync", // versioning : étiquette la version créée côté back-office
});
const after = (await api("GET", `/v1/public/agency/orders/${encodeURIComponent(res.ref || before.ref)}`)).order;

const stillOff = changes.filter(([k, , newV]) => !same(after[k], newV));
if (stillOff.length) {
  console.error(c.red(`⚠ ${stillOff.length} champ(s) NON appliqués : ${stillOff.map(([k]) => k).join(", ")}`));
  process.exitCode = 1;
} else {
  console.error(c.green(`✓ Aligné — ${changes.length} champ(s) écrits en base. Paiement intact.\n`));
}
console.log(JSON.stringify({ ref: after.ref, applied: changes.map(([k]) => k) }, null, 2));
