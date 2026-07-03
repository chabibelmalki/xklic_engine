import { getConfig, listSlugs } from "@/lib/config-loader";
import { buildSitemapXml } from "@/lib/seo-files";

// NB : ce segment s'appelle `seo-sitemap` (et NON `sitemap.xml`) volontairement.
// Sous un segment dynamique (`[slug]`), un Route Handler nommé `sitemap.xml` est
// happé par la convention metadata « sitemap » de Next ; sa machinerie de
// « source route » (pour generateSitemaps) casse au prerender côté build Vercel
// (Invariant: failed to find source route .../sitemap.xml). On sert donc le XML
// depuis ce nom neutre, et un rewrite next.config expose l'URL publique
// /sites/[slug]/sitemap.xml -> /sites/[slug]/seo-sitemap.
export const dynamic = "force-static";

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getConfig(slug);
  // Site non indexable : pas de sitemap du tout (cohérent avec robots.txt
  // `Disallow: /` sans ligne Sitemap, et avec l'exclusion GSC de sync-sitemaps).
  if (!config || config.noindexSite) return new Response("Not found", { status: 404 });
  return new Response(buildSitemapXml(config), {
    headers: { "Content-Type": "application/xml" },
  });
}
