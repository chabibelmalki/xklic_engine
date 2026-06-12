import type { SiteConfig } from "@/types/config";

/**
 * Calcule l'URL canonique (origin) d'un site.
 * Priorité : `config.domain` -> `<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>` -> localhost.
 * En prod, chaque site est servi sur son sous-domaine (voir middleware.ts).
 */
export function siteOrigin(config: SiteConfig): string {
  if (config.domain) {
    return config.domain.startsWith("http")
      ? config.domain.replace(/\/$/, "")
      : `https://${config.domain}`;
  }
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (root) return `https://${config.slug}.${root}`;
  return "http://localhost:3000";
}

/** URL absolue d'un chemin pour un site donné. */
export function siteUrl(config: SiteConfig, path = "/"): string {
  const origin = siteOrigin(config);
  return path === "/" ? origin : `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
