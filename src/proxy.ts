import { NextResponse, type NextRequest } from "next/server";
import { SITE_SLUG_SET } from "@/lib/sites-manifest";

/**
 * Routage multi-tenant par SOUS-DOMAINE (prod).
 *
 * fatima.xklic.com/<path>  ->  réécrit vers  /sites/fatima/<path>
 * (réécriture interne : l'URL visible reste le sous-domaine, le rendu /sites
 * statique est servi -> SSG/ISR préservé).
 *
 * Slug INCONNU sous le domaine racine  ->  redirect 308 vers https://xklic.com
 * (la liste des slugs valides vient du MANIFESTE statique src/lib/sites-manifest.ts,
 * régénéré en pre(build|dev) — le proxy ne lit jamais le disque).
 *
 * NE TOUCHE PAS : apex (xklic.com), www, *.localhost (dev), *.vercel.app, et les
 * chemins /preview (et /sites, déjà ciblé). Ceux-ci passent en NextResponse.next().
 */
const FALLBACK_HOST =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "xklic.com";

/**
 * Extrait le sous-domaine + indique si un fallback (redirect) est légitime.
 *
 * `fallbackable` n'est vrai que sous le VRAI domaine racine de prod : en dev
 * (`*.localhost`) on ne redirige jamais vers xklic.com, et apex/www/vercel.app
 * ne produisent pas de sous-domaine du tout.
 */
function parseHost(host: string): { sub: string | null; fallbackable: boolean } {
  const hostname = host.split(":")[0];

  // Dev : *.localhost (ex. fatima.localhost:3000) — jamais de redirect.
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    return { sub: sub && sub !== "www" ? sub : null, fallbackable: false };
  }

  // Prod : *.<NEXT_PUBLIC_ROOT_DOMAIN>. www et apex -> pas de sous-domaine.
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (root && hostname.endsWith(`.${root}`) && hostname !== `www.${root}`) {
    const sub = hostname.slice(0, -(root.length + 1));
    return { sub: sub && sub !== "www" ? sub : null, fallbackable: true };
  }

  // apex, www, *.vercel.app, et tout le reste : on ne touche pas.
  return { sub: null, fallbackable: false };
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ne jamais réécrire :
  //  - /sites (déjà ciblé) ni /preview (zone dev),
  //  - /api/* : routes GLOBALES (src/app/api/...). Le slug du site voyage dans
  //    le body (`siteSlug`), pas dans l'URL. Les réécrire vers /sites/<slug>/api
  //    casserait les formulaires en 404.
  if (
    pathname.startsWith("/sites/") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const { sub, fallbackable } = parseHost(req.headers.get("host") ?? "");

  // Apex / www / localhost-racine / *.vercel.app : comportement par défaut.
  if (!sub) return NextResponse.next();

  // Sous-domaine de prod qui ne correspond à AUCUN site : redirect 308 -> apex.
  if (fallbackable && !SITE_SLUG_SET.has(sub)) {
    return NextResponse.redirect(`https://${FALLBACK_HOST}`, 308);
  }

  // Slug connu (prod) ou sous-domaine de dev : réécriture interne vers /sites.
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
