import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs } from "@/lib/config-loader";
import { AvisPage } from "@/components/AvisPage";
import { DevSwitcher } from "@/components/DevSwitcher";

/** Page « Laissez un avis » en PREVIEW : "/preview/<slug>/avis". */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return listSlugs()
    .filter((slug) => getConfig(slug)?.googleReviewUrl)
    .map((slug) => ({ slug }));
}

export default async function PreviewAvis({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config?.googleReviewUrl) notFound();
  return (
    <>
      <DevSwitcher slugs={listSlugs()} current={slug} />
      <AvisPage config={config} reviewUrl={config.googleReviewUrl} basePath={`/preview/${slug}`} />
    </>
  );
}
