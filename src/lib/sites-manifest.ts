// @generated par scripts/generate-sites-manifest.mjs — NE PAS ÉDITER À LA MAIN.
// Régénéré automatiquement via les scripts npm "prebuild" et "predev".
//
// Structures statiques importées par le proxy (src/proxy.ts), qui tourne en
// amont du rendu sans accès au système de fichiers.

export const SITE_SLUGS: string[] = [
  "ab-pro-service",
  "adelnet",
  "beirouti",
  "casa-clean-provence",
  "cbprestamultiservices",
  "clean-confiance-by-maman",
  "clean-habitat-pro",
  "creation-production-mode",
  "g-clean-propre-42",
  "hygifrance",
  "m-e-r-i-international",
  "mb-nettoyage",
  "minhaj",
  "o-poulet-braise",
  "parfait-menage-26",
  "rd-net-propre",
  "sanadclean",
  "taxi-concept",
  "taxi-excellence",
];

/** Lookup O(1) pour le proxy. */
export const SITE_SLUG_SET: ReadonlySet<string> = new Set(SITE_SLUGS);

/**
 * Domaine perso (host : apex + variantes, ex. "www…") -> slug du site.
 * Sert à la RÉSOLUTION entrante du tenant par Host complet dans le proxy.
 */
export const CUSTOM_DOMAINS: Readonly<Record<string, string>> = {
  "abproservice.be": "ab-pro-service",
  "adel-net.fr": "adelnet",
  "beirouti.fr": "beirouti",
  "casacleanprovence.fr": "casa-clean-provence",
  "cbprestamultiservices.fr": "cbprestamultiservices",
  "cleanconfiancebymaman.fr": "clean-confiance-by-maman",
  "cleanhabitatpro.fr": "clean-habitat-pro",
  "creationproductionmode.fr": "creation-production-mode",
  "gcleanpropre42.fr": "g-clean-propre-42",
  "mbnettoyage-marseille.fr": "mb-nettoyage",
  "meri-international.be": "m-e-r-i-international",
  "opouletbraise-osny.fr": "o-poulet-braise",
  "parfaitmenage26.fr": "parfait-menage-26",
  "rdnetpropre.fr": "rd-net-propre",
  "sanadclean.fr": "sanadclean",
  "taxi-excellence.fr": "taxi-excellence",
  "www.abproservice.be": "ab-pro-service",
  "www.adel-net.fr": "adelnet",
  "www.beirouti.fr": "beirouti",
  "www.casacleanprovence.fr": "casa-clean-provence",
  "www.cbprestamultiservices.fr": "cbprestamultiservices",
  "www.cleanconfiancebymaman.fr": "clean-confiance-by-maman",
  "www.cleanhabitatpro.fr": "clean-habitat-pro",
  "www.creationproductionmode.fr": "creation-production-mode",
  "www.gcleanpropre42.fr": "g-clean-propre-42",
  "www.mbnettoyage-marseille.fr": "mb-nettoyage",
  "www.meri-international.be": "m-e-r-i-international",
  "www.opouletbraise-osny.fr": "o-poulet-braise",
  "www.parfaitmenage26.fr": "parfait-menage-26",
  "www.rdnetpropre.fr": "rd-net-propre",
  "www.sanadclean.fr": "sanadclean",
  "www.taxi-excellence.fr": "taxi-excellence",
};

/**
 * slug -> domaine CANONIQUE (apex perso = customDomains[0]).
 * Sert aux redirections 301 SEO (variante/sous-domaine -> apex).
 */
export const CANONICAL_DOMAIN: Readonly<Record<string, string>> = {
  "ab-pro-service": "abproservice.be",
  "adelnet": "adel-net.fr",
  "beirouti": "beirouti.fr",
  "casa-clean-provence": "www.casacleanprovence.fr",
  "cbprestamultiservices": "cbprestamultiservices.fr",
  "clean-confiance-by-maman": "cleanconfiancebymaman.fr",
  "clean-habitat-pro": "cleanhabitatpro.fr",
  "creation-production-mode": "creationproductionmode.fr",
  "g-clean-propre-42": "gcleanpropre42.fr",
  "m-e-r-i-international": "meri-international.be",
  "mb-nettoyage": "mbnettoyage-marseille.fr",
  "o-poulet-braise": "opouletbraise-osny.fr",
  "parfait-menage-26": "parfaitmenage26.fr",
  "rd-net-propre": "rdnetpropre.fr",
  "sanadclean": "sanadclean.fr",
  "taxi-excellence": "taxi-excellence.fr",
};
