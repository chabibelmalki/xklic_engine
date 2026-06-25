import type { Metadata } from "next";
import type { SiteConfig, ThemeId } from "@/types/config";
import { resolveTheme } from "@/lib/theme";
import { siteOrigin } from "@/lib/urls";

/**
 * Favicon (icône d'onglet ET icône des résultats Google) PAR SITE. Priorité :
 *
 *  1. `branding.icon` → icône CARRÉE dédiée (idéale pour un favicon).
 *  2. sinon `branding.logo` → le logo du client (peut être large, moins idéal).
 *  3. sinon → icône GÉNÉRÉE (initiales sur fond de marque) servie en PNG par la
 *     route `/seo-icon` (URL absolue sur l'origin du site).
 *
 * Cas 1 & 2 : on référence le chemin/URL du config TEL QUEL. Un chemin racine
 * (`/sites/<slug>/icon.png`) résout côté navigateur ET pour le crawl Google
 * (relatif à la page) — et fonctionne aussi en local.
 *
 * Cas 3 : l'URL générée est SANS extension (`/seo-icon`, pas `/icon.png`). Le
 * proxy sous-domaine (src/proxy.ts) exclut de son matcher les chemins en `.png`
 * (et autres assets) — un `/icon.png` ne serait jamais réécrit vers le site et
 * tomberait en 404. Le type est porté par le `Content-Type` de la route.
 *
 * IMPORTANT (SEO) : le favicon affiché par Google DOIT être un FICHIER crawlable
 * à une URL stable. Un data-URI inline (`<link rel="icon" href="data:…">`) est
 * IGNORÉ par Google (rien à récupérer → globe par défaut dans les résultats).
 */

/** Couleur de marque (`--brand-600` de globals.css) par thème, côté serveur. */
const BRAND_600: Record<ThemeId, string> = {
  "pro-bleu-nuit": "#2563eb",
  "douceur-beige": "#a9633a",
  "fraicheur-teal": "#0d9488",
  "energie-corail": "#ee4452",
  "rose-poudre": "#c2185b",
};

/** Repli si le thème n'est pas (encore) présent dans la table ci-dessus. */
const FALLBACK_BRAND = "#334155";

/** 1 à 2 initiales du nom d'entreprise (ex. "SANAD CLEAN" → "SC"). */
export function iconInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Couleur de marque résolue d'un site (avec repli neutre). */
export function iconBrandColor(config: SiteConfig): string {
  return BRAND_600[resolveTheme(config.theme)] ?? FALLBACK_BRAND;
}

/** Icône fournie par le client : 1. `branding.icon` (carrée, idéale), sinon 2. `branding.logo`. */
export function brandIconSource(config: SiteConfig): string | undefined {
  return config.branding.icon?.trim() || config.branding.logo?.trim();
}

/**
 * URL de l'icône PRINCIPALE d'un site (même priorité que `buildIcons`) : icône
 * fournie par le client, sinon l'icône GÉNÉRÉE `/seo-icon` (URL absolue sur
 * l'origin). Consommée par la route `/favicon.ico` par tenant (via le proxy).
 */
export function faviconHref(config: SiteConfig): string {
  return brandIconSource(config) || `${siteOrigin(config)}/seo-icon`;
}

/**
 * Champ `icons` de Metadata pour un site (cf. priorité dans l'en-tête du module).
 * Utilisé par toutes les pages via `src/lib/seo.ts`.
 */
export function buildIcons(config: SiteConfig): Metadata["icons"] {
  // 1. icône carrée dédiée, sinon 2. logo du client — référencés tels quels.
  const provided = brandIconSource(config);
  if (provided) {
    const type = provided.endsWith(".png")
      ? "image/png"
      : provided.endsWith(".svg")
        ? "image/svg+xml"
        : undefined;
    return {
      icon: type ? [{ url: provided, type }] : provided,
      shortcut: provided,
      apple: provided,
    };
  }
  // 3. icône générée (initiales), servie en PNG par la route /seo-icon.
  const href = `${siteOrigin(config)}/seo-icon`;
  return {
    icon: [{ url: href, type: "image/png", sizes: "128x128" }],
    shortcut: href,
    apple: href,
  };
}
