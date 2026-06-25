import { NextResponse, type NextRequest } from "next/server";
import {
  SITE_SLUG_SET,
  CUSTOM_DOMAINS,
  CANONICAL_DOMAIN,
} from "@/lib/sites-manifest";

/**
 * Routage multi-tenant : DOMAINE PERSO d'abord, puis SOUS-DOMAINE (prod).
 *
 * sanadclean.fr/<path>     ->  réécrit vers  /sites/sanadclean/<path>  (domaine perso)
 * fatima.xklic.com/<path>  ->  réécrit vers  /sites/fatima/<path>      (sous-domaine)
 * (réécriture interne : l'URL visible reste celle d'entrée, le rendu /sites
 * statique est servi -> SSG/ISR préservé).
 *
 * Canonicalisation SEO (301) — consolide les signaux vers l'apex perso :
 *   - variante d'un domaine perso (www, alias) -> apex (= customDomains[0]) ;
 *   - <slug>.xklic.com -> apex perso, quand le site a un customDomain.
 *
 * Slug INCONNU sous le domaine racine  ->  redirect 308 vers https://xklic.com.
 * Les maps (slugs + domaines perso) viennent du MANIFESTE statique
 * src/lib/sites-manifest.ts, régénéré en pre(build|dev) — le proxy ne lit
 * jamais le disque.
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

/** Réécriture interne (invisible) du Host d'entrée vers /sites/<slug>/<path>. */
function rewriteToSite(req: NextRequest, slug: string, pathname: string) {
  const url = req.nextUrl.clone();
  // /favicon.ico (requêté EN DUR par les navigateurs/crawlers) -> route par tenant
  // qui redirige vers l'icône du site (cf. src/app/sites/[slug]/seo-favicon).
  const path =
    pathname === "/favicon.ico"
      ? "/seo-favicon"
      : pathname === "/"
        ? ""
        : pathname;
  url.pathname = `/sites/${slug}${path}`;
  return NextResponse.rewrite(url);
}

/**
 * Redirection 301 vers le domaine canonique. La HOME est SANS slash final, pour
 * coïncider STRICTEMENT avec `siteOrigin()` (sitemap/canonical/OG/JSON-LD, qui
 * émettent tous `https://<apex>` sans slash). Les sous-pages gardent leur chemin
 * tel quel (sans slash — convention Next par défaut, déjà cohérente).
 *
 * Le header `Location` est posé À LA MAIN : `NextResponse.redirect()` construit
 * un `new URL()` qui normalise un host nu en `host/` (spec WHATWG URL), rajoutant
 * le slash qu'on veut justement éviter sur la home.
 */
function canonical301(canon: string, pathname: string, search: string): NextResponse {
  const path = pathname === "/" ? "" : pathname;
  return new NextResponse(null, {
    status: 301,
    headers: { Location: `https://${canon}${path}${search}` },
  });
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

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

  const hostHeader = req.headers.get("host") ?? "";
  const hostname = hostHeader.split(":")[0].toLowerCase();

  // 1) DOMAINE PERSO : résolution directe par Host complet (apex + variantes).
  const customSlug = CUSTOM_DOMAINS[hostname];
  if (customSlug) {
    const canon = CANONICAL_DOMAIN[customSlug];
    // Variante non canonique (www, alias) -> apex : 301 (path + query préservés).
    if (canon && hostname !== canon) {
      return canonical301(canon, pathname, search);
    }
    return rewriteToSite(req, customSlug, pathname);
  }

  // 2) SOUS-DOMAINE (logique historique, inchangée).
  const { sub, fallbackable } = parseHost(hostHeader);

  // Apex / www / localhost-racine / *.vercel.app : comportement par défaut.
  if (!sub) return NextResponse.next();

  // Sous-domaine de prod qui ne correspond à AUCUN site : redirect 308 -> apex.
  if (fallbackable && !SITE_SLUG_SET.has(sub)) {
    return NextResponse.redirect(`https://${FALLBACK_HOST}`, 308);
  }

  // 3) Canonicalisation SEO : si ce site a un domaine perso, son sous-domaine
  //    xklic.com redirige (301) vers l'apex perso. Prod réelle uniquement
  //    (`fallbackable`) — en dev *.localhost on garde la réécriture locale.
  const canon = CANONICAL_DOMAIN[sub];
  if (fallbackable && canon) {
    return canonical301(canon, pathname, search);
  }

  // 4) Slug connu (prod) ou sous-domaine de dev : réécriture interne vers /sites.
  //    Inchangé pour les tenants SANS domaine perso.
  return rewriteToSite(req, sub, pathname);
}

export const config = {
  // Exclut les internes Next et les assets statiques, mais laisse passer les
  // fichiers SEO (.xml/.txt) ET /favicon.ico (réécrit par tenant vers
  // /sites/<slug>/seo-favicon — d'où l'absence de `favicon.ico|` et de `ico|`
  // dans l'exclusion ci-dessous, sinon il ne traverserait jamais le proxy).
  matcher: [
    "/((?!_next/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|css|js|woff2?|ttf|map)$).*)",
  ],
};
