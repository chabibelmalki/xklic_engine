#!/usr/bin/env node
// @ts-check
/**
 * `reconcile` — aligne le record A @ (apex) de TOUS les domaines clients en prod
 * sur l'IP courante recommandée par Vercel. C'est l'onboarding « étape dns »
 * rejoué en masse, hors création : on ne fait QUE le A @, sur les domaines déjà
 * branchés (cf. `onboard` pour le premier branchement complet www/SSL/GSC/…).
 *
 *   npm run reconcile               # DRY-RUN — montre les dérives, ne touche à rien
 *   npm run reconcile -- --apply    # corrige uniquement les domaines en dérive
 *   npm run reconcile -- --slug <slug>      # limite à un site
 *   npm run reconcile -- --domain <apex>    # limite à un apex précis
 *   npm run reconcile -- --fail-on-drift    # (=--ci) exit 1 si dérive/anomalie
 *                                           # (dry-run) : pour la CI hebdo GitHub
 *
 * SÉCURITÉ : DRY-RUN PAR DÉFAUT (comme onboard). Idempotent : un domaine déjà
 * aligné n'est jamais touché. La correction est staged puis appliquée par UN
 * seul `refresh` de zone → pas de fenêtre sans record A (l'ancienne IP Vercel
 * reste servie pendant la propagation).
 *
 * Réutilise la logique existante, sans la dupliquer :
 *   • vercel.getDomainConfig(apex)  → IP(s) recommandée(s) (même primitive que
 *     l'onboarding `getRecommendedRecords`, mais scopée à l'apex : un souci sur
 *     www ne doit pas bloquer le diagnostic du A @).
 *   • steps.diffApexA(posé, recommandé)  → notion unique de « dérive A @ »,
 *     extraite telle quelle de `buildDnsPlan`.
 *   • ovh.listAllRecords / createRecord / deleteRecord / refreshZone  → DNS OVH.
 *
 * ⚠️ Le DNS des domaines clients est chez OVH. Cloudflare n'intervient PAS ici
 * (il ne sert qu'au widget Turnstile). Un domaine dont la zone n'est pas chez
 * OVH ressort en « erreur » sans bloquer les autres.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, loadEnvLocal, bareHost, die } from "./util.mjs";
import { diffApexA } from "./steps.mjs";
import * as vercel from "./vercel.mjs";
import * as ovh from "./ovh.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
loadEnvLocal(ROOT);

// --- parsing args ---------------------------------------------------------
function parseArgs(argv) {
  const out = { apply: false, slug: null, domain: null, failOnDrift: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply" || a === "--no-dry-run") out.apply = true;
    else if (a === "--dry-run") out.apply = out.apply; // alias explicite (no-op)
    else if (a === "--fail-on-drift" || a === "--ci") out.failOnDrift = true;
    else if (a === "--slug") out.slug = argv[++i];
    else if (a === "--domain") out.domain = argv[++i];
    else if (a.startsWith("--slug=")) out.slug = a.slice(7);
    else if (a.startsWith("--domain=")) out.domain = a.slice(9);
    else die(`Argument inconnu : ${a}`);
  }
  return out;
}

/** apex robuste depuis customDomains (la convention « apex d'abord » n'est pas garantie). */
function apexOf(customDomains) {
  const hosts = customDomains.map(bareHost);
  return hosts.find((h) => !h.startsWith("www.")) ?? hosts[0].replace(/^www\./, "");
}

/**
 * Domaines clients à réconcilier = apex de chaque config `config/sites/<slug>`
 * ayant des customDomains. Filtré par --slug / --domain si fournis.
 * @returns {Array<{ slug:string, apex:string }>}
 */
function collectDomains(filter) {
  const dir = path.join(ROOT, "config", "sites");
  if (!fs.existsSync(dir)) die(`Dossier introuvable : ${dir}`);
  const out = [];
  for (const slug of fs.readdirSync(dir)) {
    if (filter.slug && slug !== filter.slug) continue;
    const file = path.join(dir, slug, "config.json");
    if (!fs.existsSync(file)) continue;
    let cfg;
    try { cfg = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch (e) { console.log(c.red(`   ✖ config illisible ${slug} : ${e.message}`)); continue; }
    const doms = Array.isArray(cfg.customDomains) ? cfg.customDomains : [];
    if (!doms.length) continue; // site *.xklic.com only : pas de A @ à gérer
    const apex = apexOf(doms);
    if (filter.domain && apex !== bareHost(filter.domain)) continue;
    out.push({ slug, apex });
  }
  // dédoublonne un même apex partagé par plusieurs configs (garde-fou)
  const seen = new Set();
  return out.filter((d) => (seen.has(d.apex) ? false : seen.add(d.apex)));
}

/**
 * Diagnostique un domaine : lit l'IP recommandée (Vercel) + le A @ posé (OVH),
 * et calcule la dérive. Applique la correction si apply && dérive.
 * `kind` : clé stable pour le récap (status = libellé coloré affiché).
 * @returns {Promise<{ apex:string, slug:string, posted:string, recommended:string, status:string, kind:"aligned"|"drift"|"fixed"|"issue" }>}
 */
async function reconcileDomain({ slug, apex }, apply) {
  const issue = (posted, recommended, status) => ({ apex, slug, posted, recommended, status: c.red(status), kind: "issue" });

  // 1. IP(s) recommandée(s) courante(s) côté Vercel.
  let vercelIPs = [];
  try {
    const cfg = await vercel.getDomainConfig(apex);
    vercelIPs = cfg.recommendedIPv4;
  } catch (e) {
    return issue("?", "?", `erreur Vercel (${short(e)})`);
  }
  const recommended = vercelIPs.length ? vercelIPs.join(" + ") : "—";
  if (!vercelIPs.length) return issue("?", "— (voir dashboard)", "IP Vercel inconnue");

  // 2. A @ réellement posé chez OVH.
  if (!ovh.isConfigured()) return issue("OVH non configuré", recommended, "clés OVH absentes");
  let apexA;
  try {
    const records = await ovh.listAllRecords(apex);
    apexA = records.filter((r) => r.fieldType === "A" && r.subDomain === "");
  } catch (e) {
    return issue("?", recommended, `erreur OVH (${short(e)})`);
  }
  const posted = apexA.length ? apexA.map((r) => r.target).join(" + ") : "—";

  // 3. Dérive ? (logique partagée avec l'onboarding)
  const d = diffApexA(apexA, vercelIPs);
  if (d.aligned) return { apex, slug, posted, recommended, status: c.green("aligné"), kind: "aligned" };
  if (!apply) return { apex, slug, posted, recommended, status: c.yellow("dérive"), kind: "drift" };

  // 4. Correction (apply). Staged puis UN refresh → pas de fenêtre sans A @.
  for (const ip of d.missing) await ovh.createRecord(apex, { fieldType: "A", subDomain: "", target: ip });
  for (const r of d.surplus) await ovh.deleteRecord(apex, r.id);
  await ovh.refreshZone(apex);
  return { apex, slug, posted, recommended, status: c.cyan("corrigé"), kind: "fixed" };
}

const short = (e) => String(e?.message ?? e).split("\n")[0].slice(0, 60);

// --- rendu tableau ---------------------------------------------------------
/** Largeur visible (ignore les codes ANSI) pour aligner les colonnes. */
const visLen = (s) => s.replace(/\x1b\[[0-9;]*m/g, "").length;
const pad = (s, w) => s + " ".repeat(Math.max(0, w - visLen(s)));

function printTable(rows) {
  const H = { apex: "DOMAINE", posted: "IP POSÉE", recommended: "IP RECOMMANDÉE", status: "STATUT" };
  const w = {
    apex: Math.max(visLen(H.apex), ...rows.map((r) => visLen(r.apex))),
    posted: Math.max(visLen(H.posted), ...rows.map((r) => visLen(r.posted))),
    recommended: Math.max(visLen(H.recommended), ...rows.map((r) => visLen(r.recommended))),
    status: Math.max(visLen(H.status), ...rows.map((r) => visLen(r.status))),
  };
  const line = (r) => `  ${pad(r.apex, w.apex)}  ${pad(r.posted, w.posted)}  ${pad(r.recommended, w.recommended)}  ${pad(r.status, w.status)}`;
  console.log("");
  console.log(c.bold(line(H)));
  console.log(c.dim(`  ${"─".repeat(w.apex)}  ${"─".repeat(w.posted)}  ${"─".repeat(w.recommended)}  ${"─".repeat(w.status)}`));
  for (const r of rows) console.log(line(r));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = !args.apply;
  const targets = collectDomains(args);

  console.log(
    c.bold("Reconcile A @ (apex → IP Vercel)") +
      c.dim(`  ${targets.length} domaine(s)`) +
      (dryRun ? c.yellow("  [DRY-RUN — rien ne sera modifié]") : c.green("  [APPLY]")),
  );
  if (dryRun) console.log(c.dim("→ pour corriger réellement : ajouter --apply"));
  if (!targets.length) { console.log(c.yellow("Aucun domaine custom trouvé (filtre trop restrictif ?).")); return; }

  const rows = [];
  for (const t of targets) {
    process.stdout.write(c.dim(`   … ${t.apex}\r`));
    rows.push(await reconcileDomain(t, args.apply));
  }
  printTable(rows);

  // Récap (comptage sur `kind`, pas sur le libellé coloré)
  const n = (k) => rows.filter((r) => r.kind === k).length;
  const [aligned, drift, fixed, issues] = [n("aligned"), n("drift"), n("fixed"), n("issue")];
  console.log(c.bold("\n━━ Récapitulatif"));
  console.log(`   alignés : ${aligned}   dérive : ${c.yellow(String(drift))}   corrigés : ${c.cyan(String(fixed))}   à voir : ${issues ? c.red(String(issues)) : "0"}`);
  if (dryRun && drift) console.log(c.yellow(`\n${drift} domaine(s) en dérive — relancer avec --apply pour corriger.`));

  // Mode CI : sortie non-zéro si dérive OU anomalie (une IP indéterminée doit
  // alerter aussi — sinon un check vert masquerait un souci de token/API).
  if (args.failOnDrift && (drift > 0 || issues > 0)) {
    const why = [drift && `${drift} en dérive`, issues && `${issues} à voir`].filter(Boolean).join(", ");
    console.log(c.red(`\n✖ --fail-on-drift : ${why} → exit 1.`));
    process.exitCode = 1;
  }
}

main().catch((e) => die(e.stack || e.message));
