import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs } from "@/lib/config-loader";
import { ConfidentialitePage } from "@/components/ConfidentialitePage";
import { DevSwitcher } from "@/components/DevSwitcher";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Route de DEV (noindex) : rendu à la demande, hors prérendu (économie ISR writes).
export const dynamic = "force-dynamic";

export default async function PreviewConfidentialite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config) notFound();

  // Routes /preview déjà noindex : on affiche la barre quel que soit le mode.
  return (
    <>
      <DevSwitcher slugs={listSlugs()} current={slug} />
      <ConfidentialitePage config={config} basePath={`/preview/${slug}`} />
    </>
  );
}
