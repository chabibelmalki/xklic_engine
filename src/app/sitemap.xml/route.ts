import { getConfig, getDefaultSlug } from "@/lib/config-loader";
import { buildSitemapXml } from "@/lib/seo-files";

export const dynamic = "force-static";

export async function GET() {
  const config = getConfig(getDefaultSlug());
  if (!config) return new Response("Not found", { status: 404 });
  return new Response(buildSitemapXml(config), {
    headers: { "Content-Type": "application/xml" },
  });
}
