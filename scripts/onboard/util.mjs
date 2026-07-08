// @ts-check
/**
 * Helpers partagés par le CLI d'onboarding domaine (scripts/onboard/*).
 *
 * - chargement .env.local (sans écraser l'env réel, comme deploy/sync-*)
 * - couleurs + log par étape
 * - bareHost (miroir lib/urls.ts / generate-sites-manifest.mjs)
 * - `manualAction()` : imprime les VALEURS EXACTES à faire à la main quand une
 *   étape ne peut pas agir (token manquant, appel API non couvert). Jamais de
 *   bricolage : on s'arrête proprement et on dit quoi faire.
 * - `MissingTokenError` : remontée propre « cette étape a besoin de X ».
 */
import fs from "node:fs";
import path from "node:path";

// --- couleurs (calquées sur sync-domains.mjs / deploy.mjs) ----------------
export const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

/** Erreur « il manque un secret/condition pour agir » — l'étape s'arrête proprement. */
export class MissingTokenError extends Error {}

// --- .env.local : chargé sans écraser l'env déjà présent ------------------
// (même comportement que deploy.mjs / sync-sitemaps.mjs : l'env réel a priorité)
/** @param {string} root @param {string} [name] fichier env (défaut .env.local) */
export function loadEnvLocal(root, name = ".env.local") {
  const file = path.join(root, name);
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

/** Réduit une valeur de domaine (URL, host:port, host/path) à un host nu. */
export function bareHost(raw) {
  return String(raw)
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- log -------------------------------------------------------------------
/** Titre d'étape. @param {string} name @param {boolean} dryRun */
export function stepHeader(name, dryRun) {
  console.log(
    c.bold(c.cyan(`\n━━ ${name} `)) + (dryRun ? c.yellow("[DRY-RUN]") : c.green("[APPLY]")),
  );
}
export const info = (s) => console.log(`   ${s}`);
export const ok = (s) => console.log(c.green(`   ✓ ${s}`));
export const willDo = (s) => console.log(c.yellow(`   → ${s}`));
export const skip = (s) => console.log(c.dim(`   = ${s}`));
export const warn = (s) => console.log(c.yellow(`   ! ${s}`));

/**
 * Imprime un bloc « À FAIRE À LA MAIN » avec les valeurs exactes. Utilisé quand
 * un token manque ou qu'un appel n'est pas couvert : on ne devine jamais.
 * @param {string} title @param {string[]} lines
 */
export function manualAction(title, lines) {
  console.log(c.yellow(`   ┌─ MANUEL — ${title}`));
  for (const l of lines) console.log(c.yellow(`   │  ${l}`));
  console.log(c.yellow(`   └─ (relancer l'étape une fois fait : --only <étape>)`));
}

/** @param {string} msg */
export function die(msg) {
  console.error(c.red(`\n✖ ${msg}`));
  process.exit(1);
}
