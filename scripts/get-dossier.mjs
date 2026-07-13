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
 * `GET /v1/public/agency/orders/{ref}` pour le dossier complet.
 *
 * PHILOSOPHIE — règle de NETTOYAGE, pas de correspondance : on ressort le JSON
 * du back-office TEL QUEL, on se contente d'en RETIRER les données de paiement.
 * Aucun mapping champ par champ à maintenir : tout nouveau champ ajouté côté
 * back-office remonte automatiquement. La seule maintenance possible ici, c'est
 * d'ajouter une clé à retirer (cf. PAYMENT_STRIP) si un nouveau champ de
 * paiement apparaît un jour.
 *
 * stdout = le JSON des données du dossier (paiement retiré). stderr = un résumé
 * lisible pour vérifier d'un coup d'œil.
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
 * Règle de NETTOYAGE : on retire les données de paiement avant de montrer le
 * dossier. Tout le reste passe tel quel. Pour couvrir un nouveau champ de
 * paiement un jour, il suffit de l'ajouter ici — rien d'autre à toucher.
 * ------------------------------------------------------------------------- */
const PAYMENT_STRIP = {
  // Clés paiement à la racine de la réponse (le bloc des transactions Stripe).
  top: ["payments"],
  // Champs paiement portés par le dossier lui-même (conditions commerciales).
  order: ["promo_code", "discount_cents"],
};

/** Retire les données de paiement d'une réponse dossier. Non destructif (copie). */
function stripPayment(full) {
  const out = { ...full };
  for (const k of PAYMENT_STRIP.top) delete out[k];
  if (out.order && typeof out.order === "object") {
    out.order = { ...out.order };
    for (const k of PAYMENT_STRIP.order) delete out.order[k];
  }
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
 * 2) Dossier complet, nettoyé du paiement (le reste brut, tel quel).
 * ------------------------------------------------------------------------- */

const full = await api(`/v1/public/agency/orders/${encodeURIComponent(match.ref)}`);
const result = stripPayment(full);

/* ------------------------------------------------------------------------- *
 * 3) Résumé lisible (stderr) + JSON complet (stdout).
 * ------------------------------------------------------------------------- */

const o = result.order ?? {};
const tn = result.tenant ?? null;
const tenantLine = tn
  ? `${c.bold(tn.onboarding_status)}` +
    (tn.turnstile_sitekey
      ? ` · turnstile ${c.bold("✓")} (${tn.turnstile_widget})`
      : ` · turnstile ${c.bold("✗")}`)
  : c.dim("aucun tenant lié");
console.error(
  "\n" +
    c.bold(c.cyan(`📋 ${o.entreprise ?? "—"}`)) +
    `  ${c.dim("Ref " + (o.ref ?? "—"))}\n` +
    `   slug: ${c.bold(String(o.tenant_slug ?? "—"))}   ·   tenant: ${tenantLine}\n` +
    `   commande: ${c.bold(String(o.statut_commande ?? "—"))}   ·   production: ${c.bold(String(o.statut_production ?? "—"))}\n` +
    `   ${o.metier || "—"} · ${o.ville || "—"} · ${o.email || "—"} · ${o.telephone || "—"}\n` +
    `   liés → notes:${(result.notes ?? []).length}  demandes de modif:${(result.modif_requests ?? []).length}\n`,
);
console.log(JSON.stringify(result, null, 2));
