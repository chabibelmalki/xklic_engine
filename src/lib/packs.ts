import type { StylePackId } from "@/types/config";

/**
 * Registre des STYLE PACKS. Un pack = un design system complet (typo, formes,
 * ombres, motion, traitement de fond, palette), matérialisé en CSS variables
 * sous `[data-pack="<id>"]` dans globals.css. Le rendu se contente de poser
 * `data-pack` sur le conteneur racine du site (voir SiteRenderer) ; un pack
 * inconnu retombe sur `base` sans casser.
 *
 * AUCUN pack n'est lié à un métier ou un secteur : tout pack peut habiller
 * n'importe quel client. Le choix se fait sur l'AMBIANCE visuelle voulue, jamais
 * sur l'activité. Pack (structure/typo/motion) et theme (couleur) sont deux axes
 * à combiner librement (cf. le découplage de palette en cours).
 *
 * `variants` = CURATION : par type de bloc, les variantes de layout que le pack
 * recommande (la 1re sert de défaut « propre » pour ce pack). Sert au prompt de
 * génération (catalog.json) pour éviter les combinaisons moches/cassées. Le
 * moteur n'impose rien : une config peut toujours préciser une autre variante.
 */
/**
 * Stratégie de fond des sections (levier d'ambiance structurel). Lue au rendu
 * SSR par le SiteRenderer pour décider le `tone` de chaque section — impossible à
 * porter par une CSS var (non lisible côté serveur), d'où sa présence ici.
 * - flat         : tout `bg` (aucune alternance)
 * - striped      : alternance `bg`/`alt` — comportement HISTORIQUE (défaut)
 * - surface-alt  : alternance `bg`/`surface`
 * - brand-tinted : alternance `bg`/teinte de marque légère (`brand`)
 * - bordered     : tout `bg` + filet séparateur entre sections (via SectionDivider)
 */
export type SectionStrategy = "flat" | "striped" | "surface-alt" | "brand-tinted" | "bordered";

/**
 * Découpe entre deux sections (SVG/filet), rendue par le SiteRenderer ENTRE les
 * blocs. `none` = aucune (défaut, rétro-compat). Voir SectionDivider.
 */
export type SectionDivider = "none" | "rule" | "bevel" | "wave" | "arch";

export interface StylePack {
  id: StylePackId;
  label: string;
  /** Ambiance en une ligne (catalog + prompt de génération). */
  ambiance: string;
  /** Pairing typographique affiché (display / texte). */
  fonts: { display: string; sans: string };
  /** Stratégie de fond des sections. Défaut `striped` (rendu historique). */
  sectionStrategy: SectionStrategy;
  /** Découpe entre sections. Défaut `none` (rendu historique). */
  sectionDivider: SectionDivider;
  /** Variantes de layout recommandées par bloc (1re = défaut du pack). */
  variants: Record<string, string[]>;
}

export const PACKS: StylePack[] = [
  {
    id: "base",
    label: "Base (historique)",
    sectionStrategy: "striped",
    sectionDivider: "none",
    ambiance: "Rendu d'origine du moteur. La palette vient de `theme`.",
    fonts: { display: "Poppins", sans: "Inter" },
    variants: {},
  },
  {
    id: "maison-premium",
    label: "Maison · Premium élégant",
    sectionStrategy: "striped",
    sectionDivider: "none",
    ambiance:
      "Serif haute, tons ivoire/encre/or, ombres douces, beaucoup d'air.",
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
    sectionStrategy: "striped",
    sectionDivider: "none",
    ambiance:
      "Serif haute, encre noire chaude + rose profond, fond ivoire rosé, ombres douces, coins nets, beaucoup d'air. Élégant, épuré.",
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
    sectionStrategy: "striped",
    sectionDivider: "none",
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
    sectionStrategy: "striped",
    sectionDivider: "none",
    ambiance:
      "Clair et aéré, teal/ciel, coins très arrondis, boutons pill, ombres légères.",
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
    sectionStrategy: "striped",
    sectionDivider: "none",
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
    sectionStrategy: "striped",
    sectionDivider: "none",
    ambiance:
      "Soft-serif, sauge/terracotta/crème, formes très arrondies, texture organique, motion lent.",
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
  {
    id: "marine-premium",
    label: "Marine · Élégant & posé",
    sectionStrategy: "bordered",
    sectionDivider: "rule",
    ambiance:
      "Serif posée (Libre Baskerville), kicker à filet fin sans pastille, boutons moyennement arrondis, ombres teintées marine, motion sobre.",
    fonts: { display: "Libre Baskerville", sans: "Inter" },
    variants: {
      hero: ["split", "centre"],
      services: ["grille-icones", "grille-cartes"],
      produits: ["grille", "vitrine"],
      galerie: ["grille", "masonry"],
      avis: ["grille", "vedette"],
      tarifs: ["grille", "liste-simple"],
      etapes: ["sentier-alterne", "timeline-verticale"],
      faq: ["deux-colonnes", "accordeon"],
      contact: ["split-form-carte", "panneau-sombre"],
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
