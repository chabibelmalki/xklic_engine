import { getConfig, getDefaultSlug } from "@/lib/config-loader";
import { buildSitemapXml } from "@/lib/seo-files";

export const dynamic = "force-static";

export async function GET() {
  const config = getConfig(getDefaultSlug());
  // Site non indexable : pas de sitemap du tout (cohérent avec robots.txt
  // `Disallow: /` sans ligne Sitemap, et avec l'exclusion GSC de sync-sitemaps).
  if (!config || config.noindexSite) return new Response("Not found", { status: 404 });
  return new Response(buildSitemapXml(config), {
    headers: { "Content-Type": "application/xml" },
  });
}
