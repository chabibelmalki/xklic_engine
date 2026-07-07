import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConfig, getDefaultSlug } from "@/lib/config-loader";
import { MentionsLegalesPage } from "@/components/MentionsLegalesPage";
import { buildLegalMetadata } from "@/lib/seo";

/** Mentions légales du site par défaut (racine / apex). */
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig(getDefaultSlug());
  return config ? buildLegalMetadata(config) : {};
}

export default function RootLegal() {
  const config = getConfig(getDefaultSlug());
  if (!config) notFound();
  return <MentionsLegalesPage config={config} />;
}
