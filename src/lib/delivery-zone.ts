// Appartenance d'une adresse à la zone de livraison d'un mode — MIROIR CLIENT de
// api/internal/store/zone.go du back-office. Sert uniquement à filtrer les
// communes proposées au checkout (confort d'UI). Le blocage réel est refait
// côté serveur (handleCheckout) : ne jamais s'y fier comme d'une garantie.

/** Un lieu résolu par l'autocomplétion géo (/api/shop/geo → Photon). */
export interface GeoPlace {
  type: string; // city | region | country
  label: string;
  sub?: string;
  country: string; // ISO2 (FR, IT…)
  country_name?: string;
  region?: string;
  city?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
  osm_id?: number;
}

/** Une règle d'appartenance (même forme que le back-office). */
export interface ZoneRule {
  type: "country" | "region" | "city" | "radius";
  label?: string;
  country?: string;
  region?: string;
  city?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
  radius_km?: number;
}

/** La zone d'un mode de livraison. */
export interface DeliveryZone {
  worldwide?: boolean;
  rules?: ZoneRule[];
}

/**
 * La zone impose-t-elle un périmètre ? Non si worldwide ou si aucune règle n'est
 * posée (config vide = pas de restriction — cohérent avec le back-office).
 */
export function isZoneRestricted(zone?: DeliveryZone | null): boolean {
  return !!zone && !zone.worldwide && Array.isArray(zone.rules) && zone.rules.length > 0;
}

/** Le lieu est-il dans la zone ? (worldwide OU au moins une règle correspond). */
export function isInZone(place: GeoPlace, zone?: DeliveryZone | null): boolean {
  if (!zone || zone.worldwide || !zone.rules || zone.rules.length === 0) return true;
  return zone.rules.some((r) => ruleMatches(r, place));
}

function ruleMatches(r: ZoneRule, p: GeoPlace): boolean {
  switch (r.type) {
    case "country":
      return eqCountry(r.country, p.country);
    case "region":
      if (r.country && !eqCountry(r.country, p.country)) return false;
      return fold(r.region) !== "" && fold(r.region) === fold(p.region);
    case "city":
      if (r.country && !eqCountry(r.country, p.country)) return false;
      return fold(r.city) !== "" && fold(r.city) === fold(p.city);
    case "radius": {
      const km = r.radius_km ?? 0;
      if (km <= 0 || (!r.lat && !r.lon) || (!p.lat && !p.lon)) return false;
      return haversineKm(r.lat ?? 0, r.lon ?? 0, p.lat ?? 0, p.lon ?? 0) <= km;
    }
    default:
      return false;
  }
}

function eqCountry(a?: string, b?: string): boolean {
  return !!a && a.trim().toUpperCase() === (b ?? "").trim().toUpperCase();
}

/** Normalise un nom de lieu : sans accents, minuscule, tirets/apostrophes → espace. */
function fold(s?: string): string {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diacritiques
    .toLowerCase()
    .replace(/['\-.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distance orthodromique en km (lat/lon en degrés). */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
