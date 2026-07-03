import { getConfig, listSlugs } from "@/lib/config-loader";
import { buildLlmsTxt } from "@/lib/seo-files";

export const dynamic = "force-static";

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getConfig(slug);
  // Site non indexable : pas de llms.txt — on n'annonce pas aux IA un site
  // que robots.txt interdit aux moteurs (cohérence noindexSite).
  if (!config || config.noindexSite) return new Response("Not found", { status: 404 });
  return new Response(buildLlmsTxt(config), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
