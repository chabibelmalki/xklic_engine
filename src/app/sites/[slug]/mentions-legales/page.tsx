import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs } from "@/lib/config-loader";
import { MentionsLegalesPage } from "@/components/MentionsLegalesPage";
import { buildLegalMetadata } from "@/lib/seo";

export const dynamicParams = false;
export const revalidate = 3600;

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
  return config ? buildLegalMetadata(config) : {};
}

export default async function LegalRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config) notFound();
  return <MentionsLegalesPage config={config} />;
}
