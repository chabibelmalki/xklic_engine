import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, getDefaultSlug, siteLocales, defaultLocale } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { buildMetadata } from "@/lib/seo";
import { getPage, subPageSlugs } from "@/lib/pages";
import { resolveSeg, buildLocaleBasePath } from "@/lib/i18n";

/**
 * Segment dual du site PAR DÉFAUT (apex). `[seg]` vaut soit une LANGUE non-défaut
 * ("/en" → accueil EN), soit un SLUG de page en langue défaut ("/tarifs"). Les
 * routes statiques sœurs (mentions-legales, sitemap.xml…) priment sur ce segment.
 */
export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  const slug = getDefaultSlug();
  const def = getConfig(slug);
  if (!def) return [];
  const segs = [
    ...siteLocales(slug).filter((l) => l !== defaultLocale(slug)),
    ...subPageSlugs(def),
  ];
  return segs.map((seg) => ({ seg }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seg: string }>;
}): Promise<Metadata> {
  const { seg } = await params;
  const slug = getDefaultSlug();
  const def = getConfig(slug);
  if (!def) return {};
  const r = resolveSeg(seg, siteLocales(slug), defaultLocale(slug));
  if (r.kind === "localeHome") {
    const cfg = getConfig(slug, r.locale);
    return cfg ? buildMetadata(cfg, undefined, r.locale) : {};
  }
  const page = getPage(def, r.pageSlug);
  return page && !page.isHome ? buildMetadata(def, page, r.locale) : {};
}

export default async function DefaultSeg({ params }: { params: Promise<{ seg: string }> }) {
  const { seg } = await params;
  const slug = getDefaultSlug();
  const def = getConfig(slug);
  if (!def) notFound();
  const r = resolveSeg(seg, siteLocales(slug), defaultLocale(slug));

  if (r.kind === "localeHome") {
    const cfg = getConfig(slug, r.locale);
    if (!cfg) notFound();
    return (
      <SiteRenderer
        config={cfg}
        locale={r.locale}
        basePath={buildLocaleBasePath("", r.locale, defaultLocale(slug))}
      />
    );
  }

  const page = getPage(def, r.pageSlug);
  if (!page || page.isHome) notFound();
  return <SiteRenderer config={def} page={page} locale={r.locale} />;
}
