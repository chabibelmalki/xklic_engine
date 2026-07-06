import "server-only";
import { isInsertEnabled } from "@/lib/runtime";

/**
 * Client HTTP d'ÉCRITURE vers l'API Go du back-office (runtime serveur
 * uniquement). Sert la capture de leads Tier 1 : `events` (clics de contact,
 * sans PII) et `leads` (formulaires, avec PII). Lecture des dossiers =
 * `scripts/get-dossier.mjs` (CLI local), distincte.
 *
 * Env : `BACKOFFICE_API_URL` (base, ex. https://api.xklic.com) +
 * `BACKOFFICE_API_KEY` (= `ENGINE_API_KEY` côté back-office), envoyée dans le
 * header `X-API-Key`. Jamais de `NEXT_PUBLIC_*` : la clé vit côté serveur.
 *
 * Philosophie : FIRE-AND-FORGET. Un POST qui échoue (API indisponible, env
 * manquante, timeout) est avalé — on ne bloque JAMAIS le parcours visiteur, on
 * ne retente pas, on n'empile pas de file d'attente. Timeout court (3 s) pour
 * ne pas retenir la réponse au visiteur si l'API rame. La perte d'un event sur
 * panne rare est acceptée par conception.
 */

const TIMEOUT_MS = 3_000;

/** Champs acceptés par POST /v1/public/leads (PII autorisée ici uniquement). */
export type LeadFields = {
  site_slug: string;
  name?: string;
  phone?: string;
  email?: string;
  mode: string;
  service?: string;
  city?: string;
  message?: string;
  site_name?: string;
  page?: string;
  session?: string;
  /** Total estimé facturé, en CENTIMES (convention back-office). null = absent. */
  estimate_cents?: number | null;
  items?: string;
};

/** Champs acceptés par POST /v1/public/events (SANS PII, page déjà normalisée). */
export type EventFields = {
  type: string;
  site_slug: string;
  page: string;
  session?: string;
};

/**
 * POST fire-and-forget vers l'API back-office. Ne lève jamais : retourne `true`
 * si l'API a confirmé (2xx), `false` sinon (env manquante, HTTP non-2xx,
 * timeout, réseau). Toute erreur est loguée puis avalée.
 */
async function post(path: string, body: Record<string, unknown>): Promise<boolean> {
  // GARDE-FOU LOCAL : pas d'écriture back-office en dev/test (override possible
  // via DEV_ALLOW_INSERT=true) — n'altère jamais le parcours visiteur.
  if (!isInsertEnabled()) {
    console.info(`[backoffice] mode local/test — POST ${path} ignoré.`);
    return false;
  }
  const base = process.env.BACKOFFICE_API_URL?.trim().replace(/\/$/, "");
  if (!base) {
    console.info("[backoffice] BACKOFFICE_API_URL absente — POST ignoré (repli silencieux).");
    return false;
  }
  const key = process.env.BACKOFFICE_API_KEY?.trim();
  if (!key) {
    console.info("[backoffice] BACKOFFICE_API_KEY absente — POST ignoré (repli silencieux).");
    return false;
  }
  // Timeout court : on ne retient pas la réponse visiteur si l'API rame.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "X-API-Key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`[backoffice] POST ${path} → HTTP ${res.status}`);
      return false;
    }
    console.info(`[backoffice] POST ${path} ok.`);
    return true;
  } catch (e) {
    console.error(`[backoffice] POST ${path} échec : ${(e as Error).message}`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Insère un lead (avec PII) — POST /v1/public/leads. Fire-and-forget. */
export async function postLead(fields: LeadFields): Promise<boolean> {
  return post("/v1/public/leads", fields);
}

/** Insère un event (sans PII) — POST /v1/public/events. Fire-and-forget. */
export async function postEvent(fields: EventFields): Promise<boolean> {
  return post("/v1/public/events", fields);
}
