import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs } from "@/lib/config-loader";
import { AvisPage } from "@/components/AvisPage";
import { buildAvisMetadata } from "@/lib/seo";

/** Page « Laissez un avis » d'un site tenant : "/sites/<slug>/avis". */
export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return listSlugs()
    .filter((slug) => getConfig(slug)?.googleReviewUrl)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getConfig(slug);
  return config?.googleReviewUrl ? buildAvisMetadata(config) : {};
}

export default async function TenantAvis({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config?.googleReviewUrl) notFound();
  return <AvisPage config={config} reviewUrl={config.googleReviewUrl} />;
}
