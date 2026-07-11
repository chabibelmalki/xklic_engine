/**
 * Schéma `SiteConfig` — la SEULE source de vérité d'un site.
 *
 * Principe : le moteur rend n'importe quelle config conforme à ce schéma.
 * Le métier (seo.schemaType) ET le statut juridique (entreprise.statut) sont
 * des DONNÉES, jamais des hypothèses codées en dur.
 *
 * Extensibilité : ajouter un bloc / thème / statut est ADDITIF. Les `string`
 * élargis (theme, statut, block.type) gardent les configs existantes valides ;
 * un type inconnu dégrade proprement (voir blocks/catalog.ts).
 */

// ----------------------------------------------------------------------------
// Thèmes
// ----------------------------------------------------------------------------

/** Thèmes livrés. `(string & {})` laisse la porte ouverte à de nouveaux thèmes. */
export type ThemeId =
  | "douceur-beige"
  | "energie-corail"
  | "pro-bleu-nuit"
  | "fraicheur-teal"
  | "rose-poudre"
  // Palettes promues depuis les ex-couleurs des packs (découplage couleur↔pack) :
  // utilisables avec N'IMPORTE QUEL pack.
  | "maison-ivoire"
  | "terra-sauge"
  | "acier-anthracite"
  | "rose-cuivre"
  | "noir-cuivre"
  | "pop-violet"
  | "bleu-azur"
  | (string & {});

/**
 * STYLE PACK — design system complet (typo + formes + ombres + motion + fond +
 * palette), au niveau site. Plus riche que `theme` (qui ne pilote que la
 * couleur). `base` = rendu historique (palette portée par `theme`). Les packs
 * « signés » embarquent leur propre palette. Absent => `base` (rétro-compat).
 * `(string & {})` laisse la porte ouverte à de nouveaux packs.
 */
export type StylePackId =
  | "base"
  | "maison-premium"
  | "rose-noir-premium"
  | "atelier-industriel"
  | "clair-frais"
  | "pop-moderne"
  | "terra-naturel"
  | (string & {});

// ----------------------------------------------------------------------------
// Entreprise & statut juridique
// ----------------------------------------------------------------------------

/** Statuts juridiques français courants. Élargi par `(string & {})`. */
export type StatutJuridique =
  | "EI" // Entreprise individuelle
  | "micro" // Micro-entreprise (auto-entrepreneur)
  | "EURL"
  | "SARL"
  | "SAS"
  | "SASU"
  | "SA"
  | "SNC"
  | "SCI"
  | "association"
  | (string & {});

/** Régime de TVA — pilote la mention TVA des mentions légales. */
export type RegimeTVA = "franchise" | "reel" | "exonere";

export interface TVA {
  /**
   * `franchise` → "TVA non applicable, art. 293 B du CGI".
   * `reel` → numéro de TVA intracommunautaire affiché.
   * `exonere` → activité exonérée (mention neutre).
   */
  regime: RegimeTVA;
  numero?: string;
}

export interface Entreprise {
  /** Raison sociale / nom commercial affiché. */
  nom: string;
  statut: StatutJuridique;
  siret: string;
  tva: TVA;

  /** Code APE/NAF (ex. "81.21Z"). Affiché en mentions légales et pied de page. */
  ape?: string;
  /** Libellé du code APE (ex. "Nettoyage courant des bâtiments"). */
  apeLabel?: string;

  // Spécifiques aux sociétés (SARL, SAS, SASU, EURL, SA…) :
  /** Capital social en euros (ex. 5000). */
  capital?: number;
  /** Ville du greffe pour le RCS (ex. "Nîmes"). */
  rcs?: string;
  /** Nom du/de la dirigeant·e (gérant, président…). */
  dirigeant?: string;
  /** Adresse du siège social. */
  siege?: string;
}

// ----------------------------------------------------------------------------
// SEO / méta
// ----------------------------------------------------------------------------

export interface Seo {
  /** Type schema.org du métier : HousekeepingService, AutoRepair, Bakery… */
  schemaType: string;
  /** Ville principale — injectée dans H1, title, JSON-LD. */
  ville: string;
}

export interface Meta {
  title?: string;
  description?: string;
  /** URL d'image OpenGraph (sinon dérivée du hero/logo). */
  ogImage?: string;
  /** Mots-clés indicatifs. */
  keywords?: string[];
}

/** Plateformes sociales reconnues (icône dédiée). Élargi par `(string & {})`. */
export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "whatsapp"
  | "youtube"
  | "x"
  | "google"
  | (string & {});

/**
 * Un réseau social du client. `url` = lien public du profil. Pour `whatsapp`,
 * `url` accepte soit une URL `wa.me`, soit un NUMÉRO (converti en lien wa.me).
 * Une plateforme inconnue dégrade sur une icône générique (globe).
 */
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  /** Libellé d'accessibilité (défaut : nom de la plateforme). */
  label?: string;
}

/**
 * Couleurs de marque pilotées par la config (découplage couleur↔code).
 * Si présent, le moteur GÉNÈRE tout le système de tokens depuis ces graines
 * (échelle 50→800, accent, neutres, contrastes) et l'injecte en inline, sans
 * toucher au code ni à globals.css. Absent → on retombe sur le thème nommé.
 * Voir `src/lib/colors.ts`.
 */
export interface BrandColors {
  /** Couleur principale (graine). Hex, ex. "#327cb7". */
  brand: string;
  /** Accent / CTA. Hex. Défaut : ambre (#f59e0b) si absent. */
  accent?: string;
  /**
   * Tonalité des neutres (gris/fonds). Défaut : teinté par `brand`.
   * `dark` = registre SOMBRE (fonds near-black, encre claire) : à utiliser avec
   * un pack nocturne (ex. `prestige-nuit`) pour que TOUT le rendu retombant sur
   * la famille classic (contact, pages légales, /avis) reste sombre et cohérent
   * avec les blocs immersifs, sans perdre la couleur de marque.
   */
  neutral?: "warm" | "cool" | "dark";
}

export interface Branding {
  /** URL du logo (object storage). */
  logo?: string;
  /**
   * Icône CARRÉE dédiée au favicon / app icon (sinon `logo`, sinon icône
   * générée). Idéale ~256×256 : un logo large rend mal en favicon.
   */
  icon?: string;
  /** Texte alternatif du logo (sinon le nom de l'entreprise). */
  logoAlt?: string;
  /**
   * Affiche le nom en wordmark DEUX TONS (couleurs de marque exactes) : 1er mot
   * dans `first`, le reste dans `rest`. Reproduit un logotype type « SANAD CLEAN ».
   * N'affecte que le rendu clair (header) ; le footer sombre garde le blanc.
   */
  logoTwoTone?: { first: string; rest: string };
  /**
   * Pose l'emblème du logo dans une PASTILLE RONDE BLANCHE sur les fonds sombres
   * (footer). À activer pour un logo sombre/transparent qui disparaîtrait sinon.
   * À laisser à défaut (faux) pour un logo clair déjà lisible sur fond sombre.
   */
  logoDarkBadge?: boolean;
  /** Petite ligne sous le nom (ex. "Nettoyage · Nîmes"). */
  tagline?: string;
  /**
   * Couleurs de marque (graines). Si défini, génère et injecte la palette
   * complète et prend le pas sur le thème nommé. Voir `BrandColors`.
   */
  colors?: BrandColors;
}

// ----------------------------------------------------------------------------
// Blocs
// ----------------------------------------------------------------------------

export interface CTA {
  label: string;
  href: string;
}

export interface ImageRef {
  url: string;
  alt?: string;
}

// --- hero ---
/** Carte de prix flottante du hero (variant "carte"). */
export interface HeroCard {
  /** Petit label au-dessus du prix (ex. "Ménage à domicile"). */
  label?: string;
  /** Prix principal (ex. "15 €"). */
  prix: string;
  /** Unité (ex. "/ heure"). */
  unite?: string;
  /** Mention sous le prix (ex. "après crédit d'impôt"). */
  mention?: string;
  /** Ancien prix barré affiché à côté de la mention (ex. "30 €/h"). */
  prixBarre?: string;
  /** Points clés listés sous le prix. */
  points?: string[];
  /** Ligne d'avis sous la carte (ex. "Clients satisfaits à Nîmes"). */
  rating?: { note?: number; label?: string };
}

export interface HeroBadgeTrust {
  /** Nom d'icône lucide. */
  icone?: string;
  label: string;
}

export interface HeroContent {
  titre: string;
  /** Fin du titre mis en valeur (dégradé) — ex. "15 €/h". */
  titreAccent?: string;
  sousTitre?: string;
  /** Badge "eyebrow" au-dessus du titre. */
  eyebrow?: string;
  accroche?: string;
  image?: ImageRef;
  /**
   * Ratio du cadre image pour les variants "split" / "asymetrique" :
   * "3/4" | "4/5" | "1/1" | "4/3" | "3/2" | "16/10". Défaut "4/5" (portrait).
   * Mettre "3/2" ou "16/10" pour une photo PAYSAGE affichée sans recadrage agressif.
   */
  imageRatio?: string;
  /**
   * Variant "split" : agrandit la colonne image (image plus grande que le
   * texte). Défaut false = colonnes 1.1/0.9 (texte dominant). Voir Hero.tsx.
   */
  imageWide?: boolean;
  /** Carte de prix flottante (variant "carte"). */
  card?: HeroCard;
  /** Badges de confiance avec icônes (sous les CTA). */
  trust?: HeroBadgeTrust[];
  /**
   * Images de confiance affichées côte à côte sur une ligne à part, sous les
   * badges `trust` (ex. logo « Services à la personne » + pastille crédit
   * d'impôt). Alignées sur une même hauteur, proportions conservées.
   */
  trustImages?: ImageRef[];
  badges?: string[];
  ctaPrimaire?: CTA;
  ctaSecondaire?: CTA;
  /** Affiche les icônes réseaux (config.social) dans le hero. Défaut : false. */
  showSocial?: boolean;
  /**
   * Affiche le NUMÉRO de téléphone (cliquable, tel:) dans le hero, juste avant
   * les CTA. Le numéro vient du bloc `contact`. Utile quand appeler EST l'action
   * n°1 (taxi, dépannage…). Variante "plein" pour l'instant. Défaut : false.
   */
  showPhone?: boolean;
  /**
   * Moyens de paiement acceptés, affichés en petites vignettes cartes dans le
   * hero (marques reconnues : "visa", "mastercard", "amex"). Une marque inconnue
   * est ignorée. Absent/vide => aucune vignette. Voir `PaymentMarks`.
   */
  payments?: string[];
  /** Libellé (i18n) au-dessus des vignettes de paiement (ex. "Paiement accepté"). */
  paymentsLabel?: string;
}

// --- services ---
export interface ServiceItem {
  nom: string;
  description?: string;
  /** Nom d'icône lucide (optionnel, dégrade en pastille). */
  icone?: string;
  /** Emoji affiché à la place de l'icône (style "catalogue"). */
  emoji?: string;
  image?: ImageRef;
  /** Indice de prix affiché en pied de carte (ex. "dès 30 €/h"). */
  priceHint?: string;
  /** Pastille en haut de carte (ex. "Crédit d'impôt 50 %"). */
  badge?: string;
  /** Lien optionnel de la carte. */
  href?: string;
}
export interface ServicesContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  items: ServiceItem[];
  /** CTA sous la grille (ex. "Voir tous les tarifs"). */
  cta?: CTA;
}

// --- etapes ("comment ça marche") ---
export interface EtapeItem {
  titre: string;
  texte: string;
  icone?: string;
}
export interface EtapesContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  items: EtapeItem[];
}

// --- simulateur (économie / crédit d'impôt, etc.) ---
export interface SimulateurContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  /** Texte du panneau de gauche (argumentaire). */
  argumentaireTitre?: string;
  /** Fin du titre d'argumentaire mise en valeur. */
  argumentaireAccent?: string;
  argumentaire?: string;
  /** Points clés à gauche. */
  points?: string[];
  cardTitre?: string;
  cardIntro?: string;
  /** Label du curseur (ex. "Heures de ménage par semaine"). */
  curseurLabel: string;
  /** Unité affichée à côté de la valeur (ex. "h"). */
  unite?: string;
  min: number;
  max: number;
  step?: number;
  defaut: number;
  /** Prix plein / unité de temps (€). */
  prixPlein: number;
  /** Prix net après aide / unité (€). */
  prixNet: number;
  /** Multiplicateur valeur curseur -> unités facturables par mois (ex. 4.33). */
  facteurMensuel?: number;
  /** Plafond annuel de l'aide (ex. 12000). Au-delà : avertissement. */
  plafondAnnuel?: number;
  note?: string;
  cta?: CTA;
  ctaSecondaire?: CTA;
}

// --- cta band ---
export interface CtaContent {
  titre: string;
  sousTitre?: string;
  ctaPrimaire?: CTA;
  ctaSecondaire?: CTA;
  /** Lien texte sous les boutons (ex. WhatsApp). */
  lien?: CTA;
  /**
   * Image de fond OPTIONNELLE de la bande CTA (plein cadre, sous voile sombre).
   * Utilisée par les familles immersives (ex. `prestige`) ; ignorée par les
   * familles qui rendent une bande de couleur pleine (classic, editorial).
   */
  image?: ImageRef;
}

// --- tarifs ---
export type TarifsMode = "grille" | "a-partir-de" | "sur-devis";
export interface TarifItem {
  nom: string;
  /** Prix en euros (nombre) ou libellé libre ("Sur devis"). */
  prix?: number | string;
  /** Unité : "/h", "/mois", "à partir de"… */
  unite?: string;
  description?: string;
  /** Met en avant l'offre (carte surlignée). */
  populaire?: boolean;
  /** Points inclus dans l'offre. */
  inclus?: string[];
}
export interface TarifsContent {
  titre?: string;
  intro?: string;
  items?: TarifItem[];
  /** Note de bas (TVA, conditions…). */
  note?: string;
  /** CTA "demander un devis" (utile en mode sur-devis / a-partir-de). */
  cta?: CTA;
}

// --- grilleTarifs (tableau de tarifs par destination) ---
/** Une ligne de la grille tarifaire (une destination). */
export interface GrilleTarifsLigne {
  /** Destination (ex. "Aéroport de Béziers"). */
  destination: string;
  /** Prix tarif de jour : nombre (EUR, "€" ajouté) ou libellé libre. */
  jour?: number | string;
  /** Prix tarif de nuit / dimanches & fériés : nombre (EUR) ou libellé. */
  nuit?: number | string;
  /** Distance estimée (ex. "64 km"). */
  distance?: string;
  /** Temps de parcours estimé (ex. "50 min", "1h20"). */
  duree?: string;
}
/**
 * Contenu du bloc `grilleTarifs` : un TABLEAU de tarifs indicatifs par
 * destination (prix jour / nuit, distance, durée), au départ d'un point donné.
 * Pensé pour les taxis/VTC à forfaits fixes. Défilement horizontal sur mobile.
 */
export interface GrilleTarifsContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  /** Point de départ affiché sous le titre (ex. "gare Saint-Roch de Montpellier"). */
  origine?: string;
  /** Libellés de colonnes (surchargeables pour l'i18n). */
  colonnes?: {
    destination?: string;
    jour?: string;
    nuit?: string;
    distance?: string;
    duree?: string;
  };
  lignes: GrilleTarifsLigne[];
  /** Note de bas de tableau (astérisque : caractère indicatif des prix…). */
  note?: string;
  cta?: CTA;
}

// --- simulateurTaxi (estimateur de prix au km, paramétrable) ---
/** Une option d'un groupe de variantes (ex. « Nuit », « Van »). La 1re option d'un groupe est celle sélectionnée par défaut. */
export interface SimulateurTaxiVarianteOption {
  id: string;
  label: string;
  /** Prix au km (€) porté par cette option. Si défini, s'ajoute au prix/km courant (typiquement un seul groupe le porte). */
  prixKm?: number;
  /** Majoration en % appliquée au total (ex. van +25). Cumulative entre options/suppléments sélectionnés. */
  majorationPct?: number;
  /** Montant forfaitaire (€) ajouté quand l'option est choisie. */
  montant?: number;
  /** Aide affichée sous l'option. */
  description?: string;
}
/** Un groupe de variantes = un sélecteur exclusif (radio). Ex. « Moment » (Jour/Nuit), « Véhicule » (Berline/Van). */
export interface SimulateurTaxiVarianteGroupe {
  id: string;
  label: string;
  options: SimulateurTaxiVarianteOption[];
}
/** Un supplément optionnel (case à cocher). Montant forfaitaire et/ou majoration %. */
export interface SimulateurTaxiSupplement {
  id: string;
  label: string;
  /** Montant forfaitaire (€) ajouté quand coché. */
  montant?: number;
  /** Majoration % appliquée au total quand coché. */
  majorationPct?: number;
  /** Coché par défaut. */
  defaut?: boolean;
  description?: string;
}
/**
 * Contenu du bloc `simulateurTaxi` : un ESTIMATEUR de prix de course paramétrable.
 * L'utilisateur saisit une distance (km) et choisit des variantes (moment, véhicule…)
 * et des suppléments ; le prix approximatif est calculé côté client, à titre indicatif.
 * Formule : total = max( (priseEnCharge + Σmontants + distance·Σprix/km) · (1 + Σmajorations%), minimumCourse ).
 * 100 % configuré : aucune règle métier en dur. Réutilisable pour tout taxi / VTC.
 */
export interface SimulateurTaxiContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  /** Panneau de gauche : titre d'argumentaire. */
  argumentaireTitre?: string;
  /** Fin du titre d'argumentaire mise en valeur. */
  argumentaireAccent?: string;
  argumentaire?: string;
  /** Points clés à gauche. */
  points?: string[];
  cardTitre?: string;
  cardIntro?: string;
  /** Prise en charge (€), forfait de base ajouté à toute course. */
  priseEnCharge?: number;
  /** Minimum de perception (€) : plancher du prix estimé. */
  minimumCourse?: number;
  /** Bornes et libellés du champ distance (km par défaut). */
  distanceLabel?: string;
  distanceMin?: number;
  distanceMax?: number;
  distanceDefaut?: number;
  distanceStep?: number;
  /** Unité de distance affichée (défaut « km »). */
  unite?: string;
  /** Sélecteurs exclusifs (moment, véhicule…). */
  variantes?: SimulateurTaxiVarianteGroupe[];
  /** Suppléments optionnels (bagages, animal, attente…). */
  supplements?: SimulateurTaxiSupplement[];
  /** Demi-fourchette affichée autour de l'estimation, en % (défaut 10 → ± 10 %). */
  margePct?: number;
  /** Libellé du bloc résultat (défaut « Estimation de votre course »). */
  resultatLabel?: string;
  note?: string;
  cta?: CTA;
  ctaSecondaire?: CTA;
}

// --- zone ---
export type ZoneMode = "carte" | "liste" | "aucune";
/** Un groupe de communes desservies, rattaché à une région / un département. */
export interface ZoneRegion {
  /** Libellé du groupe, ex. "Gard — autour de Nîmes". */
  region: string;
  /** Ville principale mise en avant (sinon la 1re de `villes`). */
  principale?: string;
  /** Communes desservies dans cette zone. */
  villes: string[];
}
export interface ZoneContent {
  titre?: string;
  intro?: string;
  /** Communes à plat (rétro-compat). Si `zones` est fourni, il prime à l'affichage. */
  villes?: string[];
  /** Communes regroupées par région/département (affichage propre + multi-zones). */
  zones?: ZoneRegion[];
  rayonKm?: number;
  /** URL d'iframe de carte (Google Maps / OSM) pour mode "carte". */
  mapEmbedUrl?: string;
}

// --- faq ---
export interface FaqItem {
  question: string;
  reponse: string;
}
export interface FaqContent {
  titre?: string;
  items: FaqItem[];
}

// --- galerie ---
export type GalerieVariant = "avant-apres" | "produits" | "grille";
export interface GalerieAvantApresItem {
  avant: ImageRef;
  apres: ImageRef;
  legende?: string;
}
export interface GalerieImageItem {
  image: ImageRef;
  titre?: string;
  description?: string;
}
export interface GalerieContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  /** Pour variant "avant-apres" (deux images côte à côte). */
  avantApres?: GalerieAvantApresItem[];
  /** Pour variants "produits" / "grille" / "montage" (image unique). */
  images?: GalerieImageItem[];
  /** Active la visionneuse plein écran (défaut: true). */
  lightbox?: boolean;
  /** Pastille affichée sur les vignettes (ex. "Avant / Après"). */
  pastille?: string;
  /** Ratio des vignettes : "3/4" | "4/3" | "1/1" (défaut selon variant). */
  ratio?: string;
}

// --- produits (catalogue de vente : photo + nom + prix) ---
/** Un article à la vente : photo, nom, prix (nombre ou libellé), badge. */
export interface ProduitItem {
  nom: string;
  image?: ImageRef;
  /** Emoji affiché en pastille si aucune photo (carte produit sans image). */
  emoji?: string;
  /** Prix en euros (nombre formaté) ou libellé libre ("2 €/kg", "Sur commande"). */
  prix?: number | string;
  /** Unité affichée à côté d'un prix numérique (ex. "/kg", "la part"). */
  unite?: string;
  description?: string;
  /** Pastille en coin de carte (ex. "Sur commande", "Best-seller"). */
  badge?: string;
  /** Met l'article en avant (carte surlignée). */
  populaire?: boolean;
}
/** Un rayon du catalogue (ex. "Viennoiseries", "Pâtisseries orientales"). */
export interface ProduitCategorie {
  titre?: string;
  description?: string;
  items: ProduitItem[];
}
/**
 * Contenu du bloc `produits` : grille de cartes « photo + nom + prix »,
 * regroupables par catégorie. Pour la VENTE d'articles, là où `tarifs` (prix
 * sans photo) et `galerie` (photo sans prix) ne conviennent pas.
 */
export interface ProduitsContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  /** Catalogue par rayons. Si absent, on utilise `items` (grille à plat). */
  categories?: ProduitCategorie[];
  /** Grille à plat (alternative à `categories`). */
  items?: ProduitItem[];
  /** Active la visionneuse plein écran sur les photos (défaut: true). */
  lightbox?: boolean;
  /** Note de bas (délais de commande, conditions…). */
  note?: string;
  cta?: CTA;
}

// --- boutique (catalogue e-commerce : cartes produit + panier) ---
/**
 * Contenu du bloc `boutique` : grille de cartes produit (photo + nom + prix +
 * bouton « + Ajouter »/pas-à-pas) avec un panier « Votre sélection » (quantités,
 * total) et un formulaire de commande intégré (POST /api/contact, mode "devis").
 * Les articles à prix numérique sont sommés ; ceux à prix texte ("Sur devis")
 * sont ajoutés à la demande sans être chiffrés. Réutilise `ProduitItem`.
 */
export interface BoutiqueContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  /** Rayons du catalogue. Si absent, on utilise `items` (grille à plat). */
  categories?: ProduitCategorie[];
  items?: ProduitItem[];
  /** Notes de bas (délais, conditions de commande…). */
  notes?: string[];
  // panier + formulaire intégré :
  villes?: string[];
  telephone?: string;
  whatsapp?: string;
  confidentialiteHref?: string;
  /** Libellé du bouton d'envoi (défaut: « Demander une intervention »). */
  submitLabel?: string;
}

// --- catalogue (boutique EN LIGNE : données live du back-office + paiement) ---
/**
 * Contenu du bloc `catalogue` : boutique e-commerce LIVE. Contrairement à
 * `boutique` (articles statiques dans la config, sortie en demande de devis),
 * ce bloc charge produits/stock/prix depuis le back-office (via le proxy
 * `/api/shop/catalog`) et envoie le panier vers un paiement Stripe hosted
 * (via `/api/shop/checkout`). Nécessite `config.shop.enabled = true`.
 * Le contenu ne porte QUE la présentation : les données produits vivent dans
 * le back-office (source de vérité prix/stock, revalidée au paiement côté Go).
 */
export interface CatalogueContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  /** Notes de bas (retrait, délais, conditions…). */
  notes?: string[];
  confidentialiteHref?: string;
  /** Libellé du bouton de paiement (défaut : « Payer ma commande »). */
  submitLabel?: string;
  /** Message si le catalogue est vide (défaut : message générique). */
  emptyMessage?: string;
}

// --- commandeRecap (page « merci » : récapitulatif après paiement) ---
/**
 * Contenu du bloc `commandeRecap` : lit `?session_id=` (posé par Stripe sur la
 * success URL) et affiche le récapitulatif de la commande via le proxy
 * `/api/shop/order`. Sans session_id, affiche un simple remerciement.
 */
export interface CommandeRecapContent {
  titre?: string;
  intro?: string;
  /** Lien de retour (défaut : "/boutique"). */
  retourHref?: string;
}

// --- avis ---
export interface AvisItem {
  auteur: string;
  texte: string;
  /** Note /5. */
  note?: number;
  date?: string;
  /** Ville / localité affichée sous l'auteur. */
  ville?: string;
}
export interface AvisContent {
  titre?: string;
  eyebrow?: string;
  /** Ville (sous l'auteur). */
  /** Note globale affichée (ex. 4.9). */
  noteGlobale?: number;
  /** Nombre total d'avis. */
  nombre?: number;
  items: AvisItem[];
  /** Mention sous la grille (ex. "témoignages à titre d'exemple"). */
  disclaimer?: string;
  /**
   * Étoiles par carte en version COMPACTE : une seule étoile + la note chiffrée
   * (ex. « ★ 5,0 ») au lieu d'une rangée de 5 étoiles. Réduit la répétition
   * visuelle quand tous les avis sont notés pareil. Défaut : rangée complète.
   */
  compactStars?: boolean;
}

// --- contact ---
export interface Horaire {
  jour: string;
  heures: string;
}
/**
 * Mode du formulaire de contact.
 * - `simple`               : nom, email, message.
 * - `demande-intervention` : nom, téléphone, service, zone/adresse, date, message.
 * - `devis` / `contact`    : modes historiques (rétro-compat). Tous les modes
 *   POSTent vers /api/contact.
 */
export type ContactFormMode = "simple" | "demande-intervention" | "devis" | "contact";

export interface ContactContent {
  titre?: string;
  intro?: string;
  telephone?: string;
  email?: string;
  whatsapp?: string;
  adresse?: string;
  horaires?: Horaire[];
  cta?: CTA;
  /** Affiche un formulaire de contact/demande opérationnel (POST /api/contact). */
  form?: boolean;
  /** Mode du formulaire (voir ContactFormMode). Défaut : "simple". */
  formMode?: ContactFormMode;
  /** @deprecated alias historique de `formMode` ("devis" | "contact"). */
  formType?: "devis" | "contact";
  formTitre?: string;
  formIntro?: string;
  /** Options du menu "prestation/service souhaité". */
  services?: string[];
  /** Communes proposées dans le sélecteur zone/ville. */
  villes?: string[];
  /** URL d'iframe de carte (affichée sous les coordonnées). */
  mapEmbedUrl?: string;
  /** Lien vers la politique de confidentialité (consentement RGPD). */
  confidentialiteHref?: string;
  /**
   * Affichage du téléphone dans le HEADER (desktop + menu mobile). `"texte"`
   * (défaut, rétro-compat) affiche le numéro en clair. `"icone-popup"` affiche
   * une icône téléphone ; au clic, un popup présente le numéro (cliquable) et
   * un bouton pour le copier. N'affecte que le rendu du header.
   */
  telephoneHeader?: "texte" | "icone-popup";
}

// --- pageHero (en-tête de page intérieure : eyebrow + fil d'ariane + titre) ---
export interface PageHeroContent {
  eyebrow?: string;
  titre: string;
  intro?: string;
  /** Fil d'ariane. Si absent, généré depuis la page courante (Accueil › Page). */
  breadcrumb?: { label: string; href?: string }[];
  ctaPrimaire?: CTA;
  ctaSecondaire?: CTA;
}

// --- contenu (texte éditorial libre, multi-paragraphes, + image optionnelle) ---
/**
 * Bloc de récit/éditorial : un titre, plusieurs paragraphes (chacun rendu dans
 * son propre <p>, respiration préservée) et une image optionnelle côte à côte.
 * Pensé pour les pages « à propos / notre histoire » de n'importe quel client.
 */
export interface ContenuContent {
  eyebrow?: string;
  titre?: string;
  /** Fin du titre mise en valeur (dégradé) — comme le hero. */
  titreAccent?: string;
  /** Corps de texte : un élément = un paragraphe. */
  paragraphes: string[];
  image?: ImageRef;
  /** Côté de l'image en desktop. Défaut : "right". */
  imagePosition?: "left" | "right";
  /**
   * Ratio du cadre image : "3/4" | "4/5" | "1/1" | "4/3" | "16/10".
   * Défaut "4/5" (portrait). Mettre "4/3" ou "16/10" pour une photo PAYSAGE
   * affichée sans recadrage agressif.
   */
  imageRatio?: string;
  ctaPrimaire?: CTA;
  ctaSecondaire?: CTA;
}

// --- devis-builder (panier de prix interactif) ---
export interface DevisTier {
  label: string;
  /** Prix en euros. Absent + `surDevis` => "Sur devis". */
  prix?: number;
  /** Préfixe affiché (ex. "dès"). */
  prefixe?: string;
  surDevis?: boolean;
}
export interface DevisPrestation {
  nom: string;
  type: "horaire" | "tiers";
  // type "horaire" :
  tauxHoraire?: number;
  supplementMateriel?: number;
  supplementMaterielLabel?: string;
  heuresMin?: number;
  heuresMax?: number;
  heuresDefaut?: number;
  // type "tiers" :
  tiers?: DevisTier[];
}
export interface DevisCategorie {
  id?: string;
  emoji?: string;
  titre: string;
  description?: string;
  /** true => badge "−50 % crédit d'impôt" et prix éligibles à la déduction. */
  creditImpot?: boolean;
  prestations: DevisPrestation[];
}
/** Contenu du bloc `serviceQuoteBuilder` (configurateur de devis de services). */
export interface ServiceQuoteBuilderContent {
  titre?: string;
  intro?: string;
  eyebrow?: string;
  /**
   * Affiche la bascule crédit d'impôt + les pastilles d'éligibilité par
   * catégorie. `false` => configurateur de devis/commande NEUTRE (produits,
   * traiteur, pâtisserie…), sans aucune mention de crédit d'impôt. Défaut: true.
   */
  credit?: boolean;
  /** Taux de crédit d'impôt (0.5 = 50 %). */
  creditRate?: number;
  /** Plafond annuel de l'aide (ex. 12000). */
  creditCeiling?: number;
  creditLabelOn?: string;
  creditLabelOff?: string;
  categories: DevisCategorie[];
  notes?: string[];
  // formulaire intégré :
  villes?: string[];
  telephone?: string;
  whatsapp?: string;
  confidentialiteHref?: string;
  /** Libellé du bouton d'envoi (défaut: « Demander une intervention »). */
  submitLabel?: string;
}

// ----------------------------------------------------------------------------
// Union de blocs
// ----------------------------------------------------------------------------

/** Map type de bloc -> forme de son contenu (sert au typage du catalog). */
export interface BlockContentMap {
  hero: HeroContent;
  pageHero: PageHeroContent;
  contenu: ContenuContent;
  services: ServicesContent;
  etapes: EtapesContent;
  simulateur: SimulateurContent;
  simulateurTaxi: SimulateurTaxiContent;
  tarifs: TarifsContent;
  grilleTarifs: GrilleTarifsContent;
  serviceQuoteBuilder: ServiceQuoteBuilderContent;
  produits: ProduitsContent;
  boutique: BoutiqueContent;
  catalogue: CatalogueContent;
  commandeRecap: CommandeRecapContent;
  zone: ZoneContent;
  faq: FaqContent;
  galerie: GalerieContent;
  avis: AvisContent;
  cta: CtaContent;
  contact: ContactContent;
}

export type KnownBlockType = keyof BlockContentMap;

/** Bloc fortement typé pour un type connu. */
export type KnownBlock = {
  [K in KnownBlockType]: {
    type: K;
    variant?: string;
    mode?: string;
    content: BlockContentMap[K];
  };
}[KnownBlockType];

/** Bloc inconnu (forward-compat) : accepté, dégrade proprement au rendu. */
export interface UnknownBlock {
  type: string;
  variant?: string;
  mode?: string;
  content?: unknown;
}

export type Block = KnownBlock | UnknownBlock;

// ----------------------------------------------------------------------------
// SiteConfig
// ----------------------------------------------------------------------------

/**
 * Une PAGE du site. Le multi-page est une dimension de la config : un site est
 * un tableau de pages, chacune avec son slug, son label de nav, ses blocs et
 * son SEO. L'accueil porte le slug "" (ou "index"/"/").
 *
 * Rétro-compat : un site SANS `pages` reste un one-pager basé sur `blocks`.
 */

/** Décrit la page comme une PRESTATION -> JSON-LD schema.org/Service. Optionnel. */
export interface PageService {
  /** Nom de la prestation (défaut: titre du pageHero, sinon page.label). */
  name?: string;
  /** Description courte (défaut: intro du pageHero). */
  description?: string;
  /** schema.org serviceType, ex. "Nettoyage de vitres". */
  serviceType?: string;
  /** Prix d'appel : nombre = EUR (Offer/lowPrice), ou libellé ("Sur devis"). */
  priceFrom?: number | string;
}

export interface PageConfig {
  /** "" (ou "index"/"/") pour l'accueil ; sinon "services", "tarifs", "contact"… */
  slug: string;
  /** Libellé affiché dans la navigation (header + footer + fil d'ariane). */
  label: string;
  blocks: Block[];
  /** Méta SEO propres à la page (title/description/ogImage). Sinon hérités. */
  meta?: Meta;
  /** Surcharge SEO de page (rare : schemaType/ville). Sinon hérités du site. */
  seo?: Partial<Seo>;
  /** Marque la page comme une prestation (JSON-LD Service). */
  service?: PageService;
  /** Exclut la page de la navigation principale (ex. mentions légales, devis). */
  navHidden?: boolean;
  /** Désindexe la page (robots noindex) — ex. pages légales. */
  noindex?: boolean;
}

/**
 * Boutique en ligne (module e-commerce). ABSENT ou `enabled: false` => aucune
 * fonctionnalité boutique (les blocs `catalogue`/`commandeRecap` affichent un
 * message d'indisponibilité). L'engine ne parle qu'au back-office (API Go) via
 * les proxys `/api/shop/*` — clé partagée `ENGINE_API_KEY` côté serveur
 * uniquement, jamais de clé Stripe ici.
 */
export interface ShopConfig {
  enabled: boolean;
  /** Slug du tenant côté back-office (défaut : slug du site). */
  tenant?: string;
}

/** Acheminement des leads (formulaires). Surcharge possible par site. */
export interface FormsConfig {
  /** Destinataire des e-mails de lead (sinon env LEAD_TO). */
  to?: string;
  /** Webhook n8n/Make à appeler en POST (sinon env LEAD_WEBHOOK_URL). */
  webhookUrl?: string;
  /** Active la protection Cloudflare Turnstile (clé publique via env). */
  turnstile?: boolean;
}

export interface SiteConfig {
  /** Identifiant unique = sous-domaine + nom de fichier (config/sites/<slug>.json). */
  slug: string;
  /**
   * Site de DÉMONSTRATION / test interne (non-client). Absent/false => vrai client.
   * Quand `true`, le site est servi normalement (rendu identique) mais EXCLU du
   * feed `/api/realisations` (portfolio de la vitrine). N'affecte PAS l'indexation :
   * un site peut être hors-portfolio TOUT EN restant indexé (ex. la vitrine conseil
   * du dirigeant). Pour désindexer, voir `noindexSite`.
   */
  demo?: boolean;
  /**
   * Empêche l'indexation du site : robots.txt `Disallow: /` ET sitemap NON soumis
   * à Google Search Console (`scripts/sync-sitemaps.mjs`). Indépendant de `demo`.
   * Les démos « exemple » par métier et les sites de test portent les deux flags ;
   * un site hors-portfolio mais à garder visible (ex. minhaj) porte `demo` seul.
   */
  noindexSite?: boolean;
  theme: ThemeId;
  /**
   * Style pack (design system complet : typo, formes, ombres, motion, fond,
   * palette). Absent => `base` (la palette vient alors de `theme`). Posé en
   * `data-pack` sur le conteneur racine (voir SiteRenderer + globals.css).
   */
  stylePack?: StylePackId;
  branding: Branding;
  /**
   * Réseaux sociaux du site (footer + option hero + `sameAs` JSON-LD). Mêmes
   * URLs dans toutes les locales. Absent / vide => aucune icône affichée.
   */
  social?: SocialLink[];
  /**
   * Lien « Laissez un avis » Google (page d'avis du client, ex.
   * `https://g.page/r/<id>/review` ou `https://search.google.com/local/writereview?placeid=<id>`).
   * ABSENT => la fonctionnalité avis est ENTIÈREMENT masquée (aucun bouton dans le
   * hero, page `/avis` en 404). Même valeur dans toutes les locales.
   */
  googleReviewUrl?: string;
  entreprise: Entreprise;
  seo: Seo;
  /** Coordonnées GPS du point principal (issues de la fiche Google) -> JSON-LD GeoCoordinates. */
  geo?: { lat: number; lng: number };
  meta: Meta;
  /** Blocs de l'accueil (one-pager) — utilisé si `pages` est absent. */
  blocks: Block[];
  /** Pages du site (multi-page). Si présent, prime sur `blocks`. */
  pages?: PageConfig[];
  /** Acheminement des formulaires (e-mail / webhook). */
  forms?: FormsConfig;
  /** Boutique en ligne (catalogue live + paiement via le back-office). */
  shop?: ShopConfig;
  /**
   * Domaine PERSO du site = là où il est RÉELLEMENT servi.
   *
   * RÈGLE (voir `siteOrigin` dans lib/urls.ts) : l'URL publique du site est
   *   - `https://<domain>`                          si ce champ est présent ;
   *   - `https://<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>`   sinon (ex. `<slug>.xklic.com`).
   * Cette URL pilote canonical, hreflang, OpenGraph, sitemap ET JSON-LD.
   *
   * ⚠️ NE renseigner `domain` QUE lorsqu'un domaine personnalisé est EFFECTIVEMENT
   * câblé (ajouté au projet Vercel + DNS pointant dessus). Sinon le canonical
   * pointe vers un domaine qui ne sert pas le site → mauvaise indexation.
   * Par défaut, laisser ce champ ABSENT : le site vit sur son sous-domaine
   * `<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>`. Un `domain` présent déclenche un warning
   * au chargement (rappel qu'il doit être réellement branché).
   */
  domain?: string;
  /**
   * Domaines PERSO du site (apex + variantes, ex.
   * `["sanadclean.fr", "www.sanadclean.fr"]`).
   *
   * Le PREMIER élément est le domaine CANONIQUE (apex) : il pilote
   * canonical/hreflang/OpenGraph/sitemap/JSON-LD (via `siteOrigin`, lib/urls.ts)
   * et reçoit les redirections 301 émises par le proxy depuis (a) les autres
   * variantes listées ici (ex. `www` → apex) et (b) le sous-domaine
   * `<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>` (consolidation des signaux SEO).
   *
   * ⚠️ Ne lister QUE des hosts RÉELLEMENT câblés (projet Vercel + DNS) : chaque
   * host listé est routé vers ce site par le proxy. Un host câblé mais ABSENT
   * d'ici (ex. `www` oublié) ne sera pas résolu. Régénère le manifeste
   * (`predev`/`prebuild`) après modification.
   *
   * Remplace l'ancien champ `domain` (mono-host), toujours accepté en repli.
   */
  customDomains?: string[];
  /**
   * Internationalisation. ABSENT = site monolingue (aucun préfixe d'URL, aucun
   * sélecteur de langue). PRÉSENT = la langue `default` reste sans préfixe ; les
   * autres langues sont préfixées (`/en`, `/ar`) et traduites via les fichiers
   * `config/sites/<slug>.<locale>.json`. `languages` inclut la langue par défaut.
   */
  i18n?: I18nConfig;
}

/** Déclaration des langues d'un site. `languages` contient `default`. */
export interface I18nConfig {
  /** Langue par défaut, servie sans préfixe d'URL (ex. "fr"). */
  default: string;
  /** Toutes les langues supportées, défaut inclus (ex. ["fr", "en", "ar"]). */
  languages: string[];
}
