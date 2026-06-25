// @ts-check
/**
 * Client Cloudflare Turnstile — NON couvert par les scripts existants, donc
 * documenté ici. Sert à autoriser le nouveau domaine sur le widget Turnstile
 * (sinon le formulaire de contact/devis casse côté client = plus de leads).
 *
 * Auth : Bearer CLOUDFLARE_API_TOKEN (token avec permission
 *        "Account > Turnstile : Edit"). Compte ciblé : CLOUDFLARE_ACCOUNT_ID.
 * Le widget est identifié par sa sitekey = NEXT_PUBLIC_TURNSTILE_SITE_KEY.
 *
 * ── Endpoints ────────────────────────────────────────────────────────────
 *   GET /client/v4/accounts/{acct}/challenges/widgets/{sitekey}
 *       -> { result: { sitekey, name, mode, domains:[...], ... } }
 *   PUT /client/v4/accounts/{acct}/challenges/widgets/{sitekey}
 *       body { name, mode, domains:[...], ... }  (PUT = remplacement complet :
 *       on relit d'abord puis on ré-émet l'objet avec la liste domains augmentée)
 */
import { MissingTokenError } from "./util.mjs";

const API = "https://api.cloudflare.com/client/v4";

function cfg() {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const miss = [
    !token && "CLOUDFLARE_API_TOKEN",
    !accountId && "CLOUDFLARE_ACCOUNT_ID",
    !sitekey && "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  ].filter(Boolean);
  if (miss.length) throw new MissingTokenError(`Config Turnstile manquante : ${miss.join(", ")}`);
  return { token, accountId, sitekey };
}

export function isConfigured() {
  return !!(
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );
}

async function cf(method, pathname, token, payload) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(payload ? { "Content-Type": "application/json" } : {}) },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok || body?.success === false) {
    const detail = body?.errors?.map((e) => e.message).join("; ") ?? text ?? res.statusText;
    throw new Error(`Cloudflare ${method} ${pathname} -> ${res.status} ${detail}`);
  }
  return body?.result;
}

/** Lit le widget. @returns {Promise<{ name:string, mode:string, domains:string[], raw:any }>} */
export async function getWidget() {
  const { token, accountId, sitekey } = cfg();
  const r = await cf("GET", `/accounts/${accountId}/challenges/widgets/${sitekey}`, token);
  return { name: r?.name, mode: r?.mode, domains: r?.domains ?? [], raw: r };
}

/**
 * Ajoute des hostnames au widget (idempotent : union). PUT = remplacement, donc
 * on renvoie l'objet complet relu avec la liste domains augmentée.
 * @param {string[]} hostsToAdd
 * @returns {Promise<{ before: string[], after: string[] }>}
 */
export async function addWidgetHostnames(hostsToAdd) {
  const { token, accountId, sitekey } = cfg();
  const current = await getWidget();
  const before = current.domains;
  const after = [...new Set([...before, ...hostsToAdd])];
  await cf("PUT", `/accounts/${accountId}/challenges/widgets/${sitekey}`, token, {
    name: current.name,
    mode: current.mode,
    domains: after,
  });
  return { before, after };
}
