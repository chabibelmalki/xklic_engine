// @ts-check
/**
 * Client back-office pour l'onboarding — assigne un tenant à un widget Turnstile
 * (source de vérité par widget côté back-office, cf. migration Turnstile). Sans
 * ça, un nouveau client resterait sur le fallback env au lieu de la config DB.
 *
 * Auth : X-API-Key = BACKOFFICE_API_KEY (= ENGINE_API_KEY côté back-office),
 *        base BACKOFFICE_API_URL — mêmes variables que scripts/get-dossier.mjs.
 *
 *   POST /v1/public/tenants/{slug}/turnstile-widget  { widget }
 *     -> 200 { tenant, widget, turnstile_sitekey }
 *     -> 404 widget_not_found (le widget nommé n'existe pas côté back-office)
 *     -> 404 tenant_not_found (aucun tenant back-office pour ce slug)
 */
import { MissingTokenError } from "./util.mjs";

function cfg() {
  const base = process.env.BACKOFFICE_API_URL?.trim().replace(/\/$/, "");
  const key = process.env.BACKOFFICE_API_KEY?.trim();
  const miss = [!base && "BACKOFFICE_API_URL", !key && "BACKOFFICE_API_KEY"].filter(Boolean);
  if (miss.length) throw new MissingTokenError(`Config back-office manquante : ${miss.join(", ")}`);
  return { base, key };
}

export function isConfigured() {
  return !!(process.env.BACKOFFICE_API_URL && process.env.BACKOFFICE_API_KEY);
}

/**
 * Assigne le tenant `slug` au widget nommé `widget`.
 * @param {string} slug
 * @param {string} widget
 * @returns {Promise<{ tenant:string, widget:string, sitekey:string }>}
 */
export async function assignTurnstileWidget(slug, widget) {
  const { base, key } = cfg();
  const res = await fetch(`${base}/v1/public/tenants/${encodeURIComponent(slug)}/turnstile-widget`, {
    method: "POST",
    headers: { "X-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ widget }),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = body?.error ?? res.statusText;
    throw new Error(`back-office POST /turnstile-widget -> ${res.status} ${detail}`);
  }
  return { tenant: body?.tenant, widget: body?.widget, sitekey: body?.turnstile_sitekey };
}
