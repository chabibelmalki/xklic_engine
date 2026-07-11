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
 * Assigne le tenant `slug` au widget nommé `widget`. Avec `opts.createMissing`,
 * le back-office crée le tenant s'il n'existe pas encore (au lieu de renvoyer
 * 404) — ce qui permet de câbler Turnstile de bout en bout sans le repo
 * back-office. `opts.dossierRef` (Ref/OrderId) lie le tenant créé à son dossier
 * (garde-fou : le slug doit correspondre à celui figé sur le dossier, sinon 409).
 * @param {string} slug
 * @param {string} widget
 * @param {{ createMissing?:boolean, tenantName?:string, dossierRef?:string }} [opts]
 * @returns {Promise<{ tenant:string, widget:string, sitekey:string, created:boolean }>}
 */
export async function assignTurnstileWidget(slug, widget, opts = {}) {
  const { base, key } = cfg();
  const payload = { widget };
  if (opts.createMissing) payload.create_missing = true;
  if (opts.tenantName) payload.tenant_name = opts.tenantName;
  if (opts.dossierRef) payload.dossier_ref = opts.dossierRef;
  const res = await fetch(`${base}/v1/public/tenants/${encodeURIComponent(slug)}/turnstile-widget`, {
    method: "POST",
    headers: { "X-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = body?.error ?? res.statusText;
    throw new Error(`back-office POST /turnstile-widget -> ${res.status} ${detail}`);
  }
  return { tenant: body?.tenant, widget: body?.widget, sitekey: body?.turnstile_sitekey, created: !!body?.tenant_created };
}

/**
 * Liste les widgets Turnstile connus du back-office (nom + sitekey ; le secret
 * n'est jamais renvoyé). Sert à savoir quels « groupes » existent avant d'en
 * créer/assigner un.
 * @returns {Promise<Array<{ name:string, sitekey:string, created_at:string }>>}
 */
export async function listWidgets() {
  const { base, key } = cfg();
  const res = await fetch(`${base}/v1/public/turnstile/widgets`, {
    headers: { "X-API-Key": key },
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { /* réponse non-JSON (ex. 405) */ }
  if (!res.ok) {
    const detail = body?.error ?? res.statusText;
    throw new Error(`back-office GET /turnstile/widgets -> ${res.status} ${detail}`);
  }
  return Array.isArray(body?.widgets) ? body.widgets : [];
}

/**
 * S'assure qu'un widget existe côté back-office (le crée s'il est absent, en
 * chiffrant le secret). Idempotent : widget déjà présent → renvoyé tel quel,
 * secret conservé (pas de rotation). Le secret ne transite qu'ici (HTTPS +
 * X-API-Key) et n'est jamais renvoyé.
 * @param {string} name @param {string} sitekey @param {string} secret
 * @returns {Promise<{ widget:string, sitekey:string, created:boolean }>}
 */
export async function ensureWidget(name, sitekey, secret) {
  const { base, key } = cfg();
  const res = await fetch(`${base}/v1/public/turnstile/widgets`, {
    method: "POST",
    headers: { "X-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ name, sitekey, secret }),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = body?.error ?? res.statusText;
    throw new Error(`back-office POST /turnstile/widgets -> ${res.status} ${detail}`);
  }
  return { widget: body?.widget, sitekey: body?.sitekey, created: !!body?.created };
}
