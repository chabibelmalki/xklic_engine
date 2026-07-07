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
 * REPLI DE MIGRATION (retiré à la fin — cf. Étape 5) : tant que la config DB
 * n'est pas branchée partout, on retombe sur les variables d'env historiques
 * (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` pour la sitekey, `TURNSTILE_SECRET_KEY` pour
 * la vérif). Le repli couvre : back-office indisponible, tenant pas encore câblé
 * (réponse `no_widget`), ou clé de chiffrement absente côté back-office (503).
 *
 * Base + clé : réutilise la paire `BACKOFFICE_API_URL` / `BACKOFFICE_API_KEY`
 * (= `ENGINE_API_KEY` côté back-office), header `X-API-Key`, comme
 * `src/lib/backoffice.ts`. Jamais de `NEXT_PUBLIC_*` pour la clé.
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

function envSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
}

/**
 * Sitekey publique Turnstile pour un site, ou `undefined` si l'anti-robot est
 * désactivé (local, ou site non opt-in via `forms.turnstile`). Résolue au
 * build/ISR depuis le back-office ; repli sur l'env pendant la migration.
 */
export async function getTurnstileSiteKey(config: SiteConfig): Promise<string | undefined> {
  if (isLocalTestMode()) return undefined;
  if (!config.forms?.turnstile) return undefined;

  const base = backofficeBase();
  const key = backofficeKey();
  if (base && key) {
    try {
      // Pas d'AbortController ici : un `signal` désactive la mémoïsation + le Data
      // Cache de Next (cf. docs fetch). La sitekey change rarement ⇒ on cache la
      // réponse (revalidation quotidienne), partagée entre pages au build/ISR.
      const res = await fetch(
        `${base}/v1/public/tenants/${encodeURIComponent(tenantSlug(config))}/config`,
        {
          headers: { "X-API-Key": key },
          next: { revalidate: 86_400 },
        },
      );
      if (res.ok) {
        const data = (await res.json()) as { turnstile_sitekey?: string };
        const sk = data.turnstile_sitekey?.trim();
        if (sk) return sk; // sitekey vide ⇒ tenant non câblé ⇒ repli env ci-dessous.
      } else {
        console.error(`[turnstile] GET /config → HTTP ${res.status} (repli env)`);
      }
    } catch (e) {
      console.error(`[turnstile] GET /config échec : ${(e as Error).message} (repli env)`);
    }
  }
  return envSiteKey();
}

/**
 * Vérifie un token Turnstile côté serveur. Appelle le back-office ; ne retombe
 * sur le siteverify LOCAL que si le back-office ne peut pas trancher (réseau,
 * non-2xx, ou tenant non câblé `no_widget`). Une réponse 200 `success:false`
 * (token réellement invalide) rejette — pas de repli qui la contournerait.
 */
export async function verifyTurnstileToken(
  config: SiteConfig,
  token: string | undefined,
  ip: string | null,
): Promise<boolean> {
  const base = backofficeBase();
  const key = backofficeKey();
  if (base && key) {
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
        const data = (await res.json()) as { success?: boolean; error?: string };
        // Tenant pas (encore) câblé côté back-office : repli migration sur le secret local.
        if (data.error === "no_widget") return verifyTurnstileLocal(token, ip);
        return data.success === true;
      }
      // 503 (clé de chiffrement absente) ou autre non-2xx : repli local.
      console.error(`[turnstile] POST /verify → HTTP ${res.status} (repli local)`);
    } catch (e) {
      console.error(`[turnstile] POST /verify échec : ${(e as Error).message} (repli local)`);
    } finally {
      clearTimeout(timer);
    }
  }
  return verifyTurnstileLocal(token, ip);
}

/**
 * Repli de migration : siteverify direct avec `TURNSTILE_SECRET_KEY`. Secret
 * absent ⇒ on laisse passer (comportement historique : anti-robot non activé
 * côté env). Retiré à la fin de la migration (Étape 5).
 */
async function verifyTurnstileLocal(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
