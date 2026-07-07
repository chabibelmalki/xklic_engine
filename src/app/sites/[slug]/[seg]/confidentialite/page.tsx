import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs, siteLocales, defaultLocale } from "@/lib/config-loader";
import { ConfidentialitePage } from "@/components/ConfidentialitePage";
import { buildConfidentialiteMetadata } from "@/lib/seo";
import { isLocale, buildLocaleBasePath } from "@/lib/i18n";

/** Confidentialité en langue non-défaut d'un site tenant : "/sites/<slug>/en/confidentialite". */
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return listSlugs().flatMap((slug) => {
    const def = defaultLocale(slug);
    return siteLocales(slug)
      .filter((l) => l !== def)
      .map((seg) => ({ slug, seg }));
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; seg: string }>;
}): Promise<Metadata> {
  const { slug, seg } = await params;
  if (!isLocale(seg, siteLocales(slug), defaultLocale(slug))) return {};
  const cfg = getConfig(slug, seg);
  return cfg ? buildConfidentialiteMetadata(cfg, seg) : {};
}

export default async function TenantLocaleConfidentialite({
  params,
}: {
  params: Promise<{ slug: string; seg: string }>;
}) {
  const { slug, seg } = await params;
  if (!isLocale(seg, siteLocales(slug), defaultLocale(slug))) notFound();
  const cfg = getConfig(slug, seg);
  if (!cfg) notFound();
  return (
    <ConfidentialitePage
      config={cfg}
      locale={seg}
      basePath={buildLocaleBasePath("", seg, defaultLocale(slug))}
    />
  );
}
