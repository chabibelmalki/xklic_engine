import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConfig, getDefaultSlug } from "@/lib/config-loader";
import { AvisPage } from "@/components/AvisPage";
import { buildAvisMetadata } from "@/lib/seo";

/** Page « Laissez un avis » du site par défaut (racine / apex). */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig(getDefaultSlug());
  return config?.googleReviewUrl ? buildAvisMetadata(config) : {};
}

export default function RootAvis() {
  const config = getConfig(getDefaultSlug());
  if (!config?.googleReviewUrl) notFound();
  return <AvisPage config={config} reviewUrl={config.googleReviewUrl} />;
}
