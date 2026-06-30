// @generated par scripts/generate-sites-manifest.mjs — NE PAS ÉDITER À LA MAIN.
// Régénéré automatiquement via les scripts npm "prebuild" et "predev".
//
// Structures statiques importées par le proxy (src/proxy.ts), qui tourne en
// amont du rendu sans accès au système de fichiers.

export const SITE_SLUGS: string[] = [
  "adelnet",
  "atelier-douceur",
  "casa-clean-provence",
  "demo-coiffeur",
  "demo-electricien",
  "demo-jardinier",
  "demo-macon",
  "demo-peintre",
  "demo-plombier",
  "demo-serrurier",
  "meca-atlas",
  "minhaj",
  "parfait-menage-26",
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
  "adel-net.fr": "adelnet",
  "casacleanprovence.fr": "casa-clean-provence",
  "demo-coiffeur.xklic.com": "demo-coiffeur",
  "demo-electricien.xklic.com": "demo-electricien",
  "demo-jardinier.xklic.com": "demo-jardinier",
  "demo-macon.xklic.com": "demo-macon",
  "demo-peintre.xklic.com": "demo-peintre",
  "demo-plombier.xklic.com": "demo-plombier",
  "demo-serrurier.xklic.com": "demo-serrurier",
  "parfaitmenage26.fr": "parfait-menage-26",
  "sanadclean.fr": "sanadclean",
  "www.adel-net.fr": "adelnet",
  "www.casacleanprovence.fr": "casa-clean-provence",
  "www.parfaitmenage26.fr": "parfait-menage-26",
  "www.sanadclean.fr": "sanadclean",
};

/**
 * slug -> domaine CANONIQUE (apex perso = customDomains[0]).
 * Sert aux redirections 301 SEO (variante/sous-domaine -> apex).
 */
export const CANONICAL_DOMAIN: Readonly<Record<string, string>> = {
  "adelnet": "adel-net.fr",
  "casa-clean-provence": "www.casacleanprovence.fr",
  "demo-coiffeur": "demo-coiffeur.xklic.com",
  "demo-electricien": "demo-electricien.xklic.com",
  "demo-jardinier": "demo-jardinier.xklic.com",
  "demo-macon": "demo-macon.xklic.com",
  "demo-peintre": "demo-peintre.xklic.com",
  "demo-plombier": "demo-plombier.xklic.com",
  "demo-serrurier": "demo-serrurier.xklic.com",
  "parfait-menage-26": "parfaitmenage26.fr",
  "sanadclean": "sanadclean.fr",
};
