#!/usr/bin/env node
// @ts-check
/**
 * CLI d'onboarding domaine custom — branche le domaine d'un client de bout en
 * bout sur le projet `engine`. Procédure de référence : NEWCLIENTCHECKLIST.md
 * (validée en prod sur sanadclean.fr).
 *
 *   npm run onboard -- --slug <slug> --domain <domaine> [--apply] [--only <étape>]
 *
 * SÉCURITÉ : DRY-RUN PAR DÉFAUT. Rien n'est modifié tant que `--apply` n'est pas
 * passé explicitement. `--dry-run` est accepté (alias explicite, no-op).
 *
 * Étapes (ordre) : vercel · dns · ssl · config · manifest · deploy · verify · gsc · turnstile
 *   --only <étape>  n'exécute QUE cette sous-étape.
 *
 * Idempotent + reprenable : chaque étape vérifie « déjà fait ? » avant d'agir.
 * Token manquant -> l'étape s'arrête proprement et imprime les valeurs exactes à
 * faire à la main (jamais de bricolage).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, loadEnvLocal, bareHost, die, stepHeader, MissingTokenError } from "./util.mjs";
import { STEPS, STEP_ORDER } from "./steps.mjs";
import * as backoffice from "./backoffice.mjs";

const ONLY_TARGETS = Object.keys(STEPS); // inclut "gsc-human" (hors pipeline auto)

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
loadEnvLocal(ROOT);
// Secret du widget Turnstile (provisionnement lot 2) — fichier dédié gitignoré
// (.env* est ignoré). Contient TURNSTILE_WIDGET_SECRET (et éventuellement
// TURNSTILE_WIDGET_SITEKEY). Jamais commité, jamais en flag.
loadEnvLocal(ROOT, ".env.turnstile-widget");

// --- parsing args ---------------------------------------------------------
function parseArgs(argv) {
  const out = { apply: false, only: null, slug: null, domain: null, humanToken: null, widget: "xklic 1", widgetSitekey: null, dossierRef: null, listWidgets: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply" || a === "--no-dry-run") out.apply = true;
    else if (a === "--dry-run") out.apply = out.apply; // alias explicite (no-op)
    else if (a === "--list-widgets") out.listWidgets = true;
    else if (a === "--only") out.only = argv[++i];
    else if (a === "--slug") out.slug = argv[++i];
    else if (a === "--domain") out.domain = argv[++i];
    else if (a === "--human-token") out.humanToken = argv[++i];
    else if (a === "--widget") out.widget = argv[++i];
    else if (a === "--widget-sitekey") out.widgetSitekey = argv[++i];
    else if (a === "--dossier-ref") out.dossierRef = argv[++i];
    else if (a.startsWith("--slug=")) out.slug = a.slice(7);
    else if (a.startsWith("--domain=")) out.domain = a.slice(9);
    else if (a.startsWith("--only=")) out.only = a.slice(7);
    else if (a.startsWith("--human-token=")) out.humanToken = a.slice(14);
    else if (a.startsWith("--widget=")) out.widget = a.slice(9);
    else if (a.startsWith("--widget-sitekey=")) out.widgetSitekey = a.slice(17);
    else if (a.startsWith("--dossier-ref=")) out.dossierRef = a.slice(14);
    else die(`Argument inconnu : ${a}`);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Action autonome : lister les widgets Turnstile du back-office (aucun slug/domaine requis).
  if (args.listWidgets) {
    if (!backoffice.isConfigured()) die("Config back-office absente (BACKOFFICE_API_URL / BACKOFFICE_API_KEY).");
    const widgets = await backoffice.listWidgets();
    if (!widgets.length) {
      console.log(c.dim("Aucun widget Turnstile côté back-office."));
    } else {
      console.log(c.bold(`Widgets Turnstile (${widgets.length}) :`));
      for (const w of widgets) console.log(`   • ${c.bold(w.name)}  ${c.dim(w.sitekey)}`);
    }
    return;
  }

  if (!args.slug) die("--slug <slug> requis.");
  if (!args.domain) die("--domain <domaine> requis.");
  if (args.only && !ONLY_TARGETS.includes(args.only)) {
    die(`--only inconnu : "${args.only}". Valeurs : ${ONLY_TARGETS.join(", ")}.`);
  }
  if (args.only === "gsc-human" && !args.humanToken) {
    die("--only gsc-human requiert --human-token <google-site-verification=…>.");
  }

  const apex = bareHost(args.domain);
  if (!apex.includes(".")) die(`Domaine invalide : "${args.domain}".`);
  const ctx = {
    slug: args.slug,
    domain: apex,
    apex,
    www: `www.${apex}`,
    dryRun: !args.apply,
    only: args.only,
    humanToken: args.humanToken,
    widget: args.widget,
    widgetSitekey: args.widgetSitekey,
    dossierRef: args.dossierRef,
    root: ROOT,
    rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "xklic.com",
  };

  console.log(
    c.bold("Onboarding domaine") +
      c.dim(`  slug=${ctx.slug}  domaine=${ctx.apex}  (www=${ctx.www})`) +
      (ctx.dryRun ? c.yellow("  [DRY-RUN — rien ne sera modifié]") : c.green("  [APPLY]")),
  );
  if (ctx.dryRun) console.log(c.dim("→ pour exécuter réellement : ajouter --apply"));

  const toRun = args.only ? [args.only] : STEP_ORDER;
  const summary = [];
  for (const name of toRun) {
    stepHeader(name, ctx.dryRun);
    try {
      await STEPS[name](ctx);
      summary.push({ name, state: "ok" });
    } catch (e) {
      if (e instanceof MissingTokenError) {
        // Étape stoppée proprement (manuel requis) — on continue les suivantes.
        console.log(c.yellow(`   ⏸ ${name} : ${e.message}`));
        summary.push({ name, state: "manual" });
      } else {
        console.log(c.red(`   ✖ ${name} : ${e.message}`));
        summary.push({ name, state: "error" });
        // En apply, on stoppe à la 1re vraie erreur (ordre = dépendances).
        if (!ctx.dryRun) { printSummary(summary, ctx); die(`Arrêt sur erreur à l'étape "${name}".`); }
      }
    }
  }
  printSummary(summary, ctx);
}

function printSummary(summary, ctx) {
  console.log(c.bold("\n━━ Récapitulatif"));
  for (const s of summary) {
    const tag = s.state === "ok" ? c.green("ok") : s.state === "manual" ? c.yellow("manuel") : c.red("erreur");
    console.log(`   ${s.name.padEnd(10)} ${tag}`);
  }
  if (ctx.dryRun) console.log(c.yellow("\nDRY-RUN terminé — relancer avec --apply pour exécuter."));
}

main().catch((e) => die(e.stack || e.message));
