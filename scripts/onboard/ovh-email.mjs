// @ts-check
/**
 * Client API OVH — REDIRECTIONS EMAIL (service « MX Plan »). Séparé du client
 * zone DNS (ovh.mjs) car c'est un AUTRE namespace : /email/domain/*. Réutilise
 * la signature de requête d'ovh.mjs (même clé applicative + consumer key + même
 * endpoint régional).
 *
 * ⚠ PRÉ-REQUIS one-shot MANUEL : le consumer key OVH doit AUSSI porter les droits
 *   GET/POST/DELETE sur /email/domain/*  (en plus de /domain/zone/* déjà validé).
 *   Re-valider le CK une fois (POST /auth/credential + URL de validation).
 *   Sans ces droits → 403 ; sans MX Plan sur le domaine → 404 (hasEmailService=false).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────
 *   GET    /email/domain/{domain}                              -> infos (404 = pas de MX Plan)
 *   GET    /email/domain/{domain}/redirection?from={addr}      -> string[] (ids)
 *   GET    /email/domain/{domain}/redirection/{id}             -> {id, from, to, localCopy}
 *   POST   /email/domain/{domain}/redirection {from,to,localCopy} -> task (async, pas de refresh)
 *   DELETE /email/domain/{domain}/redirection/{id}
 *
 * localCopy=false : pure redirection, aucune copie conservée sur le domaine.
 */
import { request as ovhRequest, isConfigured } from "./ovh.mjs";

export { isConfigured };

/** 404 OVH sur /email/domain/{domain} = le domaine n'a pas le service email (MX Plan). */
const is404 = (msg) => /->\s*404\b/.test(String(msg));

/**
 * Le domaine a-t-il le service email OVH (MX Plan) actif ? Sans lui, aucune
 * redirection n'est possible (l'appelant retombe alors sur des instructions
 * manuelles). @param {string} domain @returns {Promise<boolean>}
 */
export async function hasEmailService(domain) {
  try {
    await ovhRequest("GET", `/email/domain/${domain}`);
    return true;
  } catch (e) {
    if (is404(e.message)) return false;
    throw e;
  }
}

/**
 * Redirections dont l'adresse source est `from` (filtre côté API).
 * @param {string} domain @param {string} from
 * @returns {Promise<Array<{id:number,from:string,to:string,localCopy:boolean}>>}
 */
export async function listRedirections(domain, from) {
  const q = from ? `?from=${encodeURIComponent(from)}` : "";
  const ids = await ovhRequest("GET", `/email/domain/${domain}/redirection${q}`);
  const out = [];
  for (const id of ids) out.push(await ovhRequest("GET", `/email/domain/${domain}/redirection/${id}`));
  return out;
}

/**
 * Crée une redirection `from` → `to` (renvoie une tâche OVH ; propagation async,
 * pas de refresh à appeler). @param {string} domain @param {string} from
 * @param {string} to @param {boolean} [localCopy]
 */
export async function createRedirection(domain, from, to, localCopy = false) {
  return await ovhRequest("POST", `/email/domain/${domain}/redirection`, { from, to, localCopy });
}

/** @param {string} domain @param {number} id */
export async function deleteRedirection(domain, id) {
  return await ovhRequest("DELETE", `/email/domain/${domain}/redirection/${id}`);
}
