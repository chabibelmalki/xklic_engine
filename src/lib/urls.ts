import type { SiteConfig } from "@/types/config";

/**
 * SOURCE DE VÉRITÉ UNIQUE de l'URL publique (origin) d'un site = là où il est
 * RÉELLEMENT servi. Réutilisée par canonical, hreflang, OpenGraph, sitemap ET
 * JSON-LD (aucune logique de domaine dupliquée ailleurs).
 *
 * RÈGLE :
 *   - `config.domain` présent  → `https://<domain>`  (domaine perso, voir le
 *     commentaire de `SiteConfig.domain` : à câbler réellement sur Vercel + DNS) ;
 *   - sinon                     → `https://<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>`
 *     (= `<slug>.xklic.com` en prod) ;
 *   - dev / env absent          → `http://localhost:3000`.
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
