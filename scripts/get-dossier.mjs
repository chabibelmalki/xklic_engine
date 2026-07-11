#!/usr/bin/env node
// @ts-check
/**
 * Récupère le dossier client COMPLET depuis le back-office (API Go → Postgres).
 *
 *   node scripts/get-dossier.mjs "<recherche>"     (nom d'entreprise, Ref, OrderId…)
 *   npm run dossier:get -- "Casa Clean"
 *
 * Interroge `GET /v1/public/agency/orders?q=<term>` (recherche : Ref exacte OU
 * entreprise partielle), désambiguïse si besoin, puis
 * `GET /v1/public/agency/orders/{ref}` pour rassembler Paiements / Production /
 * Notes / Produits. Sort un JSON propre sur stdout :
 *   { dossier, paiements, production, notes, produits }
 * Les colonnes snake_case de l'API sont mappées vers les libellés historiques
 * (`Ref`, `Entreprise`, `Statut commande`…), booléens → oui/non, tableaux
 * joints par « , » — même format qu'avant, prêt à exploiter pour construire /
 * mettre à jour le site du client (le playbook NEWCLIENT reste valide tel quel).
 *
 * Un résumé lisible est imprimé sur stderr ; stdout ne contient QUE le JSON.
 *
 * Env (lues depuis .env.local) :
 *   BACKOFFICE_API_URL (requis, base de l'API Go, sans slash final),
 *   BACKOFFICE_API_KEY (requis, header X-API-Key).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, loadEnvLocal, die } from "./onboard/util.mjs";

// Racine du moteur résolue depuis l'emplacement du script (robuste au cwd).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal(ROOT);

const API = (process.env.BACKOFFICE_API_URL?.trim() || "").replace(/\/$/, "");
const KEY = process.env.BACKOFFICE_API_KEY?.trim();

const term = process.argv
  .slice(2)
  .filter((a) => !a.startsWith("-"))
  .join(" ")
  .trim();

if (!term) die('Usage : node scripts/get-dossier.mjs "<nom d\'entreprise ou Ref>"');
if (!API) die("BACKOFFICE_API_URL manquante dans .env.local.");
if (!KEY) die("BACKOFFICE_API_KEY manquante dans .env.local.");

/** @param {string} pathname */
async function api(pathname) {
  const res = await fetch(`${API}${pathname}`, { headers: { "X-API-Key": KEY } });
  if (!res.ok) die(`Back-office ${res.status} : ${await res.text().catch(() => "")}`);
  return res.json();
}

/* ------------------------------------------------------------------------- *
 * Mise en forme « historique » (libellés d'origine des dossiers) — la sortie
 * du script fait partie du contrat avec le playbook NEWCLIENT : on n'en
 * change pas.
 * ------------------------------------------------------------------------- */

/** Booléen API → "oui"/"non" (null/undefined → ""). */
const ouiNon = (v) => (v == null ? "" : v ? "oui" : "non");

/** Rend une valeur API lisible : tableaux joints par ", ", objets aplatis. */
function human(v) {
  if (v == null) return v;
  if (Array.isArray(v)) return v.map((x) => human(x)).join(", ");
  if (typeof v === "object") return "value" in v ? v.value : v;
  return v;
}

/**
 * Mapping colonnes `agency_orders` (snake_case) → libellés historiques.
 * `[label, transform]` — transform optionnelle appliquée à la valeur brute.
 */
const DOSSIER_LABELS = {
  ref: ["Ref"],
  entreprise: ["Entreprise"],
  // Slug déterministe figé sur le dossier : à reprendre TEL QUEL pour
  // config/sites/<slug> (sinon /config ne matchera pas le tenant).
  tenant_slug: ["Slug"],
  statut_commande: ["Statut commande"],
  statut_production: ["Statut production"],
  formule: ["Formule"],
  metier: ["Metier"],
  ville: ["Ville"],
  pays: ["Pays"],
  type_activite: ["Type"],
  se_deplace: ["Se deplace", ouiNon],
  zone_deplacement: ["Zone deplacement"],
  prestations: ["Prestations"],
  telephone: ["Telephone"],
  whatsapp: ["WhatsApp", ouiNon],
  email: ["Email"],
  local_boutique: ["Local/Boutique", ouiNon],
  adresse: ["Adresse"],
  disponibilites: ["Disponibilites"],
  siret: ["SIRET"],
  langues: ["Langues"],
  couleurs: ["Couleur"],
  ambiance: ["Ambiance"],
  logo_urls: ["Logo"],
  photo_urls: ["Photos"],
  facebook: ["Facebook"],
  instagram: ["Instagram"],
  tiktok: ["TikTok"],
  x: ["X"],
  google: ["Google"],
  extra: ["Extra"],
};

/**
 * Colonnes techniques de l'API (ids internes, provenance de migration,
 * timestamps), sans intérêt pour la config client.
 */
const INTERNAL_EXACT = new Set(["id", "created_at", "updated_at", "imported_at", "position"]);
const isInternalKey = (k) => INTERNAL_EXACT.has(k) || k.endsWith("_id") || k.endsWith("_ref");

/** Applique un mapping de libellés à une ligne API ; les clés inconnues passent telles quelles. */
function relabel(row, labels) {
  const out = {};
  for (const [k, v] of Object.entries(row ?? {})) {
    if (isInternalKey(k)) continue;
    const spec = labels[k];
    if (spec) {
      const [label, transform] = spec;
      out[label] = transform ? transform(v) : human(v);
    } else {
      out[k] = human(v);
    }
  }
  return out;
}

function mapDossier(row) {
  const out = relabel(row, DOSSIER_LABELS);
  // Historique : `OrderId` doublait `Ref` dans la fiche du dossier.
  if (out.Ref && out.OrderId == null) out.OrderId = out.Ref;
  return out;
}

const PAIEMENT_LABELS = {
  ref: ["Dossier"],
  amount_cents: ["Montant", (v) => (typeof v === "number" ? (v / 100).toFixed(2) : "")],
  promo_code: ["CodePromo"],
  stripe_session: ["SessionStripe"],
  stripe_subscription: ["AbonnementStripe"],
};

function mapPaiement(row, dossier) {
  const out = relabel(row, PAIEMENT_LABELS);
  if (out.Dossier == null) out.Dossier = dossier.Ref ?? "";
  if (out.Entreprise == null) out.Entreprise = dossier.Entreprise ?? "";
  return out;
}

const PRODUIT_LABELS = {
  ref: ["Dossier"],
  titre: ["Titre"],
  description: ["Description"],
  prix: ["Prix"],
  prix_cents: ["prix_cents"], // pas de libellé historique — gardé tel quel si présent
  categorie: ["Categorie"],
};

function mapProduit(row, dossier) {
  const out = relabel(row, PRODUIT_LABELS);
  if (out.Dossier == null) out.Dossier = dossier.Ref ?? "";
  if (out.Entreprise == null) out.Entreprise = dossier.Entreprise ?? "";
  return out;
}

/**
 * Notes / Production : la colonne `fields` (jsonb) contient TOUS les champs
 * d'origine (import lossless, libellés historiques). On la déplie, puis on
 * fusionne les champs promus par l'API (ref/body/author/statut) sans écraser ni
 * dupliquer une valeur déjà présente (cas des lignes migrées).
 */
function mapSatellite(row, dossier) {
  const out = {};
  for (const [k, v] of Object.entries(row?.fields ?? {})) {
    if (k === "order" || k === "Fiche") continue; // bruit d'import + lien retour redondant
    out[k] = human(v);
  }
  const seen = new Set(Object.values(out).map((v) => String(v)));
  const promote = (key, value) => {
    if (value == null || value === "" || seen.has(String(value))) return;
    if (out[key] === undefined) out[key] = human(value);
  };
  promote("Dossier", row?.ref || dossier.Ref);
  promote("body", row?.body);
  promote("author", row?.author);
  promote("statut", row?.statut);
  return out;
}

/* ------------------------------------------------------------------------- *
 * 1) Trouver le dossier (recherche, puis désambiguïsation par nom exact).
 * ------------------------------------------------------------------------- */

const found = await api(`/v1/public/agency/orders?q=${encodeURIComponent(term)}`);
/** Tolérant sur l'enveloppe : tableau nu, {orders} ou {results}. */
const matches = Array.isArray(found) ? found : (found?.orders ?? found?.results ?? []);

let match;
if (matches.length === 0) {
  die(`Aucun dossier ne correspond à « ${term} ».`);
} else if (matches.length === 1) {
  match = matches[0];
} else {
  const exact = matches.filter(
    (r) => String(r.entreprise || "").toLowerCase() === term.toLowerCase(),
  );
  if (exact.length === 1) {
    match = exact[0];
  } else {
    console.error(c.yellow(`Plusieurs dossiers correspondent à « ${term} » — précise le nom exact :`));
    for (const r of matches) {
      console.error(`  • ${r.entreprise}  ${c.dim("(Ref " + r.ref + ")")}  [${r.statut_commande}]`);
    }
    process.exit(2);
  }
}

/* ------------------------------------------------------------------------- *
 * 2) Dossier complet (fiche + paiements + produits + notes + production).
 * ------------------------------------------------------------------------- */

const full = await api(`/v1/public/agency/orders/${encodeURIComponent(match.ref)}`);

const dossier = mapDossier(full?.order ?? full?.dossier ?? full);
const result = {
  dossier,
  // Bloc tenant (identité + statut + câblage Turnstile), null si dossier non lié.
  tenant: full?.tenant ?? null,
  paiements: (full?.payments ?? []).map((r) => mapPaiement(r, dossier)),
  production: (full?.production ?? []).map((r) => mapSatellite(r, dossier)),
  notes: (full?.notes ?? []).map((r) => mapSatellite(r, dossier)),
  produits: (full?.products ?? []).map((r) => mapProduit(r, dossier)),
};

/* ------------------------------------------------------------------------- *
 * 3) Résumé lisible (stderr) + JSON complet (stdout).
 * ------------------------------------------------------------------------- */

const d = result.dossier;
const tn = result.tenant;
const tenantLine = tn
  ? `${c.bold(tn.onboarding_status)}` +
    (tn.turnstile_sitekey
      ? ` · turnstile ${c.bold("✓")} (${tn.turnstile_widget})`
      : ` · turnstile ${c.bold("✗")}`)
  : c.dim("aucun tenant lié");
console.error(
  "\n" +
    c.bold(c.cyan(`📋 ${d.Entreprise}`)) +
    `  ${c.dim("Ref " + d.Ref)}\n` +
    `   slug: ${c.bold(String(d.Slug ?? "—"))}   ·   tenant: ${tenantLine}\n` +
    `   commande: ${c.bold(String(d["Statut commande"]))}   ·   production: ${c.bold(String(d["Statut production"]))}\n` +
    `   ${d.Metier || "—"} · ${d.Ville || "—"} · ${d.Email || "—"} · ${d.Telephone || "—"}\n` +
    `   liés → paiements:${result.paiements.length}  production:${result.production.length}  notes:${result.notes.length}  produits:${result.produits.length}\n`,
);
console.log(JSON.stringify(result, null, 2));
