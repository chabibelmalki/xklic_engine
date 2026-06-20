import type {
  SiteConfig,
  ContactContent,
  ZoneContent,
  FaqContent,
  PageHeroContent,
} from "@/types/config";
import { siteOrigin } from "@/lib/urls";
import { findBlock, type ResolvedPage } from "@/lib/pages";
import { socialSameAs } from "@/lib/social";

/**
 * JSON-LD par site ET par page. Le `@type` du LocalBusiness vient de
 * `seo.schemaType` (HousekeepingService, AutoRepair, Bakery, HairSalon,
 * Restaurant…) : aucun type métier codé en dur. NAP + ville + zone alimentent
 * le graphe site-wide. Quand une `page` est fournie, la FAQPage est tirée de la
 * page COURANTE et un `Service` est émis si la page est marquée `service`.
 */

function block<T>(config: SiteConfig, type: string): T | null {
  return findBlock<T>(config, type)?.content ?? null;
}

function heroImage(config: SiteConfig): string | undefined {
  const url = findBlock<{ image?: { url?: string } }>(config, "hero")?.content?.image?.url;
  return url ?? config.branding.logo;
}

/** Premier bloc d'un type donné sur la PAGE fournie (et non tout le site). */
function pageBlock<T>(page: ResolvedPage, type: string): T | null {
  for (const b of page.blocks) {
    if (b.type === type) return (b.content ?? null) as T | null;
  }
  return null;
}

/**
 * `areaServed` partagé par LocalBusiness et Service : les villes de la zone
 * (mode ≠ "aucune"), sinon la ville unique du SEO.
 */
function areaServed(config: SiteConfig): object {
  const zoneBlock = findBlock<ZoneContent>(config, "zone");
  const zone = zoneBlock?.content ?? undefined;
  if (zone && zoneBlock?.mode !== "aucune") {
    const villes = zone.villes ?? [config.seo.ville];
    return villes.map((v) => ({ "@type": "City", name: v }));
  }
  return { "@type": "City", name: config.seo.ville };
}

/** Construit le tableau d'objets JSON-LD (LocalBusiness + Service + FAQPage). */
export function buildJsonLd(config: SiteConfig, page?: ResolvedPage): object[] {
  const e = config.entreprise;
  const contact = block<ContactContent>(config, "contact");
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

  // Zone d'intervention -> areaServed (helper partagé avec Service)
  business.areaServed = areaServed(config);

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

  // WebSite (page d'accueil uniquement) : principal signal du « nom du site »
  // affiché par Google dans les résultats. Sans lui, Google retombe sur le
  // domaine (ex. « xklic » pour un sous-domaine de xklic.com). Posé sur l'accueil
  // (`page` absent = rendu accueil par défaut), là où Google l'attend.
  if (!page || page.isHome) {
    graph.unshift({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: e.nom,
      url: `${origin}/`,
    });
  }

  // Service (par page) : émis quand la page courante est marquée `service`.
  if (page?.service) {
    const svc = page.service;
    const hero = pageBlock<PageHeroContent>(page, "pageHero");
    const name = svc.name || hero?.titre || page.label;
    const description = svc.description || hero?.intro;

    const service: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Service",
      provider: { "@id": `${origin}/#business` },
      areaServed: areaServed(config),
    };
    if (name) service.name = name;
    if (description) service.description = description;
    if (svc.serviceType) service.serviceType = svc.serviceType;

    // priceFrom : nombre => Offer/PriceSpecification ; texte non vide => « sur devis » (pas d'offers).
    if (typeof svc.priceFrom === "number") {
      service.offers = {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: svc.priceFrom,
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: svc.priceFrom,
          priceCurrency: "EUR",
        },
        availability: "https://schema.org/InStock",
      };
    }

    graph.push(service);
  }

  // FAQPage : la PAGE courante prime ; sinon repli site-wide (accueil / one-pager).
  const faq = (page && pageBlock<FaqContent>(page, "faq")) || block<FaqContent>(config, "faq");
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
