import { getConfig, getDefaultSlug } from "@/lib/config-loader";
import { buildLlmsTxt } from "@/lib/seo-files";

export const dynamic = "force-static";

export async function GET() {
  const config = getConfig(getDefaultSlug());
  // Site non indexable : pas de llms.txt — on n'annonce pas aux IA un site
  // que robots.txt interdit aux moteurs (cohérence noindexSite).
  if (!config || config.noindexSite) return new Response("Not found", { status: 404 });
  return new Response(buildLlmsTxt(config), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
