import type {
  SiteConfig,
  Entreprise,
  StatutJuridique,
  ContactContent,
} from "@/types/config";
import { formatEUR } from "@/lib/utils";
import { findBlock } from "@/lib/pages";

/**
 * Générateur de mentions légales — branché sur le STATUT.
 *
 * Un artisan en société (SARL/SAS) et un auto-entrepreneur (micro/EI) passent
 * par le MÊME moteur : seule la config change, et les mentions sont justes dans
 * tous les cas. La forme de société ajoute capital / RCS / dirigeant / siège ;
 * la micro/EI s'en tient à SIRET + mention TVA.
 *
 * i18n : les pages légales sont TRADUITES selon la langue de rendu (`locale`).
 * `fr` est la langue de référence (sortie identique à l'historique) ; les autres
 * langues (`nl`…) retombent sur `fr` pour un libellé non traduit. Voir `DICT`.
 */

// ----------------------------------------------------------------------------
// i18n
// ----------------------------------------------------------------------------

type Lang = "fr" | "nl";

/** Réduit un `locale` (ex. "nl", "nl-BE") à une langue supportée par ce module. */
function lang(locale?: string): Lang {
  return (locale ?? "fr").toLowerCase().startsWith("nl") ? "nl" : "fr";
}

/** Dictionnaire des libellés/titres des pages légales. `fr` = référence. */
const DICT = {
  fr: {
    mentionsTitle: "Mentions légales",
    confidentialiteTitle: "Politique de confidentialité",
    secEditeur: "Éditeur du site",
    secResponsable: "Responsable de la publication",
    secHebergement: "Hébergement",
    secPI: "Propriété intellectuelle",
    secDonnees: "Données personnelles",
    denomination: "Dénomination",
    forme: "Forme juridique",
    capital: "Capital social",
    ape: "Code APE",
    rcs: "RCS",
    immatriculation: "Immatriculation",
    numEntreprise: "Numéro d'entreprise",
    siege: "Siège social",
    adresse: "Adresse",
    tva: "TVA",
    representant: "Représentant légal",
    responsable: "Responsable",
    directeurPub: "Directeur de la publication",
    telephone: "Téléphone",
    email: "E-mail",
    hebergeur: "Hébergeur",
    site: "Site",
    immatMicro: "Entrepreneur individuel (micro-entreprise)",
    immatEI: "Entrepreneur individuel",
    piText: (nom: string) =>
      `L'ensemble des contenus (textes, images, logo, mise en page) présents sur ce site sont la propriété de ${nom}, sauf mention contraire, et sont protégés par le droit d'auteur. Toute reproduction sans autorisation est interdite.`,
    donneesText: (email?: string) =>
      `Les informations transmises via les formulaires ou moyens de contact sont utilisées uniquement pour répondre à votre demande et ne sont ni cédées ni revendues. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données${email ? `, exerçable par e-mail à ${email}` : ""}.`,
    // Confidentialité
    confResponsableTitle: "Responsable du traitement",
    confResponsableText: (responsable: string, email?: string) =>
      `Le responsable du traitement des données est ${responsable}.${email ? ` Contact : ${email}.` : ""}`,
    confCollecteTitle: "Données collectées",
    confCollecteText:
      "Via les formulaires de devis et de contact, nous collectons uniquement les informations que vous nous transmettez : nom, coordonnées (téléphone, e-mail), adresse de la prestation et description de votre besoin.",
    confFinaliteTitle: "Finalité",
    confFinaliteText:
      "Ces données servent exclusivement à traiter votre demande, établir un devis et organiser la prestation. Elles ne sont ni vendues ni cédées à des tiers à des fins commerciales.",
    confDureeTitle: "Durée de conservation",
    confDureeText:
      "Les données sont conservées le temps nécessaire au traitement de votre demande et au respect de nos obligations légales (notamment comptables), puis supprimées.",
    confDroitsTitle: "Vos droits",
    confDroitsText: (email?: string) =>
      `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition sur vos données.${email ? ` Pour l'exercer, écrivez-nous à ${email}.` : ""}`,
    confCookiesTitle: "Cookies & mesure d'audience",
    confCookiesText:
      "Ce site n'utilise pas de cookies publicitaires. Une mesure d'audience respectueuse de la vie privée, sans cookie de suivi, peut être employée à des fins statistiques.",
  },
  nl: {
    mentionsTitle: "Wettelijke vermeldingen",
    confidentialiteTitle: "Privacybeleid",
    secEditeur: "Uitgever van de site",
    secResponsable: "Verantwoordelijke voor de publicatie",
    secHebergement: "Hosting",
    secPI: "Intellectuele eigendom",
    secDonnees: "Persoonsgegevens",
    denomination: "Benaming",
    forme: "Rechtsvorm",
    capital: "Maatschappelijk kapitaal",
    ape: "NACE-code",
    rcs: "RCS",
    immatriculation: "Inschrijving",
    numEntreprise: "Ondernemingsnummer",
    siege: "Maatschappelijke zetel",
    adresse: "Adres",
    tva: "Btw",
    representant: "Wettelijke vertegenwoordiger",
    responsable: "Verantwoordelijke",
    directeurPub: "Verantwoordelijke uitgever",
    telephone: "Telefoon",
    email: "E-mail",
    hebergeur: "Host",
    site: "Website",
    immatMicro: "Zelfstandige",
    immatEI: "Zelfstandige",
    piText: (nom: string) =>
      `Alle inhoud (teksten, afbeeldingen, logo, opmaak) op deze site is eigendom van ${nom}, behoudens andersluidende vermelding, en wordt beschermd door het auteursrecht. Elke reproductie zonder toestemming is verboden.`,
    donneesText: (email?: string) =>
      `De gegevens die u via de formulieren of contactmiddelen bezorgt, worden uitsluitend gebruikt om op uw vraag te antwoorden en worden niet doorgegeven of doorverkocht. Conform de AVG beschikt u over een recht op inzage, verbetering en verwijdering van uw gegevens${email ? `, uit te oefenen per e-mail op ${email}` : ""}.`,
    // Confidentialité
    confResponsableTitle: "Verwerkingsverantwoordelijke",
    confResponsableText: (responsable: string, email?: string) =>
      `De verwerkingsverantwoordelijke van de gegevens is ${responsable}.${email ? ` Contact: ${email}.` : ""}`,
    confCollecteTitle: "Verzamelde gegevens",
    confCollecteText:
      "Via de offerte- en contactformulieren verzamelen wij enkel de informatie die u ons bezorgt: naam, contactgegevens (telefoon, e-mail), adres van de opdracht en beschrijving van uw behoefte.",
    confFinaliteTitle: "Doeleinde",
    confFinaliteText:
      "Deze gegevens dienen uitsluitend om uw aanvraag te behandelen, een offerte op te stellen en de opdracht te organiseren. Ze worden niet verkocht of aan derden doorgegeven voor commerciële doeleinden.",
    confDureeTitle: "Bewaartermijn",
    confDureeText:
      "De gegevens worden bewaard zolang dat nodig is om uw aanvraag te behandelen en onze wettelijke (met name boekhoudkundige) verplichtingen na te leven, en worden daarna verwijderd.",
    confDroitsTitle: "Uw rechten",
    confDroitsText: (email?: string) =>
      `Conform de AVG beschikt u over een recht op inzage, verbetering, verwijdering en verzet met betrekking tot uw gegevens.${email ? ` Schrijf ons daarvoor op ${email}.` : ""}`,
    confCookiesTitle: "Cookies & bezoekersmeting",
    confCookiesText:
      "Deze site gebruikt geen reclamecookies. Een privacyvriendelijke bezoekersmeting, zonder trackingcookie, kan voor statistische doeleinden worden ingezet.",
  },
} as const;

/** Titre localisé de la page mentions légales (utilisé aussi par le SEO). */
export function mentionsLegalesTitle(locale?: string): string {
  return DICT[lang(locale)].mentionsTitle;
}
/** Titre localisé de la page confidentialité (utilisé aussi par le SEO). */
export function confidentialiteTitle(locale?: string): string {
  return DICT[lang(locale)].confidentialiteTitle;
}

// ----------------------------------------------------------------------------
// Statuts juridiques
// ----------------------------------------------------------------------------

const COMPANY_STATUTS = new Set<string>([
  "EURL",
  "SARL",
  "SAS",
  "SASU",
  "SA",
  "SNC",
  "SCI",
  // Formes de sociétés belges (BCE/KBO) :
  "SRL", // Société à responsabilité limitée (ex-SPRL)
  "SPRL",
  "SC", // Société coopérative
  "SComm", // Société en commandite
]);

const STATUT_LABELS: Record<string, string> = {
  EI: "Entreprise individuelle (EI)",
  micro: "Entreprise individuelle — régime micro-entrepreneur (auto-entrepreneur)",
  EURL: "Entreprise unipersonnelle à responsabilité limitée (EURL)",
  SARL: "Société à responsabilité limitée (SARL)",
  SAS: "Société par actions simplifiée (SAS)",
  SASU: "Société par actions simplifiée unipersonnelle (SASU)",
  SA: "Société anonyme (SA)",
  SNC: "Société en nom collectif (SNC)",
  SCI: "Société civile immobilière (SCI)",
  association: "Association régie par la loi du 1er juillet 1901",
  // Formes belges :
  SRL: "Société à responsabilité limitée (SRL)",
  SPRL: "Société privée à responsabilité limitée (SPRL)",
  SC: "Société coopérative (SC)",
  SComm: "Société en commandite (SComm)",
};

/** Libellés de statut en néerlandais (formes belges). Fallback → libellé FR. */
const STATUT_LABELS_NL: Record<string, string> = {
  SRL: "Besloten vennootschap (bv)",
  SPRL: "Besloten vennootschap met beperkte aansprakelijkheid (bvba)",
  SA: "Naamloze vennootschap (nv)",
  SC: "Coöperatieve vennootschap (cv)",
  SComm: "Commanditaire vennootschap (commv)",
  EI: "Eenmanszaak",
  micro: "Eenmanszaak",
};

export function statutLabel(statut: StatutJuridique, locale?: string): string {
  if (lang(locale) === "nl" && STATUT_LABELS_NL[statut]) return STATUT_LABELS_NL[statut];
  return STATUT_LABELS[statut] ?? String(statut);
}

/** Sigle court du statut, pour la raison sociale en pied de page ("(EI)", "(SARL)"…). */
const STATUT_SHORT: Record<string, string> = {
  EI: "EI",
  micro: "micro-entrepreneur",
};
export function statutShort(statut: StatutJuridique): string {
  return STATUT_SHORT[statut] ?? String(statut);
}

/**
 * Raison sociale complète façon pied de page :
 * "SANAD CLEAN — Souad Tazya (EI)". Sans dirigeant, on s'en tient au nom.
 */
export function legalName(e: Entreprise): string {
  return e.dirigeant ? `${e.nom} — ${e.dirigeant} (${statutShort(e.statut)})` : e.nom;
}

export function isCompany(e: Entreprise): boolean {
  return COMPANY_STATUTS.has(e.statut) || e.capital !== undefined;
}

/** Mention TVA conforme selon le régime. */
export function tvaMention(e: Entreprise, locale?: string): string {
  const nl = lang(locale) === "nl";
  switch (e.tva.regime) {
    case "franchise":
      return nl
        ? "Kleineondernemingsregeling — btw niet van toepassing."
        : "TVA non applicable, article 293 B du CGI.";
    case "exonere":
      return nl ? "Van btw vrijgestelde activiteit." : "Activité exonérée de TVA.";
    case "reel":
      return e.tva.numero
        ? nl
          ? `Btw-nummer: ${e.tva.numero}.`
          : `N° de TVA intracommunautaire : ${e.tva.numero}.`
        : nl
          ? "Btw-plichtig."
          : "Assujetti à la TVA.";
    default:
      return "";
  }
}

/** Formate un SIRET en groupes lisibles : 000 000 000 00000. */
export function formatSiret(siret: string): string {
  const d = siret.replace(/\s/g, "");
  if (d.length !== 14) return siret;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

/** SIREN = 9 premiers chiffres du SIRET. */
export function siretToSiren(siret: string): string {
  const d = siret.replace(/\s/g, "");
  return d.length >= 9 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)}` : d;
}

export interface LegalRow {
  label: string;
  value: string;
}
export interface LegalSection {
  title: string;
  rows: LegalRow[];
  /** Paragraphe libre (RGPD, propriété intellectuelle…). */
  text?: string;
}
export interface MentionsLegales {
  title: string;
  sections: LegalSection[];
}

/** Récupère les coordonnées depuis un éventuel bloc `contact` (toutes pages). */
function findContact(config: SiteConfig): ContactContent | null {
  return findBlock<ContactContent>(config, "contact")?.content ?? null;
}

/**
 * Construit les mentions légales complètes depuis `config.entreprise`.
 * L'hébergeur par défaut est Vercel (cible de déploiement). Traduit selon `locale`.
 */
export function buildMentionsLegales(config: SiteConfig, locale?: string): MentionsLegales {
  const t = DICT[lang(locale)];
  const e = config.entreprise;
  const contact = findContact(config);
  const company = isCompany(e);

  // --- Éditeur ---
  const editeur: LegalRow[] = [{ label: t.denomination, value: e.nom }];
  editeur.push({ label: t.forme, value: statutLabel(e.statut, locale) });

  if (company && e.capital !== undefined) {
    editeur.push({ label: t.capital, value: formatEUR(e.capital) });
  }

  // Identifiant d'entreprise : SIRET/SIREN pour la France (14 chiffres) ;
  // sinon (n° BCE belge à 10 chiffres, etc.) on affiche l'identifiant tel quel
  // sous un libellé neutre, sans dériver un « SIREN » tronqué et faux.
  if (e.siret.replace(/\s/g, "").length === 14) {
    editeur.push({ label: "SIRET", value: formatSiret(e.siret) });
    editeur.push({ label: "SIREN", value: siretToSiren(e.siret) });
  } else {
    editeur.push({ label: t.numEntreprise, value: e.siret });
  }

  if (e.ape) {
    editeur.push({
      label: t.ape,
      value: e.apeLabel ? `${e.ape} — ${e.apeLabel}` : e.ape,
    });
  }

  if (company && e.rcs) {
    editeur.push({
      label: t.rcs,
      value: `${siretToSiren(e.siret)} R.C.S. ${e.rcs}`,
    });
  }
  if (!company) {
    // Micro/EI : pas de RCS pour une activité non commerciale immatriculée ;
    // on précise le statut d'entrepreneur individuel.
    editeur.push({
      label: t.immatriculation,
      value: e.statut === "micro" ? t.immatMicro : t.immatEI,
    });
  }

  if (e.siege) editeur.push({ label: t.siege, value: e.siege });
  else if (contact?.adresse) editeur.push({ label: t.adresse, value: contact.adresse });

  editeur.push({ label: t.tva, value: tvaMention(e, locale) });

  // --- Responsable / contact ---
  const responsable: LegalRow[] = [];
  if (e.dirigeant) {
    responsable.push({
      label: company ? t.representant : t.responsable,
      value: e.dirigeant,
    });
    responsable.push({ label: t.directeurPub, value: e.dirigeant });
  }
  if (contact?.telephone) responsable.push({ label: t.telephone, value: contact.telephone });
  if (contact?.email) responsable.push({ label: t.email, value: contact.email });

  // --- Hébergeur ---
  const hebergeur: LegalRow[] = [
    { label: t.hebergeur, value: "Vercel Inc." },
    { label: t.adresse, value: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" },
    { label: t.site, value: "https://vercel.com" },
  ];

  const sections: LegalSection[] = [
    { title: t.secEditeur, rows: editeur },
  ];
  if (responsable.length) sections.push({ title: t.secResponsable, rows: responsable });
  sections.push({ title: t.secHebergement, rows: hebergeur });

  sections.push({
    title: t.secPI,
    rows: [],
    text: t.piText(e.nom),
  });

  sections.push({
    title: t.secDonnees,
    rows: [],
    text: t.donneesText(contact?.email),
  });

  return { title: t.mentionsTitle, sections };
}

/**
 * Politique de confidentialité (RGPD) générée depuis `config.entreprise` + bloc
 * contact. Texte volontairement générique (services à domicile / devis) ; le
 * responsable du traitement et le contact sont injectés depuis la config.
 * Traduit selon `locale`.
 */
export function buildConfidentialite(config: SiteConfig, locale?: string): MentionsLegales {
  const t = DICT[lang(locale)];
  const e = config.entreprise;
  const contact = findContact(config);
  const adresse = e.siege ?? contact?.adresse;
  const responsable = [legalName(e), adresse].filter(Boolean).join(", ");
  const email = contact?.email;

  const sections: LegalSection[] = [
    {
      title: t.confResponsableTitle,
      rows: [],
      text: t.confResponsableText(responsable, email),
    },
    {
      title: t.confCollecteTitle,
      rows: [],
      text: t.confCollecteText,
    },
    {
      title: t.confFinaliteTitle,
      rows: [],
      text: t.confFinaliteText,
    },
    {
      title: t.confDureeTitle,
      rows: [],
      text: t.confDureeText,
    },
    {
      title: t.confDroitsTitle,
      rows: [],
      text: t.confDroitsText(email),
    },
    {
      title: t.confCookiesTitle,
      rows: [],
      text: t.confCookiesText,
    },
  ];

  return { title: t.confidentialiteTitle, sections };
}
