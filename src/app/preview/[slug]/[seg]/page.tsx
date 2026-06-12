import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs, siteLocales, defaultLocale } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { DevSwitcher } from "@/components/DevSwitcher";
import { getPage, subPageSlugs } from "@/lib/pages";
import { resolveSeg, buildLocaleBasePath } from "@/lib/i18n";

/** Segment dual en PREVIEW (dev) : "/preview/<slug>/en" ou "/preview/<slug>/tarifs". Non indexé. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

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

export default async function PreviewSeg({
  params,
}: {
  params: Promise<{ slug: string; seg: string }>;
}) {
  const { slug, seg } = await params;
  const def = getConfig(slug);
  if (!def) notFound();
  const r = resolveSeg(seg, siteLocales(slug), defaultLocale(slug));
  const previewBase = `/preview/${slug}`;

  if (r.kind === "localeHome") {
    const cfg = getConfig(slug, r.locale);
    if (!cfg) notFound();
    return (
      <>
        <DevSwitcher slugs={listSlugs()} current={slug} />
        <SiteRenderer
          config={cfg}
          locale={r.locale}
          basePath={buildLocaleBasePath(previewBase, r.locale, defaultLocale(slug))}
        />
      </>
    );
  }

  const page = getPage(def, r.pageSlug);
  if (!page || page.isHome) notFound();
  return (
    <>
      <DevSwitcher slugs={listSlugs()} current={slug} />
      <SiteRenderer config={def} page={page} locale={r.locale} basePath={previewBase} />
    </>
  );
}
