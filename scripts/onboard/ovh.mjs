// @ts-check
/**
 * Client API OVH pour la zone DNS — NON couvert par les scripts existants, donc
 * documenté en détail ici (endpoints + payloads + auth). Si les clés manquent,
 * l'appelant retombe sur des instructions manuelles : on ne devine jamais.
 *
 * ── Authentification OVH (clé applicative + signature) ────────────────────
 * Chaque requête est signée. Headers requis :
 *   X-Ovh-Application : OVH_APP_KEY
 *   X-Ovh-Consumer    : OVH_CONSUMER_KEY
 *   X-Ovh-Timestamp   : epoch (s)
 *   X-Ovh-Signature   : "$1$" + sha1hex(
 *                          OVH_APP_SECRET + "+" + OVH_CONSUMER_KEY + "+" +
 *                          METHOD + "+" + FULL_URL + "+" + BODY + "+" + TIMESTAMP )
 *   Content-Type      : application/json (si body)
 *
 * Le consumer key (CK) doit avoir été validé avec les droits GET/POST/PUT/DELETE
 * sur /domain/zone/* (création de CK : POST /auth/credential, puis validation via
 * l'URL renvoyée). C'est un pré-requis MANUEL one-shot, signalé si CK absent.
 *
 * ── Endpoints zone DNS utilisés ──────────────────────────────────────────
 *   GET    /domain/zone/{zone}/record?fieldType={t}&subDomain={s}  -> number[] (ids)
 *   GET    /domain/zone/{zone}/record/{id}                          -> {id,fieldType,subDomain,target,ttl}
 *   POST   /domain/zone/{zone}/record   {fieldType,subDomain,target,ttl?}
 *   PUT    /domain/zone/{zone}/record/{id}   {subDomain?,target,ttl?}
 *   DELETE /domain/zone/{zone}/record/{id}
 *   POST   /domain/zone/{zone}/refresh   (applique les changements — OBLIGATOIRE)
 *
 * Endpoint régional par défaut : https://eu.api.ovh.com/1.0 (surchargeable via
 * OVH_ENDPOINT).
 */
import crypto from "node:crypto";
import { MissingTokenError } from "./util.mjs";

function cfg() {
  const appKey = process.env.OVH_APP_KEY?.trim();
  const appSecret = process.env.OVH_APP_SECRET?.trim();
  const consumerKey = process.env.OVH_CONSUMER_KEY?.trim();
  const endpoint = (process.env.OVH_ENDPOINT?.trim() || "https://eu.api.ovh.com/1.0").replace(/\/$/, "");
  if (!appKey || !appSecret || !consumerKey) {
    const miss = [
      !appKey && "OVH_APP_KEY",
      !appSecret && "OVH_APP_SECRET",
      !consumerKey && "OVH_CONSUMER_KEY",
    ].filter(Boolean).join(", ");
    throw new MissingTokenError(`Clés OVH manquantes : ${miss}`);
  }
  return { appKey, appSecret, consumerKey, endpoint };
}

/** Y a-t-il de quoi parler à OVH ? (pour brancher le dry-run sans throw). */
export function isConfigured() {
  return !!(process.env.OVH_APP_KEY && process.env.OVH_APP_SECRET && process.env.OVH_CONSUMER_KEY);
}

/**
 * @param {string} method @param {string} pathname @param {any} [payload]
 * @returns {Promise<any>}
 */
async function call(method, pathname, payload) {
  const { appKey, appSecret, consumerKey, endpoint } = cfg();
  const url = `${endpoint}${pathname}`;
  const body = payload === undefined ? "" : JSON.stringify(payload);
  const ts = Math.floor(Date.now() / 1000);
  const toSign = `${appSecret}+${consumerKey}+${method}+${url}+${body}+${ts}`;
  const signature = "$1$" + crypto.createHash("sha1").update(toSign).digest("hex");

  const res = await fetch(url, {
    method,
    headers: {
      "X-Ovh-Application": appKey,
      "X-Ovh-Consumer": consumerKey,
      "X-Ovh-Timestamp": String(ts),
      "X-Ovh-Signature": signature,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body || undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = data?.message ?? text ?? res.statusText;
    throw new Error(`OVH ${method} ${pathname} -> ${res.status} ${detail}`);
  }
  return data;
}

/**
 * Liste les records d'un (sous-domaine, type) — filtre côté API.
 * @param {string} zone @param {{ fieldType?: string, subDomain?: string }} [filter]
 * @returns {Promise<number[]>} ids
 */
export async function listRecordIds(zone, filter = {}) {
  const q = new URLSearchParams();
  if (filter.fieldType) q.set("fieldType", filter.fieldType);
  if (filter.subDomain !== undefined) q.set("subDomain", filter.subDomain);
  const qs = q.toString();
  return await call("GET", `/domain/zone/${zone}/record${qs ? `?${qs}` : ""}`);
}

/** @param {string} zone @param {number} id */
export async function getRecord(zone, id) {
  return await call("GET", `/domain/zone/${zone}/record/${id}`);
}

/**
 * Tous les records de la zone, détaillés (pour l'audit / dry-run).
 * @param {string} zone
 * @returns {Promise<Array<{id:number,fieldType:string,subDomain:string,target:string,ttl:number}>>}
 */
export async function listAllRecords(zone) {
  const ids = await listRecordIds(zone);
  const out = [];
  for (const id of ids) out.push(await getRecord(zone, id));
  return out;
}

/** @param {string} zone @param {{fieldType:string,subDomain:string,target:string,ttl?:number}} rec */
export async function createRecord(zone, rec) {
  return await call("POST", `/domain/zone/${zone}/record`, rec);
}
/** @param {string} zone @param {number} id @param {{subDomain?:string,target:string,ttl?:number}} rec */
export async function updateRecord(zone, id, rec) {
  return await call("PUT", `/domain/zone/${zone}/record/${id}`, rec);
}
/** @param {string} zone @param {number} id */
export async function deleteRecord(zone, id) {
  return await call("DELETE", `/domain/zone/${zone}/record/${id}`);
}
/** Applique les modifications en attente sur la zone. @param {string} zone */
export async function refreshZone(zone) {
  return await call("POST", `/domain/zone/${zone}/refresh`);
}
