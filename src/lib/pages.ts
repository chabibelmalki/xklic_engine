import type { SiteConfig, PageConfig, Block } from "@/types/config";

/**
 * Résolution des pages d'un site. Le multi-page est piloté par `config.pages`.
 *
 * Rétro-compatibilité : un site SANS `pages` est traité comme un one-pager —
 * une seule page d'accueil (slug "") dont les blocs sont `config.blocks`.
 */

export interface ResolvedPage extends PageConfig {
  /** Slug normalisé : "" pour l'accueil, sinon "services", "tarifs"… */
  slug: string;
  /** true si c'est la page d'accueil. */
  isHome: boolean;
  /** Chemin relatif au site : "/" pour l'accueil, sinon "/services". */
  path: string;
}

/** Normalise un slug de page : "", "index", "/", "/services" → "" ou "services". */
export function normalizePageSlug(slug: string | undefined | null): string {
  const s = (slug ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (s === "" || s === "index" || s === "home" || s === "accueil") return "";
  return s;
}

/** Toutes les pages résolues d'un site (multi-page ou one-pager). */
export function resolvePages(config: SiteConfig): ResolvedPage[] {
  if (config.pages?.length) {
    return config.pages.map((p) => {
      const slug = normalizePageSlug(p.slug);
      return { ...p, slug, isHome: slug === "", path: slug === "" ? "/" : `/${slug}` };
    });
  }
  // One-pager : une seule page d'accueil dérivée de `blocks`.
  return [
    {
      slug: "",
      label: "Accueil",
      blocks: config.blocks ?? [],
      isHome: true,
      path: "/",
    },
  ];
}

/** true si le site est multi-page (au moins une page non-accueil). */
export function isMultiPage(config: SiteConfig): boolean {
  return (config.pages?.length ?? 0) > 0;
}

/** Récupère une page par son slug (normalisé), ou null. */
export function getPage(config: SiteConfig, pageSlug: string | undefined | null): ResolvedPage | null {
  const target = normalizePageSlug(pageSlug);
  return resolvePages(config).find((p) => p.slug === target) ?? null;
}

/** La page d'accueil (toujours présente). */
export function getHomePage(config: SiteConfig): ResolvedPage {
  const pages = resolvePages(config);
  return pages.find((p) => p.isHome) ?? pages[0];
}

/** Pages affichées dans la navigation (hors `navHidden`, hors accueil masqué). */
export function navPages(config: SiteConfig): ResolvedPage[] {
  return resolvePages(config).filter((p) => !p.navHidden);
}

/** Slugs des pages NON-accueil (pour generateStaticParams des routes de page). */
export function subPageSlugs(config: SiteConfig): string[] {
  return resolvePages(config)
    .filter((p) => !p.isHome)
    .map((p) => p.slug);
}

/** Tous les blocs du site, aplatis sur toutes les pages (ordre des pages). */
export function allBlocks(config: SiteConfig): Block[] {
  return resolvePages(config).flatMap((p) => p.blocks ?? []);
}

/** Premier bloc d'un type donné, cherché sur l'ensemble des pages. */
export function findBlock<C = unknown>(
  config: SiteConfig,
  type: string,
): { type: string; variant?: string; mode?: string; content: C } | undefined {
  for (const b of allBlocks(config)) {
    if (b.type === type) return b as { type: string; variant?: string; mode?: string; content: C };
  }
  return undefined;
}
