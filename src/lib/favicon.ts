import type { Metadata } from "next";
import type { SiteConfig, ThemeId } from "@/types/config";
import { resolveTheme } from "@/lib/theme";
import { siteOrigin } from "@/lib/urls";

/**
 * Favicon (icône d'onglet ET icône des résultats Google) PAR SITE.
 *
 *  - Si le client a un logo (`branding.logo`) → on l'utilise tel quel.
 *  - Sinon → on génère une icône (initiales blanches sur fond de marque) servie
 *    en PNG par la route `/icon.png` (handler `seo-icon`).
 *
 * IMPORTANT (SEO) : le favicon affiché par Google DOIT être un FICHIER crawlable
 * à une URL stable. Un data-URI inline (`<link rel="icon" href="data:…">`) est
 * IGNORÉ par Google (rien à récupérer → globe par défaut dans les résultats).
 * On référence donc toujours une URL ABSOLUE sur l'origin du site.
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

/**
 * Champ `icons` de Metadata pour un site : logo du client si présent, sinon
 * l'icône générée servie en PNG (`/icon.png`). URL ABSOLUE dans les deux cas
 * (cf. note SEO ci-dessus). Utilisé par toutes les pages via `src/lib/seo.ts`.
 */
export function buildIcons(config: SiteConfig): Metadata["icons"] {
  const href = config.branding.logo?.trim() || `${siteOrigin(config)}/icon.png`;
  return { icon: href, shortcut: href, apple: href };
}
