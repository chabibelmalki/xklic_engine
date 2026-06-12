import { NextResponse, type NextRequest } from "next/server";

/**
 * Routage multi-tenant par SOUS-DOMAINE (prod).
 *
 * fatima.mondomaine.fr/<path>  ->  réécrit vers  /sites/fatima/<path>
 * (réécriture interne : l'URL visible reste le sous-domaine, le rendu /sites
 * statique est servi -> SSG/ISR préservé).
 *
 * Apex / www / localhost sans sous-domaine : pas de réécriture, la racine sert
 * le site par défaut (env SITE). Le dev passe par /preview/[slug] (non réécrit).
 *
 * Edge runtime : pas d'accès fs. On ne valide pas l'existence du slug ici ; un
 * sous-domaine inconnu retombe sur le 404 de /sites/[slug].
 */
function getSubdomain(host: string): string | null {
  const hostname = host.split(":")[0];

  // Dev : *.localhost (ex. fatima.localhost:3000)
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    return sub && sub !== "www" ? sub : null;
  }

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (root && hostname.endsWith(`.${root}`) && hostname !== `www.${root}`) {
    const sub = hostname.slice(0, -(root.length + 1));
    return sub && sub !== "www" ? sub : null;
  }

  return null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ne jamais réécrire ce qui est déjà ciblé, ni la zone de preview dev.
  if (pathname.startsWith("/sites/") || pathname.startsWith("/preview")) {
    return NextResponse.next();
  }

  const sub = getSubdomain(req.headers.get("host") ?? "");
  if (!sub) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/sites/${sub}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Exclut les internes Next et les assets statiques, mais laisse passer les
  // fichiers SEO (.xml/.txt) pour qu'ils soient servis par site.
  matcher: [
    "/((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|woff2?|ttf|map)$).*)",
  ],
};
