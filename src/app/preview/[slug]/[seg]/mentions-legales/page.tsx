import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs, siteLocales, defaultLocale } from "@/lib/config-loader";
import { MentionsLegalesPage } from "@/components/MentionsLegalesPage";
import { DevSwitcher } from "@/components/DevSwitcher";
import { isLocale, buildLocaleBasePath } from "@/lib/i18n";

/** Mentions légales localisées en PREVIEW : "/preview/<slug>/en/mentions-legales". */
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Route de DEV (noindex) : rendu à la demande, hors prérendu (économie ISR writes).
export const dynamic = "force-dynamic";

export default async function PreviewLocaleLegal({
  params,
}: {
  params: Promise<{ slug: string; seg: string }>;
}) {
  const { slug, seg } = await params;
  if (!isLocale(seg, siteLocales(slug), defaultLocale(slug))) notFound();
  const cfg = getConfig(slug, seg);
  if (!cfg) notFound();
  return (
    <>
      <DevSwitcher slugs={listSlugs()} current={slug} />
      <MentionsLegalesPage
        config={cfg}
        locale={seg}
        basePath={buildLocaleBasePath(`/preview/${slug}`, seg, defaultLocale(slug))}
      />
    </>
  );
}
