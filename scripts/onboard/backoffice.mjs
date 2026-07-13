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
 * Résout le dossier agence d'un client pour l'étape « email ».
 *   • par `ref` (Ref/OrderId figée) si fournie → GET direct ;
 *   • sinon recherche par nom d'entreprise (désambiguïsation par nom exact),
 *     comme scripts/get-dossier.mjs.
 * @param {{ ref?:string, name?:string }} q
 * @returns {Promise<{ ref:string, statut:string, email:string, emailPerso:string, tenantSlug:string, entreprise:string }|null>}
 */
export async function resolveDossier(q) {
  const { base, key } = cfg();
  const get = async (pathname) => {
    const res = await fetch(`${base}${pathname}`, { headers: { "X-API-Key": key } });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(`back-office GET ${pathname} -> ${res.status} ${body?.error ?? res.statusText}`);
    return body;
  };
  let ref = (q.ref || "").trim();
  if (!ref) {
    const name = (q.name || "").trim();
    if (!name) return null;
    const found = await get(`/v1/public/agency/orders?q=${encodeURIComponent(name)}`);
    const matches = Array.isArray(found) ? found : (found?.orders ?? found?.results ?? []);
    if (!matches.length) return null;
    const pick = matches.length === 1
      ? matches[0]
      : matches.find((r) => String(r.entreprise || "").toLowerCase() === name.toLowerCase());
    if (!pick) throw new Error(`plusieurs dossiers pour « ${name} » — préciser --dossier-ref.`);
    ref = String(pick.ref);
  }
  const full = await get(`/v1/public/agency/orders/${encodeURIComponent(ref)}`);
  const o = full?.order ?? {};
  return {
    ref: String(o.ref ?? ref),
    statut: String(o.statut_commande ?? ""),
    email: String(o.email ?? "").trim(),
    emailPerso: String(o.email_perso ?? "").trim(),
    tenantSlug: String(o.tenant_slug ?? "").trim(),
    entreprise: String(o.entreprise ?? "").trim(),
  };
}

/**
 * Met à jour les deux emails du dossier via l'upsert public (merge par pointeurs :
 * les autres champs restent intacts). `statut` doit refléter le statut courant
 * (l'upsert l'exige). source="sync" → snapshot de version côté back-office.
 * @param {string} ref @param {string} statut
 * @param {{ email?:string, emailPerso?:string }} emails
 */
export async function updateDossierEmails(ref, statut, emails) {
  const { base, key } = cfg();
  const dossier = {};
  if (emails.email !== undefined) dossier.email = emails.email;
  if (emails.emailPerso !== undefined) dossier.email_perso = emails.emailPerso;
  const res = await fetch(`${base}/v1/public/agency/orders`, {
    method: "POST",
    headers: { "X-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ ref, statut, dossier, source: "sync" }),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`back-office POST /agency/orders -> ${res.status} ${body?.error ?? res.statusText}`);
  return body;
}

/**
 * Bascule le contact_email d'un tenant vers l'adresse pro (étape « email »).
 * @param {string} slug @param {string} email
 * @returns {Promise<{ tenant:string, contactEmail:string }>}
 */
export async function setTenantContactEmail(slug, email) {
  const { base, key } = cfg();
  const res = await fetch(`${base}/v1/public/tenants/${encodeURIComponent(slug)}/contact-email`, {
    method: "POST",
    headers: { "X-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`back-office POST /contact-email -> ${res.status} ${body?.error ?? res.statusText}`);
  return { tenant: body?.tenant, contactEmail: body?.contact_email };
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
