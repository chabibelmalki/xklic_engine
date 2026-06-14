import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs, siteLocales, defaultLocale } from "@/lib/config-loader";
import { AvisPage } from "@/components/AvisPage";
import { DevSwitcher } from "@/components/DevSwitcher";
import { isLocale, buildLocaleBasePath } from "@/lib/i18n";

/** Avis localisé en PREVIEW : "/preview/<slug>/en/avis". */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => {
    if (!getConfig(slug)?.googleReviewUrl) return [];
    const def = defaultLocale(slug);
    return siteLocales(slug)
      .filter((l) => l !== def)
      .map((seg) => ({ slug, seg }));
  });
}

export default async function PreviewLocaleAvis({
  params,
}: {
  params: Promise<{ slug: string; seg: string }>;
}) {
  const { slug, seg } = await params;
  if (!isLocale(seg, siteLocales(slug), defaultLocale(slug))) notFound();
  const cfg = getConfig(slug, seg);
  if (!cfg?.googleReviewUrl) notFound();
  return (
    <>
      <DevSwitcher slugs={listSlugs()} current={slug} />
      <AvisPage
        config={cfg}
        reviewUrl={cfg.googleReviewUrl}
        locale={seg}
        basePath={buildLocaleBasePath(`/preview/${slug}`, seg, defaultLocale(slug))}
      />
    </>
  );
}
