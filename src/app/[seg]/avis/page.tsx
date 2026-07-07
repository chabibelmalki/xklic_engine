import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, getDefaultSlug, siteLocales, defaultLocale } from "@/lib/config-loader";
import { AvisPage } from "@/components/AvisPage";
import { buildAvisMetadata } from "@/lib/seo";
import { isLocale, buildLocaleBasePath } from "@/lib/i18n";

/** Avis en LANGUE non-défaut du site par défaut : "/en/avis". */
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  const slug = getDefaultSlug();
  if (!getConfig(slug)?.googleReviewUrl) return [];
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
  return cfg?.googleReviewUrl ? buildAvisMetadata(cfg, seg) : {};
}

export default async function LocaleAvis({ params }: { params: Promise<{ seg: string }> }) {
  const { seg } = await params;
  const slug = getDefaultSlug();
  if (!isLocale(seg, siteLocales(slug), defaultLocale(slug))) notFound();
  const cfg = getConfig(slug, seg);
  if (!cfg?.googleReviewUrl) notFound();
  return (
    <AvisPage
      config={cfg}
      reviewUrl={cfg.googleReviewUrl}
      locale={seg}
      basePath={buildLocaleBasePath("", seg, defaultLocale(slug))}
    />
  );
}
