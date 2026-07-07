import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { buildMetadata } from "@/lib/seo";

// SSG : une page statique par slug connu. ISR pour rafraîchir si une config
// change sans rebuild complet. Un slug inconnu -> 404 (dynamicParams=false).
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getConfig(slug);
  return config ? buildMetadata(config) : {};
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config) notFound();
  return <SiteRenderer config={config} />;
}
