import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs, siteLocales, defaultLocale } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { DevSwitcher } from "@/components/DevSwitcher";
import { getPage, subPageSlugs } from "@/lib/pages";
import { resolveSegSub, buildLocaleBasePath } from "@/lib/i18n";

/** Sous-page en langue non-défaut en PREVIEW : "/preview/<slug>/en/tarifs". Non indexé. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => {
    const def = defaultLocale(slug);
    const out: { slug: string; seg: string; sub: string }[] = [];
    for (const loc of siteLocales(slug).filter((l) => l !== def)) {
      const cfg = getConfig(slug, loc);
      if (!cfg) continue;
      for (const sub of subPageSlugs(cfg)) out.push({ slug, seg: loc, sub });
    }
    return out;
  });
}

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
