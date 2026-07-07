import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs, siteLocales, defaultLocale } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { DevSwitcher } from "@/components/DevSwitcher";
import { getPage } from "@/lib/pages";
import { resolveSegSub, buildLocaleBasePath } from "@/lib/i18n";

/** Sous-page en langue non-défaut en PREVIEW : "/preview/<slug>/en/tarifs". Non indexé. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Route de DEV (noindex) : rendu à la demande, hors prérendu (économie ISR writes).
export const dynamic = "force-dynamic";

export default async function PreviewSegSub({
  params,
}: {
  params: Promise<{ slug: string; seg: string; sub: string }>;
}) {
  const { slug, seg, sub } = await params;
  const r = resolveSegSub(seg, sub, siteLocales(slug), defaultLocale(slug));
  if (!r) notFound();
  const cfg = getConfig(slug, r.locale);
  if (!cfg) notFound();
  const page = getPage(cfg, r.pageSlug);
  if (!page || page.isHome) notFound();
  return (
    <>
      <DevSwitcher slugs={listSlugs()} current={slug} />
      <SiteRenderer
        config={cfg}
        page={page}
        locale={r.locale}
        basePath={buildLocaleBasePath(`/preview/${slug}`, r.locale, defaultLocale(slug))}
      />
    </>
  );
}
