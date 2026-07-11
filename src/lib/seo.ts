import type { Metadata } from "next";
import type { SiteConfig, HeroContent, PageHeroContent, Meta, Seo } from "@/types/config";
import { siteOrigin } from "@/lib/urls";
import { getHomePage, type ResolvedPage } from "@/lib/pages";
import { htmlLang, ogLocale, localizedPath } from "@/lib/i18n";
import { buildIcons } from "@/lib/favicon";
import { ui } from "@/i18n/ui";

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

/** 1re URL d'image dans une structure de blocs (ImageRef = objet `{ url }`). */
function findFirstImageUrl(val: unknown): string | undefined {
  if (!val || typeof val !== "object") return undefined;
  if (Array.isArray(val)) {
    for (const v of val) {
      const u = findFirstImageUrl(v);
      if (u) return u;
    }
    return undefined;
  }
  const o = val as Record<string, unknown>;
  if (typeof o.url === "string" && /^https?:\/\//.test(o.url)) return o.url;
  for (const k of Object.keys(o)) {
    const u = findFirstImageUrl(o[k]);
    if (u) return u;
  }
  return undefined;
}

/**
 * Visuel OG d'une page : hero de la page → 1re image de la page (galerie,
 * produits, services…) → 1re image de l'accueil (le site a en général un visuel
 * « vitrine »). Garantit un `og:image` dès que le site contient une image.
 */
function pageImage(config: SiteConfig, page: ResolvedPage): string | undefined {
  return (
    heroImageOf(page) ??
    findFirstImageUrl(page.blocks) ??
    findFirstImageUrl(getHomePage(config).blocks)
  );
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
    // La home porte TOUJOURS la marque (c'est la page d'entité) : préfixée si
    // le meta.title du config ne la contient pas déjà.
    if (meta.title) {
      return meta.title.toLowerCase().includes(nom.toLowerCase())
        ? meta.title
        : `${nom} — ${meta.title}`;
    }
    const t = heroTitleOf(page);
    const base = t ? `${nom} — ${t}` : nom;
    return base.includes(seo.ville) ? base : `${base} à ${seo.ville}`;
  }
  // Pages intérieures. Suffixe de marque ajouté UNIQUEMENT si le title ne
  // porte pas déjà le nom (sinon « … — Marque — Marque », tronqué en SERP).
  if (meta.title) {
    return meta.title.toLowerCase().includes(nom.toLowerCase())
      ? meta.title
      : `${meta.title} — ${nom}`;
  }
  const label = heroTitleOf(page) ?? page.label;
  const base = label.toLowerCase().includes(nom.toLowerCase()) ? label : `${label} — ${nom}`;
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

/**
 * Directive robots EXPLICITE d'une page tenant — jamais `undefined`. Le layout
 * racine pose `noindex, nofollow` (pages internes du moteur) et le merge
 * Metadata de Next est superficiel : une page qui omet la clé `robots` hérite
 * du noindex du layout et disparaît de Google en silence — le layout tenant
 * (src/app/sites/[slug]/layout.tsx) pose ce défaut en filet de sécurité, et
 * chaque builder le rend explicite par page. `noindexSite` met toutes les
 * pages en noindex PAR COHÉRENCE avec robots.txt `Disallow: /` (qui porte la
 * non-indexation effective des démos ; le meta seul ne suffirait pas — une
 * URL bloquée au crawl mais liée de l'extérieur peut rester indexée en
 * « URL seule »).
 */
export function pageRobots(config: SiteConfig, noindex?: boolean): Metadata["robots"] {
  return { index: !(noindex || config.noindexSite), follow: true };
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
  const image = meta.ogImage || pageImage(config, p) || config.branding.logo;
  const canonical = localizedPath(p.path, loc, def);
  const others = (config.i18n?.languages ?? []).filter((l) => l !== loc);

  return {
    metadataBase: new URL(origin),
    title,
    description,
    keywords: meta.keywords,
    icons: buildIcons(config),
    alternates: { canonical, languages: localeAlternates(config, p.path) },
    robots: pageRobots(config, p.noindex),
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
    icons: buildIcons(config),
    alternates: {
      canonical: localizedPath("/mentions-legales", loc, def),
      languages: localeAlternates(config, "/mentions-legales"),
    },
    robots: pageRobots(config, true),
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
    icons: buildIcons(config),
    alternates: {
      canonical: localizedPath("/confidentialite", loc, def),
      languages: localeAlternates(config, "/confidentialite"),
    },
    robots: pageRobots(config, true),
  };
}

/** Métadonnées de la page « Laissez un avis » d'un site (localisée). */
export function buildAvisMetadata(config: SiteConfig, locale?: string): Metadata {
  const def = config.i18n?.default ?? "fr";
  const loc = locale ?? def;
  const t = ui(loc);
  return {
    metadataBase: new URL(siteOrigin(config)),
    title: `${t.avis.pageTitle} — ${config.entreprise.nom}`,
    description: t.avis.metaDescription,
    icons: buildIcons(config),
    alternates: {
      canonical: localizedPath("/avis", loc, def),
      languages: localeAlternates(config, "/avis"),
    },
    // Page utilitaire (dépôt d'avis via QR/lien direct) : hors index.
    robots: pageRobots(config, true),
  };
}
