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
 */

const COMPANY_STATUTS = new Set<string>([
  "EURL",
  "SARL",
  "SAS",
  "SASU",
  "SA",
  "SNC",
  "SCI",
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
};

export function statutLabel(statut: StatutJuridique): string {
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
export function tvaMention(e: Entreprise): string {
  switch (e.tva.regime) {
    case "franchise":
      return "TVA non applicable, article 293 B du CGI.";
    case "exonere":
      return "Activité exonérée de TVA.";
    case "reel":
      return e.tva.numero
        ? `N° de TVA intracommunautaire : ${e.tva.numero}.`
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
 * L'hébergeur par défaut est Vercel (cible de déploiement).
 */
export function buildMentionsLegales(config: SiteConfig): MentionsLegales {
  const e = config.entreprise;
  const contact = findContact(config);
  const company = isCompany(e);

  // --- Éditeur ---
  const editeur: LegalRow[] = [{ label: "Dénomination", value: e.nom }];
  editeur.push({ label: "Forme juridique", value: statutLabel(e.statut) });

  if (company && e.capital !== undefined) {
    editeur.push({ label: "Capital social", value: formatEUR(e.capital) });
  }

  editeur.push({ label: "SIRET", value: formatSiret(e.siret) });
  editeur.push({ label: "SIREN", value: siretToSiren(e.siret) });

  if (e.ape) {
    editeur.push({
      label: "Code APE",
      value: e.apeLabel ? `${e.ape} — ${e.apeLabel}` : e.ape,
    });
  }

  if (company && e.rcs) {
    editeur.push({
      label: "RCS",
      value: `${siretToSiren(e.siret)} R.C.S. ${e.rcs}`,
    });
  }
  if (!company) {
    // Micro/EI : pas de RCS pour une activité non commerciale immatriculée ;
    // on précise le statut d'entrepreneur individuel.
    editeur.push({
      label: "Immatriculation",
      value:
        e.statut === "micro"
          ? "Entrepreneur individuel (micro-entreprise)"
          : "Entrepreneur individuel",
    });
  }

  if (e.siege) editeur.push({ label: "Siège social", value: e.siege });
  else if (contact?.adresse) editeur.push({ label: "Adresse", value: contact.adresse });

  editeur.push({ label: "TVA", value: tvaMention(e) });

  // --- Responsable / contact ---
  const responsable: LegalRow[] = [];
  if (e.dirigeant) {
    responsable.push({
      label: company ? "Représentant légal" : "Responsable",
      value: e.dirigeant,
    });
    responsable.push({ label: "Directeur de la publication", value: e.dirigeant });
  }
  if (contact?.telephone) responsable.push({ label: "Téléphone", value: contact.telephone });
  if (contact?.email) responsable.push({ label: "E-mail", value: contact.email });

  // --- Hébergeur ---
  const hebergeur: LegalRow[] = [
    { label: "Hébergeur", value: "Vercel Inc." },
    { label: "Adresse", value: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" },
    { label: "Site", value: "https://vercel.com" },
  ];

  const sections: LegalSection[] = [
    { title: "Éditeur du site", rows: editeur },
  ];
  if (responsable.length) sections.push({ title: "Responsable de la publication", rows: responsable });
  sections.push({ title: "Hébergement", rows: hebergeur });

  sections.push({
    title: "Propriété intellectuelle",
    rows: [],
    text: `L'ensemble des contenus (textes, images, logo, mise en page) présents sur ce site sont la propriété de ${e.nom}, sauf mention contraire, et sont protégés par le droit d'auteur. Toute reproduction sans autorisation est interdite.`,
  });

  sections.push({
    title: "Données personnelles",
    rows: [],
    text: `Les informations transmises via les formulaires ou moyens de contact sont utilisées uniquement pour répondre à votre demande et ne sont ni cédées ni revendues. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données${contact?.email ? `, exerçable par e-mail à ${contact.email}` : ""}.`,
  });

  return { title: "Mentions légales", sections };
}

/**
 * Politique de confidentialité (RGPD) générée depuis `config.entreprise` + bloc
 * contact. Texte volontairement générique (services à domicile / devis) ; le
 * responsable du traitement et le contact sont injectés depuis la config.
 */
export function buildConfidentialite(config: SiteConfig): MentionsLegales {
  const e = config.entreprise;
  const contact = findContact(config);
  const adresse = e.siege ?? contact?.adresse;
  const responsable = [legalName(e), adresse].filter(Boolean).join(", ");
  const email = contact?.email;

  const sections: LegalSection[] = [
    {
      title: "Responsable du traitement",
      rows: [],
      text: `Le responsable du traitement des données est ${responsable}.${
        email ? ` Contact : ${email}.` : ""
      }`,
    },
    {
      title: "Données collectées",
      rows: [],
      text: "Via les formulaires de devis et de contact, nous collectons uniquement les informations que vous nous transmettez : nom, coordonnées (téléphone, e-mail), adresse de la prestation et description de votre besoin.",
    },
    {
      title: "Finalité",
      rows: [],
      text: "Ces données servent exclusivement à traiter votre demande, établir un devis et organiser la prestation. Elles ne sont ni vendues ni cédées à des tiers à des fins commerciales.",
    },
    {
      title: "Durée de conservation",
      rows: [],
      text: "Les données sont conservées le temps nécessaire au traitement de votre demande et au respect de nos obligations légales (notamment comptables), puis supprimées.",
    },
    {
      title: "Vos droits",
      rows: [],
      text: `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition sur vos données.${
        email ? ` Pour l'exercer, écrivez-nous à ${email}.` : ""
      }`,
    },
    {
      title: "Cookies & mesure d'audience",
      rows: [],
      text: "Ce site n'utilise pas de cookies publicitaires. Une mesure d'audience respectueuse de la vie privée, sans cookie de suivi, peut être employée à des fins statistiques.",
    },
  ];

  return { title: "Politique de confidentialité", sections };
}
