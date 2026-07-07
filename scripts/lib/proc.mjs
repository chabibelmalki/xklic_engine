// @ts-check
/**
 * Exécution de CLIs externes (npm, npx, vercel…) de façon portable
 * **Windows + macOS/Linux**. À utiliser dès qu'on lance un outil installé via
 * npm (par opposition à un binaire natif comme `git` ou `node`, qui se lancent
 * très bien avec `execFileSync("git", …)` / `process.execPath` sans rien de tout ça).
 *
 * Pourquoi ce module existe :
 *   • Sous Windows, `npm`/`npx`/`vercel` sont des scripts **`.cmd`**. Depuis la
 *     mitigation CVE-2024-27980, Node **refuse** de les lancer sans `shell: true`.
 *   • Mais sous shell, Node ne **quote pas** les arguments : un chemin contenant
 *     une espace (`C:\Users\Ma Collègue\logo.png`) casse la commande.
 * On centralise donc les deux : shell activé + quoting adapté au shell courant
 * (cmd.exe sous Windows, sh ailleurs). Un seul endroit à auditer/corriger.
 */
import { spawn, spawnSync } from "node:child_process";

export const isWindows = process.platform === "win32";

/**
 * Quote un argument pour le shell courant, seulement s'il en a besoin.
 * @param {string|number} arg
 * @returns {string}
 */
export function quoteArg(arg) {
  const s = String(arg);
  if (s === "") return isWindows ? '""' : "''";
  // Sûr tel quel : caractères neutres pour les deux shells (pas d'espace, ni de
  // backslash → un chemin Windows `C:\…` tombe donc dans la branche quotée).
  if (/^[A-Za-z0-9_@%+=:,.\/-]+$/.test(s)) return s;
  if (isWindows) return `"${s.replace(/"/g, '""')}"`; // cmd.exe : " … " avec "" doublés
  return `'${s.replace(/'/g, `'\\''`)}'`; // POSIX sh : ' … ' avec ' échappés
}

/** Assemble la ligne de commande quotée passée au shell. */
function commandLine(cmd, args) {
  return [cmd, ...args.map(quoteArg)].join(" ");
}

/**
 * Lance un CLI et attend sa fin (rejette si code de sortie ≠ 0).
 * @param {string} cmd  ex. "npm", "npx", "vercel"
 * @param {string[]} [args]
 * @param {import("node:child_process").SpawnOptions} [opts]
 * @returns {Promise<void>}
 */
export function runCli(cmd, args = [], opts = {}) {
  const line = commandLine(cmd, args);
  return new Promise((resolve, reject) => {
    const child = spawn(line, { stdio: "inherit", shell: true, ...opts });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} -> exit ${code}`)),
    );
  });
}

/**
 * Version synchrone : renvoie le résultat brut de `spawnSync`
 * (`status`, `stdout`, `stderr`, `error`…), à l'appelant de le traiter.
 * @param {string} cmd @param {string[]} [args]
 * @param {import("node:child_process").SpawnSyncOptions} [opts]
 * @returns {import("node:child_process").SpawnSyncReturns<string>}
 */
export function runCliSync(cmd, args = [], opts = {}) {
  const line = commandLine(cmd, args);
  // @ts-expect-error surcharge string de spawnSync (shell:true)
  return spawnSync(line, { shell: true, ...opts });
}
