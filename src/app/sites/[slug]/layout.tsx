import type { Metadata } from "next";
import { getConfig } from "@/lib/config-loader";
import { pageRobots } from "@/lib/seo";

/**
 * Filet de sécurité SEO du sous-arbre tenant : pose la directive robots par
 * défaut du site pour toute page qui omettrait la sienne. Sans lui, une page
 * sans clé `robots` hérite du `noindex, nofollow` du layout racine (réservé
 * aux pages internes du moteur) et disparaît de Google en silence. Les pages
 * et builders gardent le dernier mot (merge superficiel Next, la feuille
 * écrase le layout). Slug inconnu → on n'écrase rien (le noindex racine
 * s'applique).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getConfig(slug);
  return config ? { robots: pageRobots(config) } : {};
}

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
