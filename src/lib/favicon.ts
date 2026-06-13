import type { Metadata } from "next";
import type { SiteConfig, ThemeId } from "@/types/config";
import { resolveTheme } from "@/lib/theme";

/**
 * Favicon (icône d'onglet) PAR SITE.
 *
 *  - Si le client a un logo (`branding.logo`) → on l'utilise tel quel.
 *  - Sinon → on GÉNÈRE une icône : initiales de l'entreprise, en blanc, sur un
 *    fond arrondi de la couleur de marque du thème. Aucun fichier, aucune requête
 *    réseau : un SVG encodé en data-URI, embarqué directement dans le <head>.
 */

/** Couleur de marque (`--brand-600` de globals.css) par thème, côté serveur. */
const BRAND_600: Record<ThemeId, string> = {
  "pro-bleu-nuit": "#2563eb",
  "douceur-beige": "#a9633a",
  "fraicheur-teal": "#0d9488",
  "energie-corail": "#ee4452",
  "rose-poudre": "#c2185b",
};

/** 1 à 2 initiales du nom d'entreprise (ex. "SANAD CLEAN" → "SC"). */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Échappe les caractères réservés XML dans le texte du SVG. */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** SVG data-URI : initiales blanches sur fond arrondi de la couleur de marque. */
function generatedIcon(config: SiteConfig): string {
  const color = BRAND_600[resolveTheme(config.theme)];
  const text = escapeXml(initials(config.entreprise.nom));
  const fontSize = text.length > 1 ? 30 : 38;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="${color}"/>` +
    `<text x="32" y="34" font-family="system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" ` +
    `font-size="${fontSize}" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">` +
    `${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Champ `icons` de Metadata pour un site : logo du client si présent, sinon
 * favicon généré. Utilisé par toutes les pages via `src/lib/seo.ts`.
 */
export function buildIcons(config: SiteConfig): Metadata["icons"] {
  const href = config.branding.logo?.trim() || generatedIcon(config);
  return { icon: href, shortcut: href, apple: href };
}
