import type { StylePackId } from "@/types/config";

/**
 * Registre des STYLE PACKS. Un pack = un design system complet (typo, formes,
 * ombres, motion, traitement de fond, palette), matérialisé en CSS variables
 * sous `[data-pack="<id>"]` dans globals.css. Le rendu se contente de poser
 * `data-pack` sur le conteneur racine du site (voir SiteRenderer) ; un pack
 * inconnu retombe sur `base` sans casser.
 *
 * `variants` = CURATION : par type de bloc, les variantes de layout que le pack
 * recommande (la 1re sert de défaut « propre » pour ce pack). Sert au prompt de
 * génération (catalog.json) pour éviter les combinaisons moches/cassées. Le
 * moteur n'impose rien : une config peut toujours préciser une autre variante.
 */
export interface StylePack {
  id: StylePackId;
  label: string;
  /** Ambiance en une ligne (catalog + prompt de génération). */
  ambiance: string;
  /** Pairing typographique affiché (display / texte). */
  fonts: { display: string; sans: string };
  /** Variantes de layout recommandées par bloc (1re = défaut du pack). */
  variants: Record<string, string[]>;
}

export const PACKS: StylePack[] = [
  {
    id: "base",
    label: "Base (historique)",
    ambiance: "Rendu d'origine du moteur. La palette vient de `theme`.",
    fonts: { display: "Poppins", sans: "Inter" },
    variants: {},
  },
  {
    id: "maison-premium",
    label: "Maison · Premium élégant",
    ambiance:
      "Serif haute, tons ivoire/encre/or, ombres douces, beaucoup d'air. Artisanat haut de gamme.",
    fonts: { display: "Playfair Display", sans: "Inter" },
    variants: {
      hero: ["plein", "split"],
      services: ["lignes-alternees", "grille-cartes"],
      produits: ["vitrine", "rayons"],
      galerie: ["masonry", "grille"],
      avis: ["vedette", "grille"],
      tarifs: ["liste-simple", "grille"],
      etapes: ["timeline-verticale"],
      faq: ["deux-colonnes", "accordeon"],
      contact: ["split-form-carte"],
      cta: ["encadre", "bande"],
    },
  },
  {
    id: "rose-noir-premium",
    label: "Rose & Noir · Premium élégant",
    ambiance:
      "Serif haute, encre noire chaude + rose profond, fond ivoire rosé, ombres douces, coins nets, beaucoup d'air. Élégant, épuré, féminin haut de gamme (ménage premium, beauté, bijoux, mode).",
    fonts: { display: "Playfair Display", sans: "Inter" },
    variants: {
      hero: ["plein", "split"],
      services: ["lignes-alternees", "grille-cartes"],
      produits: ["vitrine", "rayons"],
      galerie: ["masonry", "grille"],
      avis: ["vedette", "grille"],
      tarifs: ["liste-simple", "grille"],
      etapes: ["timeline-verticale"],
      faq: ["deux-colonnes", "accordeon"],
      contact: ["split-form-carte"],
      cta: ["encadre", "bande"],
    },
  },
  {
    id: "atelier-industriel",
    label: "Atelier · Bold industriel",
    ambiance:
      "Typo condensée en majuscules, contraste fort anthracite/orange, bords carrés, bordures épaisses.",
    fonts: { display: "Oswald", sans: "Inter" },
    variants: {
      hero: ["split", "asymetrique"],
      services: ["grille-icones", "mosaique"],
      produits: ["grille", "liste"],
      galerie: ["grille", "avant-apres"],
      avis: ["grille", "mur-masonry"],
      tarifs: ["colonnes-comparatif", "grille"],
      etapes: ["ligne-horizontale", "cartes-numerotees"],
      faq: ["accordeon"],
      contact: ["coordonnees-cartes", "split-form-carte"],
      cta: ["bande", "plein"],
    },
  },
  {
    id: "clair-frais",
    label: "Clair · Frais & clean",
    ambiance:
      "Clair et aéré, teal/ciel, coins très arrondis, boutons pill, ombres légères. Confiance et propreté.",
    fonts: { display: "Plus Jakarta Sans", sans: "Inter" },
    variants: {
      hero: ["centre", "split"],
      services: ["grille-cartes", "liste-icones"],
      produits: ["grille", "vitrine"],
      galerie: ["grille", "avant-apres"],
      avis: ["grille", "carrousel"],
      tarifs: ["grille", "mise-en-avant"],
      etapes: ["cartes-numerotees", "timeline-verticale"],
      faq: ["accordeon", "deux-colonnes"],
      contact: ["split-form-carte", "centre"],
      cta: ["bande", "encadre"],
    },
  },
  {
    id: "pop-moderne",
    label: "Pop · Fun moderne",
    ambiance:
      "Couleurs vives violet/lime/corail, gros type, ombres dures décalées, motion joueur, cadres inclinés.",
    fonts: { display: "Bricolage Grotesque", sans: "DM Sans" },
    variants: {
      hero: ["asymetrique", "centre"],
      services: ["mosaique", "grille-cartes"],
      produits: ["vitrine", "grille"],
      galerie: ["masonry", "carrousel"],
      avis: ["carrousel", "mur-masonry"],
      tarifs: ["mise-en-avant", "grille"],
      etapes: ["ligne-horizontale", "cartes-numerotees"],
      faq: ["liste-ouverte", "accordeon"],
      contact: ["centre", "split-form-carte"],
      cta: ["plein", "encadre"],
    },
  },
  {
    id: "terra-naturel",
    label: "Terra · Naturel & organique",
    ambiance:
      "Soft-serif, sauge/terracotta/crème, formes très arrondies, texture organique, motion lent. Bien-être, extérieur.",
    fonts: { display: "Fraunces", sans: "Nunito Sans" },
    variants: {
      hero: ["split", "centre"],
      services: ["lignes-alternees", "grille-cartes"],
      produits: ["rayons", "grille"],
      galerie: ["masonry", "grille"],
      avis: ["vedette", "carrousel"],
      tarifs: ["liste-simple", "grille"],
      etapes: ["timeline-verticale", "cartes-numerotees"],
      faq: ["deux-colonnes", "accordeon"],
      contact: ["split-form-carte", "centre"],
      cta: ["encadre", "bande"],
    },
  },
];

export const DEFAULT_PACK: StylePackId = "base";

const BY_ID = new Map(PACKS.map((p) => [p.id, p]));

/** Renvoie l'id de pack à appliquer (défaut `base` si inconnu/absent). */
export function resolvePack(id: StylePackId | undefined): StylePackId {
  return id && BY_ID.has(id) ? id : DEFAULT_PACK;
}

/** Renvoie la définition du pack (défaut `base` si inconnu/absent). */
export function getPack(id: StylePackId | undefined): StylePack {
  return BY_ID.get(resolvePack(id))!;
}
