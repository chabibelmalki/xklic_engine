#!/usr/bin/env node
// @ts-check
/**
 * Orchestre le déploiement de PRODUCTION puis la synchro post-déploiement,
 * dans cet ordre, en s'arrêtant à la PREMIÈRE erreur :
 *
 *   1. DÉPLOIEMENT  — push git de la branche de prod (Vercel auto-deploy).
 *   2. ATTENTE      — poll l'API Vercel jusqu'à READY du déploiement PRODUCTION
 *                     correspondant au SHA poussé (ERROR/CANCELED -> stop).
 *   3. POST-DÉPLOIEMENT (uniquement si READY) :
 *        a. scripts/sync-domains.mjs   (ajoute les sous-domaines manquants)
 *        b. scripts/sync-sitemaps.mjs  (soumet les sitemaps manquants à GSC)
 *
 * Les deux scripts de synchro sont exécutés EN SOUS-PROCESS : on réutilise donc
 * leur logique ET leurs garde-fous (abort si 0 site local, etc.) sans rien
 * dupliquer. Ils héritent de l'env chargé ici depuis .env.local.
 *
 * OPTIONS :
 *   --dry-run      Push réel INTERDIT. Affiche le commit qui serait poussé puis
 *                  lance les DEUX syncs en --dry-run (aucune modif Vercel/GSC).
 *   --skip-deploy  Saute 1-2. Ne lance que les deux syncs (réels) — utile après
 *                  un push déjà effectué.
 *
 * Env (lues depuis .env.local) :
 *   VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID  (étapes 1-2)
 *   GSC_SERVICE_ACCOUNT_KEY, GSC_PROPERTY, NEXT_PUBLIC_ROOT_DOMAIN  (syncs)
 *   VERCEL_DEPLOY_TIMEOUT_MS  (opt, défaut 600000 = 10 min)
 *
 * NB : le renouvellement du certificat wildcard (*.xklic.com, ~90 j) reste
 * VOLONTAIREMENT hors de ce script — c'est un rituel manuel à part
 * (cf. COMMANDAUTO.md).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execFileSync } from "node:child_process";

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_DEPLOY = process.argv.includes("--skip-deploy");

const ROOT = process.cwd();
const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const API = "https://api.vercel.com";

// --- petites aides de log (calquées sur sync-domains.mjs) -----------------
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
function die(msg) {
  console.error(c.red(`✗ ${msg}`));
  process.exit(1);
}
function step(n, label) {
  console.log(c.bold(c.cyan(`\n[${n}] ${label}`)));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- .env.local : chargé sans écraser l'env déjà présent ------------------
// (même comportement que sync-sitemaps.mjs : l'env réel a la priorité)
function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (key in process.env) continue;
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}
loadEnvLocal();

const TOKEN = process.env.VERCEL_TOKEN?.trim();
const PROJECT_ID = process.env.VERCEL_PROJECT_ID?.trim();
const TEAM_ID = process.env.VERCEL_TEAM_ID?.trim();
const TIMEOUT_MS = Number(process.env.VERCEL_DEPLOY_TIMEOUT_MS) || 10 * 60 * 1000;

// Combien de fois on retente de TROUVER le déploiement côté Vercel avant
// d'abandonner (le webhook git -> Vercel peut prendre quelques secondes).
const FIND_RETRIES = 12;
const FIND_INTERVAL_MS = 5_000;
// Cadence du suivi d'état une fois le déploiement trouvé.
const POLL_INTERVAL_MS = 5_000;

// --- git ------------------------------------------------------------------
/** @param {...string} args */
function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

// --- client API Vercel (calqué sur sync-domains.mjs) ----------------------
/** @param {string} pathname @param {Record<string,string|number>} [extra] */
function apiUrl(pathname, extra = {}) {
  const u = new URL(pathname, API);
  if (TEAM_ID) u.searchParams.set("teamId", TEAM_ID);
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, String(v));
  return u;
}
/** @param {URL} url @param {RequestInit} [init] */
async function api(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = body?.error?.message ?? text ?? res.statusText;
    throw new Error(`${init.method ?? "GET"} ${url.pathname} -> ${res.status} ${detail}`);
  }
  return body;
}

/**
 * Cherche le déploiement PRODUCTION correspondant au SHA.
 * @param {string} sha @returns {Promise<{ uid: string, url?: string } | null>}
 */
async function findProductionDeployment(sha) {
  const data = await api(
    apiUrl("/v6/deployments", { projectId: PROJECT_ID, target: "production", limit: 20 }),
  );
  const list = data?.deployments ?? [];
  const match = list.find((d) => d?.meta?.githubCommitSha === sha);
  if (!match) return null;
  return { uid: match.uid ?? match.id, url: match.url };
}

/** @param {string} id @returns {Promise<string>} readyState normalisé */
async function getDeploymentState(id) {
  const d = await api(apiUrl(`/v13/deployments/${id}`));
  return d?.readyState ?? d?.status ?? d?.state ?? "UNKNOWN";
}

// --- exécution d'un script de synchro en sous-process ---------------------
/** @param {string} scriptName @param {string[]} [extraArgs] */
function runScript(scriptName, extraArgs = []) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...extraArgs], {
      stdio: "inherit",
      env: process.env, // .env.local déjà chargé ici -> hérité par l'enfant
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`${scriptName} ${extraArgs.join(" ")} a échoué (exit ${code}).`));
    });
  });
}

// --- étape 3 : les deux syncs, dans l'ordre, stop à la 1re erreur ---------
async function runPostDeploySyncs() {
  const syncArgs = DRY_RUN ? ["--dry-run"] : [];

  step("3a", "Sync des sous-domaines" + (DRY_RUN ? " (dry-run)" : ""));
  await runScript("sync-domains.mjs", syncArgs);
  console.log(c.green("✓ sync-domains OK"));

  step("3b", "Sync des sitemaps -> GSC" + (DRY_RUN ? " (dry-run)" : ""));
  await runScript("sync-sitemaps.mjs", syncArgs);
  console.log(c.green("✓ sync-sitemaps OK"));
}

// --- main -----------------------------------------------------------------
async function main() {
  console.log(
    c.bold("Déploiement prod") +
      (DRY_RUN ? c.yellow("  [DRY-RUN]") : "") +
      (SKIP_DEPLOY ? c.yellow("  [SKIP-DEPLOY]") : ""),
  );

  // ─── Chemin --skip-deploy : on ne fait que les syncs (réels) ───────────
  if (SKIP_DEPLOY) {
    console.log(c.dim("Étapes 1-2 sautées (--skip-deploy) — syncs uniquement."));
    await runPostDeploySyncs();
    console.log(c.green(c.bold("\n✓ Terminé (sync-only).")));
    return;
  }

  // ─── Étape 1 : DÉPLOIEMENT (git push) ──────────────────────────────────
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  const sha = git("rev-parse", "HEAD");
  const shortSha = sha.slice(0, 8);
  const subject = git("log", "-1", "--pretty=%s");
  const dirty = git("status", "--porcelain");

  step(1, "Déploiement (git push)");
  console.log(c.dim(`Branche : ${branch}`));
  console.log(c.dim(`Commit  : ${shortSha} — ${subject}`));
  if (dirty) {
    // Le script ne committe pas : on prévient que le working tree sale ne
    // partira PAS dans ce déploiement (seul l'état committé est poussé).
    console.log(
      c.yellow(
        "! Working tree non propre : des changements non committés NE seront PAS déployés.",
      ),
    );
  }

  if (DRY_RUN) {
    console.log(
      c.yellow(`[DRY-RUN] Aucun push. Serait poussé : ${branch} @ ${shortSha}.`),
    );
    // En dry-run on saute l'attente Vercel et on enchaîne sur les syncs (dry).
    await runPostDeploySyncs();
    console.log(c.green(c.bold("\n✓ Terminé (dry-run).")));
    return;
  }

  if (!TOKEN) die("VERCEL_TOKEN manquant (.env.local).");
  if (!PROJECT_ID) die("VERCEL_PROJECT_ID manquant (.env.local).");

  // Push réel. Si rien à committer, on pousse quand même la branche (no-op
  // git côté distant si déjà à jour, mais on garantit l'état poussé).
  try {
    git("push", "origin", branch);
    console.log(c.green(`✓ Poussé : origin/${branch} @ ${shortSha}`));
  } catch (e) {
    die(`git push a échoué : ${e.message}`);
  }

  // ─── Étape 2 : ATTENTE DE LA FIN DU DÉPLOIEMENT VERCEL ─────────────────
  step(2, "Attente du déploiement Vercel (production)");

  // 2a. Retrouver le déploiement correspondant au SHA (retry : webhook lent).
  let deployment = null;
  for (let attempt = 1; attempt <= FIND_RETRIES; attempt++) {
    deployment = await findProductionDeployment(sha);
    if (deployment) break;
    console.log(
      c.dim(`  … déploiement pour ${shortSha} pas encore visible (essai ${attempt}/${FIND_RETRIES})`),
    );
    await sleep(FIND_INTERVAL_MS);
  }
  if (!deployment) {
    die(
      `Aucun déploiement PRODUCTION trouvé pour ${shortSha} après ` +
        `${FIND_RETRIES} essais. (Vérifie l'auto-deploy Vercel sur la branche ${branch}.)`,
    );
  }
  console.log(c.dim(`  déploiement : ${deployment.uid}${deployment.url ? ` (${deployment.url})` : ""}`));

  // 2b. Suivre l'état jusqu'à READY (ou ERROR/CANCELED/timeout).
  const start = Date.now();
  let lastState = "";
  for (;;) {
    const state = await getDeploymentState(deployment.uid);
    if (state !== lastState) {
      console.log(c.dim(`  état : ${state}`));
      lastState = state;
    }
    if (state === "READY") {
      console.log(c.green(`✓ Déploiement READY (${deployment.uid})`));
      break;
    }
    if (state === "ERROR" || state === "CANCELED") {
      die(
        `Déploiement ${state} (${deployment.uid}) — synchros NON lancées. ` +
          `Inspecte les logs sur Vercel.`,
      );
    }
    if (Date.now() - start > TIMEOUT_MS) {
      die(
        `Timeout (${Math.round(TIMEOUT_MS / 1000)}s) en attendant READY ` +
          `(dernier état : ${lastState}) — synchros NON lancées.`,
      );
    }
    await sleep(POLL_INTERVAL_MS);
  }

  // ─── Étape 3 : POST-DÉPLOIEMENT (uniquement si READY) ──────────────────
  await runPostDeploySyncs();

  console.log(c.green(c.bold("\n✓ Déploiement + synchros terminés avec succès.")));
}

main().catch((e) => die(e.message));
