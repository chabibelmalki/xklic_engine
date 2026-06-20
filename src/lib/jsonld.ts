import type {
  SiteConfig,
  ContactContent,
  ZoneContent,
  FaqContent,
} from "@/types/config";
import { siteOrigin } from "@/lib/urls";
import { findBlock } from "@/lib/pages";
import { socialSameAs } from "@/lib/social";

/**
 * JSON-LD par site. Le `@type` du LocalBusiness vient de `seo.schemaType`
 * (HousekeepingService, AutoRepair, Bakery, HairSalon, Restaurant…) : aucun
 * type métier codé en dur. NAP + ville + avis + zone alimentent le graphe.
 * Les blocs sont cherchés sur l'ENSEMBLE des pages (multi-page).
 */

function block<T>(config: SiteConfig, type: string): T | null {
  return findBlock<T>(config, type)?.content ?? null;
}

function heroImage(config: SiteConfig): string | undefined {
  const url = findBlock<{ image?: { url?: string } }>(config, "hero")?.content?.image?.url;
  return url ?? config.branding.logo;
}

/** Construit le tableau d'objets JSON-LD (LocalBusiness + FAQPage). */
export function buildJsonLd(config: SiteConfig): object[] {
  const e = config.entreprise;
  const contact = block<ContactContent>(config, "contact");
  const zoneBlock = findBlock<ZoneContent>(config, "zone");
  const zone = zoneBlock?.content ?? undefined;
  const faq = block<FaqContent>(config, "faq");
  const origin = siteOrigin(config);

  const business: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": config.seo.schemaType || "LocalBusiness",
    "@id": `${origin}/#business`,
    name: e.nom,
    url: origin,
    image: heroImage(config),
    logo: config.branding.logo,
    address: {
      "@type": "PostalAddress",
      addressLocality: config.seo.ville,
      addressCountry: "FR",
      ...(contact?.adresse ? { streetAddress: contact.adresse } : {}),
    },
  };

  if (contact?.telephone) business.telephone = contact.telephone;
  if (contact?.email) business.email = contact.email;
  if (e.siret) business.vatID = e.tva.numero;
  if (e.siret) business.identifier = e.siret;

  // Profils sociaux du client -> sameAs (renforce l'entité dans le Knowledge Graph).
  const sameAs = socialSameAs(config);
  if (sameAs.length) business.sameAs = sameAs;

  // Zone d'intervention -> areaServed
  if (zone && zoneBlock?.mode !== "aucune") {
    const villes = zone.villes ?? [config.seo.ville];
    business.areaServed = villes.map((v) => ({ "@type": "City", name: v }));
  } else {
    business.areaServed = { "@type": "City", name: config.seo.ville };
  }

  // Avis volontairement ABSENTS du JSON-LD : depuis 2019 Google ignore les avis
  // « self-serving » (sur l'entreprise, hébergés sur son propre site, type
  // LocalBusiness/Organization) -> aucune étoile affichée, et Search Console
  // remonte « Type d'objet non valide pour <parent_node> » + « avis multiples
  // sans aggregateRating ». Les vraies étoiles viennent du profil Google Business.
  // Les témoignages restent affichés via le bloc Avis (UI), pas en structured data.

  // Horaires
  if (contact?.horaires?.length) {
    business.openingHours = contact.horaires.map((h) => `${h.jour} ${h.heures}`);
  }

  const graph: object[] = [business];

  // FAQPage
  if (faq && faq.items.length) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.items.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.reponse },
      })),
    });
  }

  return graph;
}
