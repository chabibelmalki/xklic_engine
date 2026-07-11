// @generated par scripts/generate-sites-manifest.mjs — NE PAS ÉDITER À LA MAIN.
// Régénéré automatiquement via les scripts npm "prebuild" et "predev".
//
// Structures statiques importées par le proxy (src/proxy.ts), qui tourne en
// amont du rendu sans accès au système de fichiers.

export const SITE_SLUGS: string[] = [
  "adelnet",
  "atelier-douceur",
  "casa-clean-provence",
  "mb-nettoyage",
  "meca-atlas",
  "minhaj",
  "parfait-menage-26",
  "sanadclean",
  "taxi-concept",
  "taxi-excellence",
  "vibe-coaching",
];

/** Lookup O(1) pour le proxy. */
export const SITE_SLUG_SET: ReadonlySet<string> = new Set(SITE_SLUGS);

/**
 * Domaine perso (host : apex + variantes, ex. "www…") -> slug du site.
 * Sert à la RÉSOLUTION entrante du tenant par Host complet dans le proxy.
 */
export const CUSTOM_DOMAINS: Readonly<Record<string, string>> = {
  "adel-net.fr": "adelnet",
  "casacleanprovence.fr": "casa-clean-provence",
  "mbnettoyage-marseille.fr": "mb-nettoyage",
  "parfaitmenage26.fr": "parfait-menage-26",
  "sanadclean.fr": "sanadclean",
  "taxi-excellence.fr": "taxi-excellence",
  "www.adel-net.fr": "adelnet",
  "www.casacleanprovence.fr": "casa-clean-provence",
  "www.mbnettoyage-marseille.fr": "mb-nettoyage",
  "www.parfaitmenage26.fr": "parfait-menage-26",
  "www.sanadclean.fr": "sanadclean",
  "www.taxi-excellence.fr": "taxi-excellence",
};

/**
 * slug -> domaine CANONIQUE (apex perso = customDomains[0]).
 * Sert aux redirections 301 SEO (variante/sous-domaine -> apex).
 */
export const CANONICAL_DOMAIN: Readonly<Record<string, string>> = {
  "adelnet": "adel-net.fr",
  "casa-clean-provence": "www.casacleanprovence.fr",
  "mb-nettoyage": "mbnettoyage-marseille.fr",
  "parfait-menage-26": "parfaitmenage26.fr",
  "sanadclean": "sanadclean.fr",
  "taxi-excellence": "taxi-excellence.fr",
};
