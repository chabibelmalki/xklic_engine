import type { SiteConfig } from "@/types/config";

/** Réduit une valeur de domaine (URL, host:port, host/path) à un host nu. */
function bareHost(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
}

/**
 * Domaine CANONIQUE perso d'un site (apex), ou `null` si le site vit sur son
 * sous-domaine `<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>`.
 *
 * Priorité : `customDomains[0]` (apex canonique) → `domain` (legacy mono-host).
 * Point unique consommé par `siteOrigin` ET par le générateur de manifeste
 * (qui réimplémente la même règle en JS pour rester edge-safe).
 */
export function canonicalDomain(config: SiteConfig): string | null {
  const raw = config.customDomains?.[0]?.trim() || config.domain?.trim();
  return raw ? bareHost(raw) : null;
}

/**
 * SOURCE DE VÉRITÉ UNIQUE de l'URL publique (origin) d'un site = là où il est
 * RÉELLEMENT servi. Réutilisée par canonical, hreflang, OpenGraph, sitemap ET
 * JSON-LD (aucune logique de domaine dupliquée ailleurs).
 *
 * RÈGLE :
 *   - domaine perso (`customDomains[0]`, sinon `domain`) → `https://<apex>` ;
 *   - sinon  → `https://<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>` (= `<slug>.xklic.com`) ;
 *   - dev / env absent → `http://localhost:3000`.
 */
export function siteOrigin(config: SiteConfig): string {
  const canon = canonicalDomain(config);
  if (canon) return `https://${canon}`;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (root) return `https://${config.slug}.${root}`;
  return "http://localhost:3000";
}

/** URL absolue d'un chemin pour un site donné. */
export function siteUrl(config: SiteConfig, path = "/"): string {
  const origin = siteOrigin(config);
  return path === "/" ? origin : `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
