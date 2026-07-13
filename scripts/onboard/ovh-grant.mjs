#!/usr/bin/env node
// @ts-check
/**
 * Génère une demande de CONSUMER KEY OVH couvrant DNS **et** email, et imprime
 * l'URL de validation. One-shot : à lancer quand on veut (re)donner au CK les
 * droits `/email/domain/*` (nécessaires à l'étape `email` de l'onboarding) en
 * plus des `/domain/zone/*` (DNS) déjà utilisés.
 *
 *   node scripts/onboard/ovh-grant.mjs
 *
 * Le CK renvoyé est INERTE tant que l'URL de validation n'est pas ouverte et
 * confirmée (login OVH). Après validation : copier le consumerKey affiché dans
 * `.env.local` → OVH_CONSUMER_KEY=<valeur>, puis relancer `--only email`.
 *
 * N'exige que OVH_APP_KEY (+ OVH_ENDPOINT optionnel) : /auth/credential se signe
 * avec la seule clé applicative (pas de CK ni de signature — c'est le bootstrap).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, loadEnvLocal, die } from "./util.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
loadEnvLocal(ROOT);

const appKey = process.env.OVH_APP_KEY?.trim();
const endpoint = (process.env.OVH_ENDPOINT?.trim() || "https://eu.api.ovh.com/1.0").replace(/\/$/, "");
if (!appKey) die("OVH_APP_KEY manquante dans .env.local.");

// Superset des droits : DNS (déjà utilisé) + email (nouvel étape). Remplacer le
// CK par celui-ci ne retire donc AUCUN droit existant.
const accessRules = [];
for (const base of ["/domain/zone/*", "/email/domain/*"]) {
  for (const method of ["GET", "POST", "PUT", "DELETE"]) accessRules.push({ method, path: base });
}

const res = await fetch(`${endpoint}/auth/credential`, {
  method: "POST",
  headers: { "X-Ovh-Application": appKey, "Content-Type": "application/json" },
  body: JSON.stringify({ accessRules }),
});
const text = await res.text();
const data = text ? JSON.parse(text) : null;
if (!res.ok) die(`OVH /auth/credential -> ${res.status} ${data?.message ?? text}`);

console.log(c.bold("\nNouveau consumer key OVH (DNS + email) — À VALIDER :\n"));
console.log(`   ${c.bold("consumerKey")} : ${c.green(data.consumerKey)}`);
console.log(`   ${c.bold("état")}        : ${data.state}`);
console.log(`\n   ${c.bold("1.")} Ouvre cette URL et connecte-toi pour valider :`);
console.log(`      ${c.cyan(data.validationUrl)}`);
console.log(`\n   ${c.bold("2.")} Puis dans ${c.dim(".env.local")} : ${c.bold("OVH_CONSUMER_KEY=" + data.consumerKey)}`);
console.log(`   ${c.bold("3.")} Vérifie : ${c.dim("node scripts/onboard/index.mjs --slug sanadclean --domain sanadclean.fr --only email")}\n`);
