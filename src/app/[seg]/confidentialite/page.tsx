import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, getDefaultSlug, siteLocales, defaultLocale } from "@/lib/config-loader";
import { ConfidentialitePage } from "@/components/ConfidentialitePage";
import { buildConfidentialiteMetadata } from "@/lib/seo";
import { isLocale, buildLocaleBasePath } from "@/lib/i18n";

/** Confidentialité en LANGUE non-défaut du site par défaut : "/en/confidentialite". */
export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  const slug = getDefaultSlug();
  const def = defaultLocale(slug);
  return siteLocales(slug)
    .filter((l) => l !== def)
    .map((seg) => ({ seg }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seg: string }>;
}): Promise<Metadata> {
  const { seg } = await params;
  const slug = getDefaultSlug();
  if (!isLocale(seg, siteLocales(slug), defaultLocale(slug))) return {};
  const cfg = getConfig(slug, seg);
  return cfg ? buildConfidentialiteMetadata(cfg, seg) : {};
}

export default async function LocaleConfidentialite({
  params,
}: {
  params: Promise<{ seg: string }>;
}) {
  const { seg } = await params;
  const slug = getDefaultSlug();
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
