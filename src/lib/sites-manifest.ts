// @generated par scripts/generate-sites-manifest.mjs — NE PAS ÉDITER À LA MAIN.
// Régénéré automatiquement via les scripts npm "prebuild" et "predev".
//
// Liste statique des slugs de sites valides (= dossiers config/sites/<slug>/
// contenant un config.json). Importée par le proxy (src/proxy.ts), qui tourne
// en amont du rendu sans accès au système de fichiers.

export const SITE_SLUGS: string[] = [
  "meca-confiance",
  "patisserie-chabib",
  "sanadclean",
];

/** Lookup O(1) pour le proxy. */
export const SITE_SLUG_SET: ReadonlySet<string> = new Set(SITE_SLUGS);
