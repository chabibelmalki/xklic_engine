import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConfig, getDefaultSlug } from "@/lib/config-loader";
import { ConfidentialitePage } from "@/components/ConfidentialitePage";
import { buildConfidentialiteMetadata } from "@/lib/seo";

/** Politique de confidentialité du site par défaut (racine / apex). */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig(getDefaultSlug());
  return config ? buildConfidentialiteMetadata(config) : {};
}

export default function RootConfidentialite() {
  const config = getConfig(getDefaultSlug());
  if (!config) notFound();
  return <ConfidentialitePage config={config} />;
}
