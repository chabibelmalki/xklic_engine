import { getConfig, listSlugs } from "@/lib/config-loader";
import { buildSitemapXml } from "@/lib/seo-files";

export const dynamic = "force-static";

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config) return new Response("Not found", { status: 404 });
  return new Response(buildSitemapXml(config), {
    headers: { "Content-Type": "application/xml" },
  });
}
