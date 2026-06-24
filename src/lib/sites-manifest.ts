// @generated par scripts/generate-sites-manifest.mjs — NE PAS ÉDITER À LA MAIN.
// Régénéré automatiquement via les scripts npm "prebuild" et "predev".
//
// Structures statiques importées par le proxy (src/proxy.ts), qui tourne en
// amont du rendu sans accès au système de fichiers.

export const SITE_SLUGS: string[] = [
  "atelier-douceur",
  "casa-clean-provence",
  "meca-atlas",
  "sanadclean",
  "vibe-coaching",
];

/** Lookup O(1) pour le proxy. */
export const SITE_SLUG_SET: ReadonlySet<string> = new Set(SITE_SLUGS);

/**
 * Domaine perso (host : apex + variantes, ex. "www…") -> slug du site.
 * Sert à la RÉSOLUTION entrante du tenant par Host complet dans le proxy.
 */
export const CUSTOM_DOMAINS: Readonly<Record<string, string>> = {
  "sanadclean.fr": "sanadclean",
  "www.sanadclean.fr": "sanadclean",
};

/**
 * slug -> domaine CANONIQUE (apex perso = customDomains[0]).
 * Sert aux redirections 301 SEO (variante/sous-domaine -> apex).
 */
export const CANONICAL_DOMAIN: Readonly<Record<string, string>> = {
  "sanadclean": "sanadclean.fr",
};
