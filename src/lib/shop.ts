// SERVEUR UNIQUEMENT — pont vers le back-office e-commerce (API Go).
// La clé partagée ENGINE_API_KEY ne doit JAMAIS atteindre le client : les blocs
// boutique passent par les proxys /api/shop/* qui appellent ces helpers.
import type { SiteConfig } from "@/types/config";

/** URL de l'API back-office (env SHOP_API_URL ; défaut : dev local). */
function shopApiUrl(): string {
  return (process.env.SHOP_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

/**
 * Slug du tenant côté back-office pour un site, ou `null` si la boutique n'est
 * pas activée (`config.shop.enabled`). Par défaut le tenant back-office porte
 * le même slug que le site engine.
 */
export function shopTenant(config: SiteConfig): string | null {
  if (!config.shop?.enabled) return null;
  return config.shop.tenant?.trim() || config.slug;
}

/**
 * Appel authentifié au back-office. `cache: no-store` : le catalogue (stock,
 * prix) doit être frais à chaque affichage — c'est tout l'intérêt du bloc live.
 */
export async function shopFetch(path: string, init?: RequestInit): Promise<Response> {
  const key = process.env.ENGINE_API_KEY?.trim();
  if (!key) throw new Error("ENGINE_API_KEY manquante (env engine)");
  return fetch(`${shopApiUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers ?? {}),
      "X-API-Key": key,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}
