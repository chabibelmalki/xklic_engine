import { getConfig, listSlugs } from "@/lib/config-loader";
import { faviconHref } from "@/lib/favicon";

/**
 * `/favicon.ico` PAR TENANT (redirection vers la vraie icône du site).
 *
 * Pourquoi une route et pas `app/favicon.ico` : Next réserve `favicon` à un
 * FICHIER `.ico` statique unique (« You cannot generate a favicon icon » —
 * app-icons.md) → il serait identique sur tous les domaines et clonerait un
 * favicon partout, cassant le « une icône par client ». Le proxy (src/proxy.ts)
 * réécrit donc `<host>/favicon.ico` -> `/sites/<slug>/seo-favicon` (le slug est
 * déjà résolu par Host), et cette route redirige vers l'icône du tenant.
 *
 * Beaucoup de navigateurs/crawlers (et Google en repli) requêtent `/favicon.ico`
 * EN DUR, indépendamment des `<link rel="icon">` — d'où l'intérêt de le servir.
 *
 * Cible = `faviconHref` : même priorité que `buildIcons` (branding.icon / logo,
 * sinon l'icône générée `/seo-icon`). Déterministe par slug -> prérendu statique.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config) return new Response("Not found", { status: 404 });

  return new Response(null, {
    status: 307,
    headers: {
      Location: faviconHref(config),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
