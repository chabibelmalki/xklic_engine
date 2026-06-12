import type { Metadata } from "next";
import type { SiteConfig, HeroContent, PageHeroContent, Meta, Seo } from "@/types/config";
import { siteOrigin } from "@/lib/urls";
import { getHomePage, type ResolvedPage } from "@/lib/pages";
import { htmlLang, ogLocale, localizedPath } from "@/lib/i18n";

/**
 * Alternates hreflang d'un chemin (relatifs ; `metadataBase` les rend absolus).
 * `undefined` pour un site monolingue (aucune balise alternate superflue).
 */
function localeAlternates(config: SiteConfig, path: string): Record<string, string> | undefined {
  const langs = config.i18n?.languages;
  const def = config.i18n?.default;
  if (!langs || !def || langs.length < 2) return undefined;
  const out: Record<string, string> = {};
  for (const loc of langs) out[htmlLang(loc)] = localizedPath(path, loc, def);
  out["x-default"] = localizedPath(path, def, def);
  return out;
}

/**
 * Métadonnées par PAGE, dérivées de la config. Uniques par page (jamais de
 * boilerplate partagé -> pas de duplicate content). La ville est injectée quand
 * le contenu propre ne la porte pas déjà.
 *
 * Héritage : `page.meta` / `page.seo` surchargent les valeurs au niveau site.
 * Le canonical pointe sur le chemin de la page ("/" ou "/services").
 */

function heroTitleOf(page: ResolvedPage): string | undefined {
  for (const b of page.blocks) {
    if (b.type === "hero") return (b.content as HeroContent)?.titre;
    if (b.type === "pageHero") return (b.content as PageHeroContent)?.titre;
  }
  return undefined;
}

function heroAccrocheOf(page: ResolvedPage): string | undefined {
  for (const b of page.blocks) {
    if (b.type === "hero") {
      const c = b.content as HeroContent;
      return c?.accroche || c?.sousTitre || c?.titre;
    }
    if (b.type === "pageHero") {
      const c = b.content as PageHeroContent;
      return c?.intro || c?.titre;
    }
  }
  return undefined;
}

function heroImageOf(page: ResolvedPage): string | undefined {
  for (const b of page.blocks) {
    if (b.type === "hero") return (b.content as HeroContent)?.image?.url;
  }
  return undefined;
}

function effective(config: SiteConfig, page: ResolvedPage): { meta: Meta; seo: Seo } {
  return {
    meta: { ...config.meta, ...(page.meta ?? {}) },
    seo: { ...config.seo, ...(page.seo ?? {}) },
  };
}

function pageTitle(config: SiteConfig, page: ResolvedPage): string {
  const { meta, seo } = effective(config, page);
  const nom = config.entreprise.nom;
  if (page.isHome) {
    if (meta.title) return meta.title;
    const t = heroTitleOf(page);
    const base = t ? `${nom} — ${t}` : nom;
    return base.includes(seo.ville) ? base : `${base} à ${seo.ville}`;
  }
  // Pages intérieures.
  if (meta.title) return `${meta.title} — ${nom}`;
  const label = heroTitleOf(page) ?? page.label;
  const base = `${label} — ${nom}`;
  return base.includes(seo.ville) ? base : `${base} à ${seo.ville}`;
}

function pageDescription(config: SiteConfig, page: ResolvedPage): string {
  const { meta, seo } = effective(config, page);
  if (meta.description) return meta.description;
  const accroche = heroAccrocheOf(page) || page.label;
  return `${accroche} — ${config.entreprise.nom}, ${seo.ville}.`.slice(0, 300);
}

/** Titre/description par défaut de l'accueil (compat anciens appels). */
export function defaultTitle(config: SiteConfig): string {
  return pageTitle(config, getHomePage(config));
}
export function defaultDescription(config: SiteConfig): string {
  return pageDescription(config, getHomePage(config));
}

/** Construit l'objet Metadata Next pour une page (accueil par défaut), localisée. */
export function buildMetadata(config: SiteConfig, page?: ResolvedPage, locale?: string): Metadata {
  const p = page ?? getHomePage(config);
  const { meta } = effective(config, p);
  const origin = siteOrigin(config);
  const def = config.i18n?.default ?? "fr";
  const loc = locale ?? def;
  const title = pageTitle(config, p);
  const description = pageDescription(config, p);
  const image = meta.ogImage || heroImageOf(p) || config.branding.logo;
  const canonical = localizedPath(p.path, loc, def);
  const others = (config.i18n?.languages ?? []).filter((l) => l !== loc);

  return {
    metadataBase: new URL(origin),
    title,
    description,
    keywords: meta.keywords,
    alternates: { canonical, languages: localeAlternates(config, p.path) },
    robots: p.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: config.entreprise.nom,
      title,
      description,
      url: canonical === "/" ? origin : `${origin}${canonical}`,
      locale: ogLocale(loc),
      ...(others.length ? { alternateLocale: others.map(ogLocale) } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/** Métadonnées de la page mentions légales d'un site (localisée). */
export function buildLegalMetadata(config: SiteConfig, locale?: string): Metadata {
  const def = config.i18n?.default ?? "fr";
  const loc = locale ?? def;
  return {
    metadataBase: new URL(siteOrigin(config)),
    title: `Mentions légales — ${config.entreprise.nom}`,
    description: `Mentions légales de ${config.entreprise.nom} (${config.seo.ville}).`,
    alternates: {
      canonical: localizedPath("/mentions-legales", loc, def),
      languages: localeAlternates(config, "/mentions-legales"),
    },
    robots: { index: false, follow: true },
  };
}

/** Métadonnées de la page politique de confidentialité d'un site (localisée). */
export function buildConfidentialiteMetadata(config: SiteConfig, locale?: string): Metadata {
  const def = config.i18n?.default ?? "fr";
  const loc = locale ?? def;
  return {
    metadataBase: new URL(siteOrigin(config)),
    title: `Politique de confidentialité — ${config.entreprise.nom}`,
    description: `Politique de confidentialité de ${config.entreprise.nom} (${config.seo.ville}).`,
    alternates: {
      canonical: localizedPath("/confidentialite", loc, def),
      languages: localeAlternates(config, "/confidentialite"),
    },
    robots: { index: false, follow: true },
  };
}
