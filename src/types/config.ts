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

export interface Branding {
  /** URL du logo (object storage). */
  logo?: string;
  /** Texte alternatif du logo (sinon le nom de l'entreprise). */
  logoAlt?: string;
  /** Petite ligne sous le nom (ex. "Nettoyage · Nîmes"). */
  tagline?: string;
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
  /** Carte de prix flottante (variant "carte"). */
  card?: HeroCard;
  /** Badges de confiance avec icônes (sous les CTA). */
  trust?: HeroBadgeTrust[];
  badges?: string[];
  ctaPrimaire?: CTA;
  ctaSecondaire?: CTA;
  /** Affiche les icônes réseaux (config.social) dans le hero. Défaut : false. */
  showSocial?: boolean;
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

// --- zone ---
export type ZoneMode = "carte" | "liste" | "aucune";
export interface ZoneContent {
  titre?: string;
  intro?: string;
  villes?: string[];
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
 * - `devis` / `contact`    : modes historiques (rétro-compat, POST /api/devis).
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
  services: ServicesContent;
  etapes: EtapesContent;
  simulateur: SimulateurContent;
  tarifs: TarifsContent;
  serviceQuoteBuilder: ServiceQuoteBuilderContent;
  produits: ProduitsContent;
  boutique: BoutiqueContent;
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
  /** Exclut la page de la navigation principale (ex. mentions légales, devis). */
  navHidden?: boolean;
  /** Désindexe la page (robots noindex) — ex. pages légales. */
  noindex?: boolean;
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
  entreprise: Entreprise;
  seo: Seo;
  meta: Meta;
  /** Blocs de l'accueil (one-pager) — utilisé si `pages` est absent. */
  blocks: Block[];
  /** Pages du site (multi-page). Si présent, prime sur `blocks`. */
  pages?: PageConfig[];
  /** Acheminement des formulaires (e-mail / webhook). */
  forms?: FormsConfig;
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
