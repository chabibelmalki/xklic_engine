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
  /**
   * Famille de template (jeu de composants blocs + chrome, voir src/families).
   * ABSENT => "classic" (rendu historique). Champ `string` volontaire pour ne
   * créer aucune dépendance packs → families. Résolu par `getFamily`.
   */
  family?: string;
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
    id: "azulejo-faience",
    label: "Azulejo · Faïence céramique",
    sectionStrategy: "surface-alt",
    sectionDivider: "none",
    ambiance:
      "Mur de faïence : carreaux émaillés clairs, joints fins, frises de losanges (motif azulejo), serif haute (DM Serif Display). Domestique, artisanal, net — sans saturation.",
    fonts: { display: "DM Serif Display", sans: "Inter" },
    family: "azulejo",
    variants: {
      hero: ["carte", "split", "centre"],
      services: ["grille-cartes", "grille-icones"],
      etapes: ["cartes-numerotees", "timeline-verticale"],
      faq: ["accordeon", "deux-colonnes"],
      contact: ["split-form-carte", "coordonnees-cartes"],
      cta: ["encadre", "bande"],
      tarifs: ["grille", "liste-simple"],
      galerie: ["grille", "masonry"],
    },
  },
  {
    id: "eclat-lumiere",
    label: "Éclat · Minimalisme lumineux",
    sectionStrategy: "striped",
    sectionDivider: "none",
    ambiance:
      "Minimalisme lumineux : fonds blancs, beaucoup d'air, structure en filets fins (zéro aplat lourd ni ombre dure), signature « étincelle », serif éditoriale (Instrument Serif) + sans géométrique (Manrope). Simple, clair, propre — avec du caractère.",
    fonts: { display: "Instrument Serif", sans: "Manrope" },
    family: "eclat",
    variants: {
      hero: ["carte", "split", "centre"],
      services: ["grille-cartes", "grille-icones"],
      etapes: ["cartes-numerotees", "timeline-verticale"],
      faq: ["accordeon", "deux-colonnes"],
      contact: ["split-form-carte", "coordonnees-cartes"],
      cta: ["encadre", "bande"],
      tarifs: ["liste-simple", "grille"],
      galerie: ["grille", "masonry"],
    },
  },
  {
    id: "escale-transit",
    label: "Escale · Salle des opérations internationales",
    family: "escale",
    // Corps clair « salle de contrôle de jour » : alternance blanc / lavis de
    // marque très pâle (brand-tinted). Les blocs d'identité (hero/pageHero/cta/
    // footer) peignent leur propre PANNEAU DE NUIT au graticule de méridiens.
    sectionStrategy: "brand-tinted",
    sectionDivider: "none",
    ambiance:
      "Parti pris FORT « salle des opérations internationales / tableau des départs » : display d'affichage ultra-condensé en capitales (Bebas Neue) + MONO d'afficheur (Space Mono) pour TOUTE donnée (téléphone, horaires, codes, index, fil d'ariane). Panneaux de NUIT pleine largeur parcourus du GRATICULE DE MÉRIDIENS (quadrillage de globe), intitulés posés dans des VOLETS split-flap à couture centrale, prestations éditées en ORDRES DE MISSION (talon numéroté + couture perforée + corps), moniteur de supervision qui encadre la photo, et un VOYANT vert « en service » qui bat lentement. Angles nets, ombres basses et franches. Opérationnel, mobile, disponible en continu — distinct de tout le parc.",
    fonts: { display: "Bebas Neue", sans: "Inter" },
    variants: {
      hero: ["carte"],
      services: ["grille-cartes"],
      etapes: ["cartes-numerotees", "timeline-verticale"],
      faq: ["deux-colonnes", "accordeon"],
      tarifs: ["liste-simple", "grille"],
      galerie: ["grille", "masonry"],
      zone: ["liste", "carte"],
      contenu: ["texte-image"],
      contact: ["split-form-carte"],
      cta: ["bande"],
    },
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
    id: "taxi-jour",
    label: "Taxi · Jour (clair pro navy/orange)",
    sectionStrategy: "striped",
    sectionDivider: "none",
    // Registre CLAIR pro « mobilité » : fond blanc + gris très clair, encre navy,
    // orange vif en accent (couleurs du logo), sans géométrique, arrondis moyens,
    // ombres douces teintées navy. Les couleurs viennent de `branding.colors`
    // (navy/orange) ; le pack ne pilote que typo / rayons / ombres / rythme.
    ambiance:
      "Clair, net et rassurant : blanc + gris très clair, encre navy, orange vif (logo), sans géométrique (Poppins), arrondis moyens, ombres douces navy, boutons affirmés.",
    fonts: { display: "Poppins", sans: "Inter" },
    variants: {
      hero: ["split", "centre"],
      services: ["grille-cartes", "grille-icones"],
      produits: ["grille", "vitrine"],
      galerie: ["grille", "masonry"],
      avis: ["carrousel", "grille"],
      tarifs: ["grille", "liste-simple"],
      etapes: ["cartes-numerotees", "timeline-verticale"],
      faq: ["accordeon", "deux-colonnes"],
      contact: ["split-form-carte", "centre"],
      cta: ["bande", "encadre"],
    },
  },
  {
    id: "marine-premium",
    label: "Marine · Élégant & posé",
    family: "editorial",
    // Sections alternées blanc / bleu très clair (brand-50, dérivé du navy client).
    sectionStrategy: "brand-tinted",
    sectionDivider: "none",
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
  {
    id: "cotier-marine",
    label: "Côtier · Marine immersif",
    family: "littoral",
    // Corps clair « bord de mer » : alternance blanc / écume azur (brand-tinted),
    // dérivée du navy client. Les blocs immersifs (hero/pageHero/cta/footer)
    // peignent leur propre nuit marine.
    sectionStrategy: "brand-tinted",
    sectionDivider: "none",
    ambiance:
      "Côtier premium immersif (dérivé du logo : maison sur la mer au soleil levant). Serif haute contraste (Cormorant), corps clair azur/blanc ponctué de bandes NUIT MARINE navy + soleil doré + vague signature. Parti pris fort, distinct.",
    fonts: { display: "Cormorant Garamond", sans: "Inter" },
    variants: {
      hero: ["split", "centre"],
      services: ["grille-cartes", "grille-icones"],
      produits: ["grille", "vitrine"],
      galerie: ["grille", "masonry"],
      avis: ["grille", "vedette"],
      tarifs: ["grille", "liste-simple"],
      etapes: ["timeline-verticale", "sentier-alterne"],
      faq: ["deux-colonnes", "accordeon"],
      contact: ["split-form-carte", "panneau-sombre"],
      cta: ["bande", "encadre"],
    },
  },
  {
    id: "prestige-nuit",
    label: "Prestige · Nuit (luxe sombre)",
    family: "prestige",
    // Registre sombre immersif : les sections peignent leurs propres surfaces
    // near-black (--px-*), donc aucune alternance/filet clair du moteur.
    sectionStrategy: "flat",
    sectionDivider: "none",
    ambiance:
      "Luxe sombre immersif : fond noir/anthracite teinté marque, or métallique, typo display massive (Bodoni), bandes pleine largeur, gros chiffres, filets fins, numéro de réservation géant. Taxi de luxe / chauffeur classe.",
    fonts: { display: "Bodoni Moda", sans: "Inter" },
    variants: {
      hero: ["plein"],
      services: ["liste-filets"],
      avis: ["carrousel", "grille"],
      zone: ["liste"],
      cta: ["bande"],
    },
  },
  {
    id: "signal-graphite",
    label: "Signal · Structuré & technique",
    family: "signal",
    // Alternance sobre blanc / surface (structure discrète) : le rythme vient des
    // filets et des étiquettes d'index, pas d'une teinte de fond marquée.
    sectionStrategy: "surface-alt",
    sectionDivider: "none",
    ambiance:
      "Clair mais structuré, éditorial-technique : sans géométrique (Space Grotesk), grille de fins filets, étiquettes d'index (carré d'accent + majuscules espacées), titres adossés à une arête de marque, coins nets, ombres franches et discrètes. Net, opératoire, professionnel — jamais d'image en fond de hero.",
    fonts: { display: "Space Grotesk", sans: "Inter" },
    variants: {
      hero: ["fiche"],
      services: ["bento"],
      etapes: ["bande-procedure", "cartes-numerotees"],
      faq: ["deux-colonnes", "accordeon"],
      zone: ["liste", "carte"],
      contenu: ["texte-image"],
      contact: ["split-form-carte"],
      cta: ["bande"],
    },
  },
  {
    id: "epure-clair",
    label: "Atelier · Audacieux & net",
    family: "epure",
    // Alternance de fond avec un LAVIS de marque très pâle, sur laquelle tranchent
    // des blocs à ombre DURE et un bandeau marquee.
    sectionStrategy: "brand-tinted",
    sectionDivider: "none",
    ambiance:
      "Parti pris FORT « atelier / signage » : grotesque XXL (Bricolage), angles durs, bordures épaisses, ombres DURES décalées portées par la marque, cartes-stickers, gros chiffres, bandeau marquee défilant, blocs vert profond ponctués d'or. Affirmé et tactile — jamais d'image en fond de hero.",
    fonts: { display: "Bricolage Grotesque", sans: "Inter" },
    variants: {
      hero: ["carte"],
      services: ["grille-cartes"],
      etapes: ["cartes-numerotees", "timeline-verticale"],
      faq: ["deux-colonnes", "accordeon"],
      tarifs: ["grille"],
      galerie: ["grille"],
      contact: ["split-form-carte"],
      cta: ["encadre"],
    },
  },
  {
    id: "riso-atelier",
    label: "Riso · Atelier de sérigraphie",
    family: "riso",
    // Le papier reste UNIFORME (aucune alternance de fond) : le rythme de la page
    // vient des APLATS D'ENCRE pleine largeur (hero, cta, page-hero, footer) et du
    // damier des services, pas d'un fond qui change de teinte. Entre deux sections
    // de papier, un filet de coupe (`rule`) — le trait de massicot.
    sectionStrategy: "flat",
    sectionDivider: "rule",
    ambiance:
      "Parti pris FORT « atelier de sérigraphie / affiche de quartier » : grotesque d'affiche ultra-noire (Archivo Black) en capitales + mono d'imprimeur (IBM Plex Mono) pour TOUTE donnée (prix, horaires, index). Aplats d'encre saturés pleine page, surimpression multiply (deux encres en fabriquent une troisième), trame de points visible, décalage de repérage assumé sur les titres, barre de contrôle couleur, mires de repérage. Services en DAMIER encre/papier indexé par lettres, zéro carte, zéro arrondi, zéro ombre portée. Photos en duotone. Franc, imprimé, populaire.",
    fonts: { display: "Archivo Black", sans: "Inter" },
    variants: {
      hero: ["carte"],
      services: ["damier"],
      etapes: ["cartes-numerotees"],
      faq: ["deux-colonnes", "accordeon"],
      tarifs: ["grille", "liste-simple"],
      galerie: ["grille"],
      zone: ["liste"],
      contenu: ["texte-image"],
      contact: ["split-form-carte"],
      cta: ["bande"],
    },
  },
  {
    id: "cascade-hydro",
    label: "Cascade · Hydro-fresh immersif",
    family: "cascade",
    // Corps clair « eau vive » : alternance blanc / lavis de marque très pâle
    // (brand-tinted), reliée par des VAGUES entre sections (sectionDivider). Les
    // blocs d'identité (hero/cta/pageHero) peignent leur propre dégradé bleu→vert.
    sectionStrategy: "brand-tinted",
    sectionDivider: "wave",
    ambiance:
      "Parti pris FORT « hydro-fresh immersif de jour » : grands dégradés bleu→vert LUMINEUX, cartes de VERRE GIVRÉ (glassmorphism), transitions en VAGUES, SCEAU circulaire de promesse (écho de la tagline), pilules ultra-arrondies, ombres douces lumineuses teintées marque, gouttelettes. Display géométrique (Sora). Frais, protecteur, éco — l'anti-nuit-marine de littoral.",
    fonts: { display: "Sora", sans: "Inter" },
    variants: {
      hero: ["carte", "centre"],
      services: ["grille-cartes", "grille-icones"],
      etapes: ["timeline-verticale", "cartes-numerotees"],
      faq: ["deux-colonnes", "accordeon"],
      tarifs: ["grille", "liste-simple"],
      galerie: ["grille", "masonry"],
      zone: ["liste", "carte"],
      contenu: ["texte-image"],
      contact: ["split-form-carte"],
      cta: ["bande"],
    },
  },
  {
    id: "foyer-carnet",
    label: "Foyer · Carnet de maison chaleureux",
    family: "foyer",
    // Corps clair « papier » : alternance crème / surface chaude (surface-alt).
    // Les blocs d'identité peignent leur propre chaleur (cadres photo album,
    // cartes-recette, check-list cochée, carton d'invitation de marque).
    sectionStrategy: "surface-alt",
    sectionDivider: "none",
    ambiance:
      "Chaleureux et domestique, « carnet de maison » : voix MANUSCRITE en signature (script Caveat pour les kickers, note « by Maman »), titres serif éditorial chaud (Newsreader), cartes-recette arrondies à liseré COUTURE pointillé, étapes en check-list cochée, CTA en carton d'invitation, header à filet-couture, pilules d'accent miel. Personnel, rassurant, tactile — parti pris fort et distinct.",
    fonts: { display: "Newsreader", sans: "Inter" },
    variants: {
      hero: ["carte", "split"],
      services: ["grille-cartes"],
      etapes: ["cartes-numerotees", "timeline-verticale"],
      faq: ["deux-colonnes", "accordeon"],
      tarifs: ["grille", "liste-simple"],
      galerie: ["grille", "masonry"],
      simulateur: ["carte"],
      contenu: ["texte-image"],
      contact: ["split-form-carte"],
      cta: ["encadre"],
    },
  },
  {
    id: "aronde-atelier",
    label: "Aronde · Menuiserie d'assemblage",
    family: "aronde",
    // Corps clair « établi crème » : alternance blanc / lavis de bois très pâle
    // (brand-tinted). Les blocs d'identité (hero/pageHero/cta/footer) peignent
    // leur propre pan de bois espresso, assemblé au corps par une queue d'aronde.
    sectionStrategy: "brand-tinted",
    sectionDivider: "none",
    ambiance:
      "Parti pris FORT « atelier d'ébéniste / menuiserie d'assemblage » : slab serif robuste (Zilla Slab), corps clair crème ponctué de PANS DE BOIS espresso pleine largeur, assemblés au corps par une QUEUE D'ARONDE signature. Panneaux de services à COUPE D'ONGLET (coin taillé 45°), index chiffrés au fil de coupe, mortaises carrées pour les étapes, grain de bois discret, arête caramel. Angles nets, ombres franches et basses. Chaleureux, tactile, artisanal — distinct de tout le parc.",
    fonts: { display: "Zilla Slab", sans: "Inter" },
    variants: {
      hero: ["plein"],
      services: ["grille-cartes"],
      etapes: ["timeline-verticale", "cartes-numerotees"],
      faq: ["deux-colonnes", "accordeon"],
      tarifs: ["liste-simple", "grille"],
      galerie: ["grille", "masonry"],
      zone: ["liste", "carte"],
      contenu: ["texte-image"],
      contact: ["split-form-carte"],
      cta: ["bande"],
    },
  },
  {
    id: "atelier-fil",
    label: "Fil · Atelier de couture",
    family: "fil",
    // Corps clair « papier patron » : alternance blanc / lavis de lin très pâle
    // (brand-tinted). Les blocs d'identité (hero/pageHero/cta/footer) peignent
    // leur propre pan d'ENCRE brand-800, cousu au corps par un fil pointillé +
    // nœud (la couture signature).
    sectionStrategy: "brand-tinted",
    sectionDivider: "none",
    ambiance:
      "Parti pris FORT « atelier de couture / confection » : le FIL COUSU en motif conducteur. Hero plein cadre dont la PHOTO ENTIÈRE est re-teintée aux couleurs de la marque (duotone), titre éclaté haut-gauche / bas-droite relié par une couture SVG qui se trace au chargement (aiguille comprise), timeline des étapes COUSUE AU SCROLL (le fil noue chaque étape), coutures pointillées + nœuds entre pans d'encre et corps « papier patron », cartes-échantillons épinglées, serif à empattements expressive (Fraunces) en graisse légère + italiques. Précis, tactile, premium — distinct de tout le parc.",
    fonts: { display: "Fraunces", sans: "Inter" },
    variants: {
      hero: ["plein"],
      services: ["grille-cartes"],
      etapes: ["timeline-verticale"],
      faq: ["deux-colonnes", "accordeon"],
      tarifs: ["liste-simple", "grille"],
      galerie: ["masonry", "grille"],
      zone: ["liste"],
      contenu: ["texte-image"],
      contact: ["split-form-carte"],
      cta: ["bande"],
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
