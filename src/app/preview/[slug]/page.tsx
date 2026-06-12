import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getConfig, listSlugs } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { DevSwitcher } from "@/components/DevSwitcher";

// Route de DEV : rend n'importe quelle config par slug, avec la barre de switch.
// Non indexée (évite tout duplicate content avec le rendu prod sur sous-domaine).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config) notFound();

  // La barre de switch est l'outil même des routes /preview (déjà noindex) :
  // on l'affiche quel que soit le mode (dev comme build de prévisualisation).
  return (
    <>
      <DevSwitcher slugs={listSlugs()} current={slug} />
      <SiteRenderer config={config} basePath={`/preview/${slug}`} />
    </>
  );
}
