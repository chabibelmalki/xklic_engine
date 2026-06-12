import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, getDefaultSlug, siteLocales, defaultLocale } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { buildMetadata } from "@/lib/seo";
import { getPage, subPageSlugs } from "@/lib/pages";
import { resolveSegSub, buildLocaleBasePath } from "@/lib/i18n";

/**
 * Sous-page en LANGUE non-défaut du site par défaut : "/en/tarifs", "/ar/contact".
 * `seg` DOIT être une langue (sinon 404). En langue défaut, les pages passent par
 * `[seg]` (pas d'imbrication).
 */
export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  const slug = getDefaultSlug();
  const def = defaultLocale(slug);
  const out: { seg: string; sub: string }[] = [];
  for (const loc of siteLocales(slug).filter((l) => l !== def)) {
    const cfg = getConfig(slug, loc);
    if (!cfg) continue;
    for (const sub of subPageSlugs(cfg)) out.push({ seg: loc, sub });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seg: string; sub: string }>;
}): Promise<Metadata> {
  const { seg, sub } = await params;
  const slug = getDefaultSlug();
  const r = resolveSegSub(seg, sub, siteLocales(slug), defaultLocale(slug));
  if (!r) return {};
  const cfg = getConfig(slug, r.locale);
  if (!cfg) return {};
  const page = getPage(cfg, r.pageSlug);
  return page && !page.isHome ? buildMetadata(cfg, page, r.locale) : {};
}

export default async function DefaultSegSub({
  params,
}: {
  params: Promise<{ seg: string; sub: string }>;
}) {
  const { seg, sub } = await params;
  const slug = getDefaultSlug();
  const r = resolveSegSub(seg, sub, siteLocales(slug), defaultLocale(slug));
  if (!r) notFound();
  const cfg = getConfig(slug, r.locale);
  if (!cfg) notFound();
  const page = getPage(cfg, r.pageSlug);
  if (!page || page.isHome) notFound();
  return (
    <SiteRenderer
      config={cfg}
      page={page}
      locale={r.locale}
      basePath={buildLocaleBasePath("", r.locale, defaultLocale(slug))}
    />
  );
}
