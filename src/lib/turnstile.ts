import "server-only";
import { isLocalTestMode } from "@/lib/runtime";
import type { SiteConfig } from "@/types/config";

/**
 * Turnstile piloté par le back-office (source de vérité par WIDGET, cf. limite
 * Cloudflare 10 hostnames/widget). Deux usages, SERVEUR uniquement :
 *
 *  - `getTurnstileSiteKey(config)` : sitekey publique du widget assigné au
 *    tenant, résolue au build/ISR via GET /v1/public/tenants/{slug}/config.
 *  - `verifyTurnstileToken(config, token, ip)` : vérifie le token via
 *    POST /v1/public/turnstile/verify (le secret ne quitte jamais l'API Go).
 *
 * Le back-office est l'AUTORITÉ : s'il ne peut pas confirmer (indisponible,
 * non-2xx, ou tenant non câblé → `success:false`), on REJETTE (fail-closed) —
 * jamais de repli qui laisserait passer. Les env historiques
 * (NEXT_PUBLIC_TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY) ne sont plus lues ici :
 * le fallback de migration a été retiré une fois tous les sites sur la config DB.
 *
 * Base + clé : paire `BACKOFFICE_API_URL` / `BACKOFFICE_API_KEY`
 * (= `ENGINE_API_KEY` côté back-office), header `X-API-Key`.
 */

const TIMEOUT_MS = 3_000;

function backofficeBase(): string | null {
  return process.env.BACKOFFICE_API_URL?.trim().replace(/\/$/, "") || null;
}

function backofficeKey(): string | null {
  return process.env.BACKOFFICE_API_KEY?.trim() || null;
}

/** Slug du tenant back-office pour un site (aligné sur `shopTenant`). */
function tenantSlug(config: SiteConfig): string {
  return config.shop?.tenant?.trim() || config.slug;
}

/**
 * Sitekey publique Turnstile pour un site, ou `undefined` si l'anti-robot est
 * désactivé (local, ou site non opt-in via `forms.turnstile`) ou si le
 * back-office ne la fournit pas. Résolue au build/ISR (fetch caché).
 */
export async function getTurnstileSiteKey(config: SiteConfig): Promise<string | undefined> {
  if (isLocalTestMode()) return undefined;
  if (!config.forms?.turnstile) return undefined;

  const base = backofficeBase();
  const key = backofficeKey();
  if (!base || !key) {
    console.error("[turnstile] BACKOFFICE_API_URL/KEY absente — sitekey introuvable");
    return undefined;
  }
  try {
    // Pas d'AbortController : un `signal` désactive la mémoïsation + le Data Cache
    // de Next. La sitekey change rarement ⇒ réponse cachée (revalidation quotidienne).
    const res = await fetch(
      `${base}/v1/public/tenants/${encodeURIComponent(tenantSlug(config))}/config`,
      {
        headers: { "X-API-Key": key },
        next: { revalidate: 86_400 },
      },
    );
    if (res.ok) {
      const data = (await res.json()) as { turnstile_sitekey?: string };
      return data.turnstile_sitekey?.trim() || undefined;
    }
    console.error(`[turnstile] GET /config → HTTP ${res.status}`);
  } catch (e) {
    console.error(`[turnstile] GET /config échec : ${(e as Error).message}`);
  }
  return undefined;
}

/**
 * Vérifie un token Turnstile côté serveur via le back-office. Fail-closed :
 * toute impossibilité de confirmer un succès (config absente, réseau, non-2xx,
 * ou `success:false` — y compris tenant non câblé) rejette la soumission.
 */
export async function verifyTurnstileToken(
  config: SiteConfig,
  token: string | undefined,
  ip: string | null,
): Promise<boolean> {
  const base = backofficeBase();
  const key = backofficeKey();
  if (!base || !key) {
    console.error("[turnstile] BACKOFFICE_API_URL/KEY absente — vérif impossible (rejet)");
    return false;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/v1/public/turnstile/verify`, {
      method: "POST",
      headers: { "X-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ tenant: tenantSlug(config), token: token ?? "", ip: ip ?? "" }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean };
      return data.success === true; // no_widget ⇒ success:false ⇒ rejet
    }
    console.error(`[turnstile] POST /verify → HTTP ${res.status} (rejet)`);
  } catch (e) {
    console.error(`[turnstile] POST /verify échec : ${(e as Error).message} (rejet)`);
  } finally {
    clearTimeout(timer);
  }
  return false;
}
