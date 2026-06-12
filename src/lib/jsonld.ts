import type {
  SiteConfig,
  ContactContent,
  AvisContent,
  ZoneContent,
  FaqContent,
} from "@/types/config";
import { siteOrigin } from "@/lib/urls";
import { findBlock } from "@/lib/pages";

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
  const avis = block<AvisContent>(config, "avis");
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

  // Zone d'intervention -> areaServed
  if (zone && zoneBlock?.mode !== "aucune") {
    const villes = zone.villes ?? [config.seo.ville];
    business.areaServed = villes.map((v) => ({ "@type": "City", name: v }));
  } else {
    business.areaServed = { "@type": "City", name: config.seo.ville };
  }

  // Avis -> aggregateRating + review
  if (avis && avis.items.length) {
    if (avis.noteGlobale) {
      business.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: avis.noteGlobale,
        reviewCount: avis.nombre ?? avis.items.length,
        bestRating: 5,
      };
    }
    business.review = avis.items.slice(0, 10).map((a) => ({
      "@type": "Review",
      author: { "@type": "Person", name: a.auteur },
      reviewBody: a.texte,
      ...(a.note
        ? { reviewRating: { "@type": "Rating", ratingValue: a.note, bestRating: 5 } }
        : {}),
      ...(a.date ? { datePublished: a.date } : {}),
    }));
  }

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
