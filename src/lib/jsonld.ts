import type {
  SiteConfig,
  ContactContent,
  ZoneContent,
  FaqContent,
  PageHeroContent,
} from "@/types/config";
import { siteOrigin } from "@/lib/urls";
import { findBlock, type ResolvedPage } from "@/lib/pages";
import { allZoneVilles } from "@/lib/zone";
import { socialSameAs, resolveSocials } from "@/lib/social";
import { resolveAdresse } from "@/lib/adresse";

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

/**
 * Rend une URL d'asset ABSOLUE sur l'origin du site. Indispensable en JSON-LD :
 * contrairement à `og:image` (rendu absolu par `metadataBase` de Next), les URL
 * d'un script JSON-LD ne sont relatives à rien — Google IGNORE un `logo` relatif
 * (consignes « Logo » : URL absolue exigée). Une URL déjà absolue est conservée.
 */
function absUrl(origin: string, url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith("/") ? `${origin}${url}` : `${origin}/${url}`;
}

/** Premier bloc d'un type donné sur la PAGE fournie (et non tout le site). */
function pageBlock<T>(page: ResolvedPage, type: string): T | null {
  for (const b of page.blocks) {
    if (b.type === type) return (b.content ?? null) as T | null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Normalisation schema.org des horaires et de l'adresse (le config porte des
// chaînes d'AFFICHAGE françaises ; Google exige les formats normalisés, sinon
// la donnée est ignorée — constaté sur toute la flotte).
// ---------------------------------------------------------------------------

const DAY_MAP: Record<string, string> = {
  lun: "Mo", lundi: "Mo",
  mar: "Tu", mardi: "Tu",
  mer: "We", mercredi: "We",
  jeu: "Th", jeudi: "Th",
  ven: "Fr", vendredi: "Fr",
  sam: "Sa", samedi: "Sa",
  dim: "Su", dimanche: "Su",
};

function schemaDay(raw: string): string | null {
  return DAY_MAP[raw.trim().toLowerCase().replace(/\.$/, "")] ?? null;
}

/** "7h" → "07:00", "8h30" → "08:30". `null` si imprononçable. */
function schemaTime(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2})\s*[h:]\s*(\d{2})?$/i);
  if (!m) return null;
  const h = Number(m[1]);
  if (h > 24) return null;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
}

/**
 * Convertit UNE ligne d'horaires du bloc contact (`{jour, heures}` en français
 * d'affichage) vers le format `openingHours` de schema.org (« Mo-Sa
 * 08:30-18:00 »). Ligne non parsable → `null` (on OMET : une valeur invalide
 * est ignorée par Google et pollue les tests de résultats enrichis).
 */
function schemaOpeningHours(jour: string, heures: string): string | null {
  const parts = jour.split(/[–—-]|au|à/i).map(schemaDay);
  if (!parts.length || parts.some((d) => d === null)) return null;
  const days = parts.length > 1 ? `${parts[0]}-${parts[parts.length - 1]}` : parts[0];
  const h = heures.trim();
  // « 24h/24 » (± « 7j/7 ») → jour seul = ouvert toute la journée (convention schema.org).
  if (/24\s*h?\s*\/\s*24/i.test(h)) return days as string;
  if (/ferm/i.test(h)) return null;
  const times = h.split(/[–—-]/).map(schemaTime);
  if (times.length !== 2 || times.some((t) => t === null)) return null;
  return `${days} ${times[0]}-${times[1]}`;
}

/**
 * PostalAddress depuis la chaîne d'affichage `contact.adresse` : code postal
 * extrait s'il est présent ; `streetAddress` UNIQUEMENT si la chaîne ressemble
 * à une vraie voie postale (numéro + type de voie). Les accroches marketing
 * (« 22 communes autour de Marseille ») ou les libellés de zone (« Gigean
 * (34770) · Hérault ») ne sont PAS des adresses : pour un service-area
 * business, `addressLocality` suffit.
 */
function postalAddress(config: SiteConfig, adresse?: string): Record<string, unknown> {
  const out: Record<string, unknown> = {
    "@type": "PostalAddress",
    addressLocality: config.seo.ville,
    addressCountry: "FR",
  };
  if (!adresse) return out;
  const cp = adresse.match(/\b(\d{5})\b/);
  if (cp) out.postalCode = cp[1];
  const isVoie =
    /^\s*\d+\s*(bis|ter)?\s*,?\s+(rue|av(enue)?\.?|bd\.?|boulevard|pl(ace)?\.?|chemin|ch\.?|impasse|imp\.?|all[ée]e|all\.?|route|rte\.?|quai|cours|traverse|passage|square|lot(issement)?|z[ai]c?\b)/i.test(
      adresse,
    );
  if (isVoie) out.streetAddress = adresse;
  return out;
}

/**
 * `areaServed` partagé par LocalBusiness et Service : les villes de la zone
 * (mode ≠ "aucune"), sinon la ville unique du SEO.
 */
function areaServed(config: SiteConfig): object {
  const zoneBlock = findBlock<ZoneContent>(config, "zone");
  const zone = zoneBlock?.content ?? undefined;
  if (zone && zoneBlock?.mode !== "aucune") {
    const villes = allZoneVilles(zone);
    const list = villes.length ? villes : [config.seo.ville];
    return list.map((v) => ({ "@type": "City", name: v }));
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
    image: absUrl(origin, heroImage(config)),
    logo: absUrl(origin, config.branding.logo),
    address: postalAddress(config, resolveAdresse(config, contact ?? undefined)),
  };

  if (contact?.telephone) business.telephone = contact.telephone;
  if (contact?.email) business.email = contact.email;
  if (e.siret) business.vatID = e.tva.numero;
  if (e.siret) business.identifier = e.siret;

  // Coordonnées GPS exactes (issues de la fiche Google) -> GeoCoordinates (SEO local).
  if (config.geo) {
    business.geo = {
      "@type": "GeoCoordinates",
      latitude: config.geo.lat,
      longitude: config.geo.lng,
    };
  }

  // Profils sociaux du client -> sameAs (renforce l'entité dans le Knowledge Graph).
  const sameAs = socialSameAs(config);
  if (sameAs.length) business.sameAs = sameAs;

  // Fiche Google (lien réseau « google ») -> hasMap : relie l'entité du site à sa
  // fiche Google Business / Maps (signal local fort, source des vraies étoiles).
  const googleProfile = resolveSocials(config).find((s) => s.platform === "google");
  if (googleProfile) {
    business.hasMap = googleProfile.href;
  } else if (config.googleReviewUrl) {
    // Repli : le lien « laissez un avis » (g.page/r/…/review) pointe la même
    // fiche — on retire le segment /review pour relier l'entité à son profil.
    business.hasMap = config.googleReviewUrl.replace(/\/review\/?$/, "");
  }

  // Zone d'intervention -> areaServed (helper partagé avec Service)
  business.areaServed = areaServed(config);

  // Avis volontairement ABSENTS du JSON-LD : depuis 2019 Google ignore les avis
  // « self-serving » (sur l'entreprise, hébergés sur son propre site, type
  // LocalBusiness/Organization) -> aucune étoile affichée, et Search Console
  // remonte « Type d'objet non valide pour <parent_node> » + « avis multiples
  // sans aggregateRating ». Les vraies étoiles viennent du profil Google Business.
  // Les témoignages restent affichés via le bloc Avis (UI), pas en structured data.

  // Horaires — normalisés au format schema.org (« Mo-Sa 08:30-18:00 ») ; les
  // lignes non parsables sont omises (une chaîne d'affichage brute est ignorée
  // par Google). L'UI, elle, continue d'afficher les chaînes du config.
  if (contact?.horaires?.length) {
    const hours = contact.horaires
      .map((h) => schemaOpeningHours(h.jour, h.heures))
      .filter((v): v is string => v !== null);
    if (hours.length) business.openingHours = hours;
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

  // BreadcrumbList (par page) : le fil d'ariane du pageHero en données
  // structurées -> rich result Google (chemin affiché sous le titre) et signal
  // de hiérarchie qui renforce les silos de pages services. Tiré de la page
  // courante ; ignoré si moins de 2 niveaux (un seul item n'a pas d'intérêt).
  const heroBreadcrumb = page ? pageBlock<PageHeroContent>(page, "pageHero")?.breadcrumb : null;
  if (heroBreadcrumb && heroBreadcrumb.length > 1) {
    const abs = (href: string) => (href === "/" ? `${origin}/` : `${origin}${href}`);
    graph.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: heroBreadcrumb.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.label,
        // Le dernier maillon (page courante) n'a pas de href -> on pointe sa propre URL.
        item: abs(b.href ?? page!.path),
      })),
    });
  }

  // FAQPage : UNIQUEMENT la FAQ de la page courante (guidelines Google : le
  // contenu balisé doit être VISIBLE sur la page). L'ancien repli site-wide
  // dupliquait la FAQ de l'accueil en structured data sur ~12 URLs par site.
  // Le repli global ne sert plus qu'aux one-pagers rendus sans `page`.
  const faq = page ? pageBlock<FaqContent>(page, "faq") : block<FaqContent>(config, "faq");
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
