// @ts-check
/**
 * Les 9 sous-étapes de l'onboarding domaine. Chaque étape :
 *   • est IDEMPOTENTE (vérifie « déjà fait ? » avant d'agir) ;
 *   • est REPRENABLE (relancer ne casse rien) ;
 *   • en DRY-RUN n'a AUCUN effet de bord (lecture seule + plan) ;
 *   • si un token manque -> s'arrête proprement et imprime les valeurs EXACTES
 *     à faire à la main (MissingTokenError -> manualAction).
 *
 * ctx = { slug, domain, apex, www, dryRun, only, root, rootDomain }
 */
import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import {
  c, info, ok, willDo, skip, warn, manualAction, MissingTokenError,
} from "./util.mjs";
import * as vercel from "./vercel.mjs";
import * as ovh from "./ovh.mjs";
import * as google from "./google.mjs";
import * as cloudflare from "./cloudflare.mjs";

const OVH_PARKING_IP = "213.186.33.5";
// TXT de parking OVH : "1|<domaine>" sur @, "3|welcome" sur www. On ne touche
// JAMAIS au SPF / DKIM / DMARC / google-site-verification.
const PARKING_TXT = /^"?\d+\|/;
const isSpfLike = (t) => /v=spf1|v=DKIM1|v=DMARC1|google-site-verification/i.test(t);
const stripDot = (s) => String(s).replace(/\.$/, "").toLowerCase();

/** Lance une commande en sous-process, hérite de l'env. @returns {Promise<void>} */
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", env: process.env });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} -> exit ${code}`)),
    );
  });
}

// ───────────────────────────────────────────────────────────── vercel ──────
/** Ajoute apex + www au projet engine (sans redirect) et lit les records DNS. */
export async function vercelStep(ctx) {
  const targets = [ctx.apex, ctx.www];
  for (const name of targets) {
    const existing = await vercel.getProjectDomain(name);
    if (existing) {
      // Garde-fou : on NE veut PAS de redirect apex->www posé côté Vercel.
      if (existing.redirect) warn(`${name} a un redirect Vercel "${existing.redirect}" — à retirer (on veut apex canonique, pas de redirect).`);
      skip(`${name} déjà rattaché au projet`);
    } else if (ctx.dryRun) {
      willDo(`ajouter ${name} au projet engine (POST /v10/projects/{id}/domains)`);
    } else {
      const r = await vercel.addProjectDomain(name);
      ok(`${name} ${r === "added" ? "ajouté" : "déjà présent"}`);
    }
  }

  // Records recommandés par Vercel (jamais en dur).
  const rec = await vercel.getRecommendedRecords(ctx.apex, ctx.www);
  ctx.records = rec;
  console.log(c.bold("\n   Records DNS à poser chez OVH (source : Vercel) :"));
  if (rec.apexARecords.length) info(`A     @     → ${c.bold(rec.apexARecords.join(", "))}${rec.apexARecords.length > 1 ? c.dim("  (un record A par IP)") : ""}`);
  else { warn("IP apex (A @) non fournie clairement par l'API Vercel —"); info(`   lire le dashboard Vercel. Réponse brute : ${JSON.stringify(rec.rawApex)}`); }
  if (rec.wwwCnameTarget) info(`CNAME www   → ${c.bold(rec.wwwCnameTarget)}`);
  else { warn("Cible www (CNAME) non fournie clairement par l'API Vercel —"); info(`   lire le dashboard Vercel. Réponse brute : ${JSON.stringify(rec.rawWww)}`); }
}

// ──────────────────────────────────────────────────────────────── dns ──────
/**
 * Construit le plan DNS OVH à partir des records actuels + cibles Vercel.
 * @param {Array<{id:number,fieldType:string,subDomain:string,target:string}>} records
 * @param {string[]} vercelIPs  une OU plusieurs IP A pour l'apex
 * @param {string|null} vercelCname  cible CNAME www
 */
function buildDnsPlan(records, vercelIPs, vercelCname) {
  const plan = []; // { kind, desc, exec? } — exec posé seulement si applicable
  const apexA = records.filter((r) => r.fieldType === "A" && r.subDomain === "");
  const wwwAll = records.filter((r) => r.subDomain === "www");
  const txtApex = records.filter((r) => r.fieldType === "TXT" && r.subDomain === "");
  const aaaa = records.filter((r) => r.fieldType === "AAAA" && (r.subDomain === "" || r.subDomain === "www"));

  // 1. A @ -> ensemble exact des IP recommandées par Vercel (souvent 2).
  //    On crée les IP manquantes et on supprime les A @ hors cible (parking/anciens).
  if (vercelIPs.length) {
    const want = new Set(vercelIPs);
    const have = new Set(apexA.map((r) => r.target));
    const missing = vercelIPs.filter((ip) => !have.has(ip));
    const surplus = apexA.filter((r) => !want.has(r.target));
    if (missing.length === 0 && surplus.length === 0) {
      plan.push({ kind: "skip", desc: `A @ déjà → ${vercelIPs.join(", ")}` });
    } else {
      for (const r of surplus) plan.push({ kind: "delete", desc: `supprimer A @ hors cible (${r.target}${r.target === OVH_PARKING_IP ? " parking" : ""})`, exec: (z) => ovh.deleteRecord(z, r.id) });
      for (const ip of missing) plan.push({ kind: "create", desc: `créer A @ → ${ip}`, exec: (z) => ovh.createRecord(z, { fieldType: "A", subDomain: "", target: ip }) });
    }
  } else {
    plan.push({ kind: "blocked", desc: "IP Vercel inconnue → A @ non planifiable (lire dashboard Vercel)" });
  }

  // 2. www -> CNAME unique vers Vercel. Piège OVH : supprimer TOUT le reste sur
  //    www AVANT de créer le CNAME (refresh entre les deux).
  const wwwCnames = wwwAll.filter((r) => r.fieldType === "CNAME");
  const wwwOthers = wwwAll.filter((r) => r.fieldType !== "CNAME");
  const goodCname = vercelCname ? wwwCnames.find((r) => stripDot(r.target) === stripDot(vercelCname)) : null;
  for (const r of wwwOthers) plan.push({ kind: "delete", desc: `supprimer ${r.fieldType} www (${r.target}) [piège CNAME]`, exec: (z) => ovh.deleteRecord(z, r.id), pre: true });
  for (const r of wwwCnames) if (r !== goodCname) plan.push({ kind: "delete", desc: `supprimer CNAME www erroné (${r.target})`, exec: (z) => ovh.deleteRecord(z, r.id), pre: true });
  if (vercelCname) {
    if (goodCname && wwwOthers.length === 0 && wwwCnames.length === 1) {
      plan.push({ kind: "skip", desc: `CNAME www déjà → ${vercelCname}` });
    } else if (!goodCname) {
      plan.push({ kind: "create-cname", desc: `créer CNAME www → ${vercelCname}`, exec: (z) => ovh.createRecord(z, { fieldType: "CNAME", subDomain: "www", target: vercelCname.endsWith(".") ? vercelCname : `${vercelCname}.` }) });
    }
  } else {
    plan.push({ kind: "blocked", desc: "cible CNAME Vercel inconnue → CNAME www non planifiable (lire dashboard)" });
  }

  // 3. TXT parking sur @ (préserver SPF & co)
  for (const r of txtApex) {
    if (PARKING_TXT.test(r.target) && !isSpfLike(r.target)) {
      plan.push({ kind: "delete", desc: `supprimer TXT @ parking (${r.target})`, exec: (z) => ovh.deleteRecord(z, r.id), pre: true });
    } else {
      plan.push({ kind: "skip", desc: `préservé TXT @ (${r.target.slice(0, 40)}…)` });
    }
  }

  // 4. AAAA parking
  for (const r of aaaa) plan.push({ kind: "delete", desc: `supprimer AAAA ${r.subDomain || "@"} parking (${r.target})`, exec: (z) => ovh.deleteRecord(z, r.id), pre: true });

  return plan;
}

export async function dnsStep(ctx) {
  if (!ovh.isConfigured()) {
    const rec = ctx.records || (await safeRecords(ctx));
    manualAction("DNS OVH (clés API absentes)", [
      `Zone : ${ctx.apex} — appliquer ces records, puis “rafraîchir la zone” :`,
      `  • A @     → ${rec?.apexARecords?.length ? rec.apexARecords.join(" + ") : "<IP(s) affichée(s) par Vercel>"}  (remplace le parking ${OVH_PARKING_IP})`,
      `  • SUPPRIMER tout sur www (A/AAAA/TXT), rafraîchir, puis CRÉER CNAME www → ${rec?.wwwCnameTarget ?? "<cible Vercel>"}`,
      `  • SUPPRIMER les TXT parking sur @ et www  (NE PAS toucher au SPF)`,
      `  • SUPPRIMER l'AAAA parking s'il existe`,
      `  • PRÉSERVER  : NS ovh.net, CNAME ftp, SPF, MX`,
    ]);
    throw new MissingTokenError("OVH non configuré — DNS à faire à la main (voir ci-dessus).");
  }

  const rec = ctx.records || (await vercel.getRecommendedRecords(ctx.apex, ctx.www).catch(() => null));
  const records = await ovh.listAllRecords(ctx.apex);
  info(`Zone OVH ${ctx.apex} : ${records.length} record(s) actuels.`);
  const plan = buildDnsPlan(records, rec?.apexARecords ?? [], rec?.wwwCnameTarget ?? null);

  const actions = plan.filter((p) => p.exec);
  for (const p of plan) {
    if (p.kind === "skip") skip(p.desc);
    else if (p.kind === "blocked") warn(p.desc);
    else willDo(p.desc);
  }
  if (actions.length === 0) { ok("DNS déjà configuré — rien à faire."); return; }
  if (ctx.dryRun) { info(c.yellow(`${actions.length} modification(s) DNS prévue(s) — aucune appliquée (dry-run).`)); return; }

  // Apply : d'abord toutes les suppressions/updates (pre), refresh, puis le CNAME.
  const pre = actions.filter((a) => a.kind !== "create-cname");
  const cnameCreate = actions.filter((a) => a.kind === "create-cname");
  for (const a of pre) { await a.exec(ctx.apex); ok(a.desc); }
  await ovh.refreshZone(ctx.apex); info("zone rafraîchie");
  for (const a of cnameCreate) { await a.exec(ctx.apex); ok(a.desc); }
  if (cnameCreate.length) { await ovh.refreshZone(ctx.apex); info("zone rafraîchie (CNAME)"); }
  ok("DNS OVH appliqué.");
}

async function safeRecords(ctx) {
  try { return await vercel.getRecommendedRecords(ctx.apex, ctx.www); } catch { return null; }
}

// ──────────────────────────────────────────────────────────────── ssl ──────
/** Poll Vercel jusqu'à apex + www en « Valid Configuration » (misconfigured=false). */
export async function sslStep(ctx) {
  const check = async () => {
    const a = await vercel.getDomainConfig(ctx.apex);
    const w = await vercel.getDomainConfig(ctx.www);
    return { apexOk: !a.misconfigured, wwwOk: !w.misconfigured };
  };
  const first = await check();
  info(`apex ${ctx.apex} : ${first.apexOk ? c.green("valid") : c.yellow("misconfigured")}`);
  info(`www  ${ctx.www} : ${first.wwwOk ? c.green("valid") : c.yellow("misconfigured")}`);
  if (first.apexOk && first.wwwOk) { ok("SSL / configuration valides."); return; }
  if (ctx.dryRun) { warn("pas encore valides — en apply, on attendrait (poll) jusqu'à validation."); return; }

  const TIMEOUT = Number(process.env.ONBOARD_SSL_TIMEOUT_MS) || 30 * 60 * 1000;
  const start = Date.now();
  for (;;) {
    if (Date.now() - start > TIMEOUT) throw new Error(`Timeout SSL (${Math.round(TIMEOUT / 60000)} min). Vérifie le DNS / le dashboard Vercel.`);
    await new Promise((r) => setTimeout(r, 15000));
    const s = await check();
    info(`… apex=${s.apexOk ? "valid" : "…"} www=${s.wwwOk ? "valid" : "…"}`);
    if (s.apexOk && s.wwwOk) { ok("SSL / configuration valides."); return; }
  }
}

// ───────────────────────────────────────────────────────────── config ──────
/** Pose customDomains:[apex, www] (apex en 1er = canonique) dans config.json. */
export async function configStep(ctx) {
  const file = path.join(ctx.root, "config", "sites", ctx.slug, "config.json");
  if (!fs.existsSync(file)) throw new Error(`Config introuvable : ${file} (le slug existe-t-il ?)`);
  const raw = fs.readFileSync(file, "utf8");
  const cfg = JSON.parse(raw);
  const want = [ctx.apex, ctx.www];
  const cur = Array.isArray(cfg.customDomains) ? cfg.customDomains : null;
  if (cur && cur.length === want.length && cur.every((d, i) => d === want[i])) {
    skip(`customDomains déjà = ${JSON.stringify(want)}`); return;
  }
  willDo(`customDomains = ${JSON.stringify(want)} (apex canonique en premier)`);
  if (ctx.dryRun) return;

  // Édition chirurgicale pour un diff minimal : remplacer le tableau s'il existe,
  // sinon l'insérer juste après la ligne "slug".
  const arr = `[${want.map((d) => JSON.stringify(d)).join(", ")}]`;
  let next;
  if (/"customDomains"\s*:/.test(raw)) {
    next = raw.replace(/("customDomains"\s*:\s*)\[[^\]]*\]/, `$1${arr}`);
  } else {
    next = raw.replace(/("slug"\s*:\s*"[^"]*"\s*,\n)/, `$1  "customDomains": ${arr},\n`);
    if (next === raw) throw new Error('Impossible d\'insérer customDomains (ligne "slug" introuvable).');
  }
  fs.writeFileSync(file, next, "utf8");
  ok(`config.json mis à jour (${path.relative(ctx.root, file)})`);
}

// ──────────────────────────────────────────────────────────── manifest ─────
/** Régénère le manifeste puis VÉRIFIE (bloquant) que les maps ne sont pas vides. */
export async function manifestStep(ctx) {
  const out = path.join(ctx.root, "src", "lib", "sites-manifest.ts");
  const assertNonEmpty = () => {
    const txt = fs.readFileSync(out, "utf8");
    const inCustom = new RegExp(`"${ctx.apex}"\\s*:\\s*"${ctx.slug}"`).test(txt);
    const inCanon = new RegExp(`"${ctx.slug}"\\s*:\\s*"${ctx.apex}"`).test(txt);
    if (!inCustom || !inCanon) {
      throw new Error(`BLOQUANT : sites-manifest.ts n'a pas ${ctx.apex}→${ctx.slug} / ${ctx.slug}→${ctx.apex}. customDomains pas pris en compte ?`);
    }
  };
  if (ctx.dryRun) {
    willDo("node scripts/generate-sites-manifest.mjs (régénère le manifeste APRÈS l'étape config)");
    info("puis vérif bloquante : CUSTOM_DOMAINS + CANONICAL_DOMAIN non vides pour ce slug.");
    return;
  }
  await run("node", ["scripts/generate-sites-manifest.mjs"]);
  assertNonEmpty();
  ok(`manifeste régénéré et vérifié (${ctx.apex} ↔ ${ctx.slug}).`);
}

// ─────────────────────────────────────────────────────────────── deploy ────
/**
 * Committe les 2 fichiers d'onboarding (config du slug + manifeste) AVANT le
 * push, car `deploy.mjs` pousse mais ne committe pas → sans ça, les changements
 * ne partiraient pas dans le déploiement. Commit ciblé (uniquement ces 2 fichiers,
 * jamais le reste du working tree). Convention repo : direct sur `main`.
 * @returns {{committed:boolean, sha?:string}}
 */
function commitOnboardingFiles(ctx) {
  const files = [path.join("config", "sites", ctx.slug, "config.json"), path.join("src", "lib", "sites-manifest.ts")];
  const git = (args) => execFileSync("git", args, { cwd: ctx.root, encoding: "utf8" }).trim();
  // Y a-t-il des changements sur CES fichiers précisément ?
  const dirty = git(["status", "--porcelain", "--", ...files]).length > 0;
  if (!dirty) { skip("config + manifeste déjà committés — rien à committer."); return { committed: false }; }
  const msg = `${ctx.slug}: branche le domaine custom ${ctx.apex}\n\ncustomDomains + manifeste régénéré (onboarding automatisé via scripts/onboard).\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`;
  if (ctx.dryRun) { willDo(`git commit (sur main) : ${files.join(", ")}`); return { committed: false }; }
  git(["add", "--", ...files]);
  git(["commit", "-m", msg]);
  const sha = git(["rev-parse", "--short", "HEAD"]);
  ok(`commit ${sha} (config + manifeste) sur main.`);
  return { committed: true, sha };
}

export async function deployStep(ctx) {
  // 1. commit ciblé des artefacts d'onboarding (sinon non déployés).
  commitOnboardingFiles(ctx);
  // 2. push + attente READY + syncs.
  if (ctx.dryRun) { willDo("npm run deploy (push + attente READY + sync domaines + sync sitemaps)"); info("aperçu réel possible : npm run deploy:dry"); return; }
  await run("npm", ["run", "deploy"]);
  ok("déploiement terminé.");
}

// ─────────────────────────────────────────────────────────────── verify ────
/** Les 4 asserts (lecture seule). Exécutés sur apply OU si l'étape est ciblée. */
export async function verifyStep(ctx) {
  const cmds = [
    `curl -sI https://${ctx.slug}.${ctx.rootDomain}/      → location: https://${ctx.apex}/`,
    `curl -sI https://${ctx.www}/                          → location: https://${ctx.apex}/`,
    `curl -s  https://${ctx.apex}/sitemap.xml | grep loc   → contient ${ctx.apex}, pas ${ctx.rootDomain}`,
    `curl -sI https://${ctx.apex}/                         → HTTP 200`,
  ];
  const targeted = ctx.only === "verify";
  if (ctx.dryRun && !targeted) { cmds.forEach((x) => info(x)); info(c.dim("(exécuté en apply, ou via --only verify)")); return; }

  let pass = 0;
  const loc = async (url, want) => {
    const r = await fetch(url, { redirect: "manual" }).catch((e) => ({ error: e }));
    const l = r.headers?.get?.("location");
    const good = !!l && l.replace(/\/$/, "") === want.replace(/\/$/, "");
    (good ? ok : warn)(`${url} → ${l || r.error?.message || r.status} ${good ? "" : `(attendu ${want})`}`); if (good) pass++;
  };
  await loc(`https://${ctx.slug}.${ctx.rootDomain}/`, `https://${ctx.apex}/`);
  await loc(`https://${ctx.www}/`, `https://${ctx.apex}/`);
  // sitemap
  try {
    const t = await (await fetch(`https://${ctx.apex}/sitemap.xml`)).text();
    const m = t.match(/<loc>([^<]+)<\/loc>/);
    const good = !!m && m[1].includes(ctx.apex) && !m[1].includes(ctx.rootDomain);
    (good ? ok : warn)(`sitemap 1er <loc> = ${m?.[1] ?? "(absent)"}`); if (good) pass++;
  } catch (e) { warn(`sitemap injoignable : ${e.message}`); }
  // home 200
  try {
    const r = await fetch(`https://${ctx.apex}/`, { redirect: "manual" });
    const good = r.status === 200;
    (good ? ok : warn)(`https://${ctx.apex}/ → HTTP ${r.status}`); if (good) pass++;
  } catch (e) { warn(`apex injoignable : ${e.message}`); }

  if (pass === 4) ok("4/4 asserts OK — custom domain pleinement câblé.");
  else warn(`${pass}/4 asserts OK${ctx.dryRun ? " (normal si pas encore déployé)" : ""}.`);
}

// ──────────────────────────────────────────────────────────────── gsc ──────
export async function gscStep(ctx) {
  const property = google.scDomainProperty(ctx.apex);
  const sitemap = `https://${ctx.apex}/sitemap.xml`;
  if (!google.isConfigured()) {
    manualAction("Google Search Console (compte de service absent)", [
      `Ajouter une propriété type « Domaine » : ${ctx.apex}`,
      `Poser le TXT google-site-verification sur OVH @ (sans écraser le SPF), valider,`,
      `puis soumettre le sitemap : ${sitemap}`,
      `« Demander l'indexation » reste MANUEL (pas d'API).`,
    ]);
    throw new MissingTokenError("GSC non configuré — à faire à la main.");
  }
  const token = await google.getAccessToken(ctx.root);
  const verified = await google.listVerifiedDomains(token);
  const already = verified.has(ctx.apex.toLowerCase());

  if (ctx.dryRun) {
    if (already) skip(`${ctx.apex} déjà vérifié côté Google`);
    else {
      let txt = null;
      try { txt = await google.getVerificationToken(token, ctx.apex); }
      catch (e) {
        if (/has not been used|is disabled|SERVICE_DISABLED/i.test(e.message)) {
          warn("Site Verification API désactivée sur le projet GCP — l'activer :");
          info("   https://console.developers.google.com/apis/api/siteverification.googleapis.com (puis Search Console API)");
        } else warn(`récupération du TXT impossible : ${e.message}`);
      }
      if (txt) {
        willDo(`poser TXT @ → ${c.bold(txt)} (OVH, sans écraser SPF) puis valider la propriété Domaine`);
        if (!ovh.isConfigured()) warn("OVH non configuré → ce TXT devra être posé à la main.");
      }
    }
    // Sonde l'état réel : la propriété existe-t-elle, le sitemap est-il soumis ?
    // (listSubmittedSitemaps échoue si la propriété n'existe pas encore.)
    let propExists = false;
    let sitemaps = new Set();
    try { sitemaps = await google.listSubmittedSitemaps(token, property); propExists = true; }
    catch { propExists = false; }
    (propExists ? skip : willDo)(`${propExists ? "propriété déjà présente" : "ajouter la propriété"} ${property}`);
    (propExists && sitemaps.has(sitemap) ? skip : willDo)(`${propExists && sitemaps.has(sitemap) ? "sitemap déjà soumis" : "soumettre le sitemap"} : ${sitemap}`);
    const human = process.env.GSC_HUMAN_OWNER?.trim();
    if (human) {
      let owners = null;
      try { owners = (await google.getPropertyOwners(token, ctx.apex))?.owners ?? null; } catch { /* pas encore vérifié */ }
      (owners?.includes(human) ? skip : willDo)(`${owners?.includes(human) ? "propriétaire humain déjà présent" : "ajouter le propriétaire humain (API, sans hash)"} : ${human}`);
    }
    info(c.dim("« Demander l'indexation » = manuel (pas d'API)."));
    return;
  }

  // Apply.
  if (!already) {
    const txt = await google.getVerificationToken(token, ctx.apex);
    info(`TXT de vérification : ${txt}`);
    if (!ovh.isConfigured()) {
      manualAction("Poser le TXT de vérification puis relancer --only gsc", [
        `OVH zone ${ctx.apex} : TXT  @  → ${txt}   (ne pas écraser le SPF)`,
      ]);
      throw new MissingTokenError("OVH absent : impossible de poser le TXT automatiquement.");
    }
    // additif : ne pas écraser un TXT existant (SPF…). Vérifie l'absence avant create.
    const txtApex = (await ovh.listAllRecords(ctx.apex)).filter((r) => r.fieldType === "TXT" && r.subDomain === "");
    if (!txtApex.some((r) => r.target.includes(txt))) {
      await ovh.createRecord(ctx.apex, { fieldType: "TXT", subDomain: "", target: txt });
      await ovh.refreshZone(ctx.apex);
      ok("TXT de vérification posé sur OVH @ (SPF préservé).");
    } else skip("TXT de vérification déjà présent.");
    // poll vérification (propagation DNS)
    let done = false;
    for (let i = 0; i < 10 && !done; i++) {
      const v = await google.verifyDomain(token, ctx.apex);
      if (v.ok) { done = true; break; }
      info(`… vérification pas encore OK (${v.status}) — propagation DNS, attente 30s`);
      await new Promise((r) => setTimeout(r, 30000));
    }
    if (!done) throw new Error("Vérification GSC non aboutie (propagation DNS lente). Relancer --only gsc plus tard.");
    ok("propriété Domaine vérifiée.");
  } else skip("propriété déjà vérifiée.");

  const added = await google.addSearchConsoleProperty(token, ctx.apex);
  ok(`propriété ${property} ${added === "added" ? "ajoutée" : "déjà présente"}.`);
  const submitted = await google.listSubmittedSitemaps(token, property).catch(() => new Set());
  if (submitted.has(sitemap)) skip(`sitemap déjà soumis : ${sitemap}`);
  else { await google.submitSitemap(token, property, sitemap); ok(`sitemap soumis : ${sitemap}`); }

  // Visibilité humaine SANS UI/hash : ajoute GSC_HUMAN_OWNER (ex. contact@xklic.com)
  // comme propriétaire délégué via l'API. Idempotent.
  const human = process.env.GSC_HUMAN_OWNER?.trim();
  if (human) {
    const r = await google.addPropertyOwner(token, ctx.apex, human);
    (r.added ? ok : skip)(`propriétaire humain ${human} ${r.added ? "ajouté" : "déjà présent"} → visible dans son dashboard GSC.`);
  } else {
    info(c.dim("(GSC_HUMAN_OWNER non défini → pas de propriétaire humain auto ; cf. --only gsc-human)"));
  }
  info(c.dim("Rappel : « Demander l'indexation » = manuel (pas d'API)."));
}

// ─────────────────────────────────────────────────────────── gsc-human ─────
/**
 * Pose le TXT de vérification d'un PROPRIÉTAIRE HUMAIN (ex. contact@xklic.com)
 * sur le DNS du domaine, pour qu'il VOIE la propriété dans son dashboard GSC.
 *
 * Pourquoi à part : l'API Google ne permet pas d'ajouter un humain à une
 * propriété (UI-only), et un compte de service ne peut pas opérer l'interface.
 * Chaque propriétaire d'une propriété Domaine se vérifie via SON propre TXT.
 *
 * Le token (`--human-token`, valeur affichée par GSC « Ajouter une propriété »)
 * est posé en ADDITIF : il cohabite avec le TXT du compte de service et tout SPF.
 * La VALIDATION (« Vérifier ») se fait côté UI par l'humain — pas d'API ici.
 */
export async function gscHumanStep(ctx) {
  const raw = (ctx.humanToken || "").trim();
  if (!raw) throw new Error("--human-token requis (la valeur google-site-verification=… affichée par GSC).");
  const value = raw.startsWith("google-site-verification=") ? raw : `google-site-verification=${raw}`;
  const hash = value.split("=")[1];

  if (!ovh.isConfigured()) {
    manualAction("Poser le TXT propriétaire humain à la main", [
      `OVH zone ${ctx.apex} : TXT  @  → ${value}   (additif, ne pas écraser le SPF / les autres TXT)`,
      `Puis, dans GSC (compte humain) : « Vérifier ».`,
    ]);
    throw new MissingTokenError("OVH non configuré — TXT humain à poser à la main.");
  }

  const txtApex = (await ovh.listAllRecords(ctx.apex)).filter((r) => r.fieldType === "TXT" && r.subDomain === "");
  if (txtApex.some((r) => r.target.includes(hash))) {
    skip(`TXT humain déjà présent (${hash.slice(0, 16)}…)`);
  } else {
    willDo(`poser TXT @ → ${c.bold(value)} (additif, SPF + TXT compte de service préservés)`);
    if (!ctx.dryRun) {
      await ovh.createRecord(ctx.apex, { fieldType: "TXT", subDomain: "", target: value });
      await ovh.refreshZone(ctx.apex);
      ok("TXT humain posé sur OVH @.");
    }
  }
  info(c.dim(`→ Dans GSC (le compte humain), clique « Vérifier » sur ${ctx.apex}. La validation est UI-only.`));
}

// ────────────────────────────────────────────────────────── turnstile ──────
export async function turnstileStep(ctx) {
  const hosts = [ctx.apex, ctx.www];
  if (!cloudflare.isConfigured()) {
    manualAction("Turnstile (Cloudflare) — config absente", [
      `Dashboard Cloudflare → widget Turnstile → Hostnames : ajouter`,
      `  • ${ctx.apex}`,
      `  • ${ctx.www}`,
      `Sans ça, le formulaire de contact/devis casse sur le nouveau domaine.`,
    ]);
    throw new MissingTokenError("Turnstile non configuré — hostname à ajouter à la main.");
  }
  const w = await cloudflare.getWidget();
  const missing = hosts.filter((h) => !w.domains.includes(h));
  if (missing.length === 0) { skip(`hostnames déjà autorisés (${hosts.join(", ")})`); return; }
  willDo(`ajouter au widget Turnstile : ${missing.join(", ")}`);
  if (ctx.dryRun) return;
  const { after } = await cloudflare.addWidgetHostnames(missing);
  ok(`hostnames Turnstile : ${after.join(", ")}`);
}

export const STEPS = {
  vercel: vercelStep,
  dns: dnsStep,
  ssl: sslStep,
  config: configStep,
  manifest: manifestStep,
  deploy: deployStep,
  verify: verifyStep,
  gsc: gscStep,
  turnstile: turnstileStep,
  "gsc-human": gscHumanStep,
};
// Pipeline standard (full run). `gsc-human` en est EXCLU : c'est un geste à la
// demande (--only gsc-human --human-token …), pas une étape du parcours auto.
export const STEP_ORDER = ["vercel", "dns", "ssl", "config", "manifest", "deploy", "verify", "gsc", "turnstile"];
