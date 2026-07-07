import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs, siteLocales, defaultLocale } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { buildMetadata } from "@/lib/seo";
import { getPage, subPageSlugs } from "@/lib/pages";
import { resolveSeg, buildLocaleBasePath } from "@/lib/i18n";

/**
 * Segment dual d'un site multi-tenant : "/sites/<slug>/en" (accueil EN) ou
 * "/sites/<slug>/tarifs" (page en langue défaut). Servi sur le sous-domaine via
 * le middleware ; basePath public = "" (défaut) ou "/<locale>".
 */
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => {
    const def = getConfig(slug);
    if (!def) return [];
    const segs = [
      ...siteLocales(slug).filter((l) => l !== defaultLocale(slug)),
      ...subPageSlugs(def),
    ];
    return segs.map((seg) => ({ slug, seg }));
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; seg: string }>;
}): Promise<Metadata> {
  const { slug, seg } = await params;
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

export default async function TenantSeg({
  params,
}: {
  params: Promise<{ slug: string; seg: string }>;
}) {
  const { slug, seg } = await params;
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
