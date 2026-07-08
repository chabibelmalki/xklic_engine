import type { SiteConfig, SocialLink } from "@/types/config";
import { waHref } from "@/lib/utils";

/** Réseau social résolu, prêt à l'affichage. */
export interface ResolvedSocial {
  /** Plateforme normalisée en minuscules (clé d'icône). */
  platform: string;
  /** Lien final (https, ou wa.me pour WhatsApp). */
  href: string;
  /** Libellé d'accessibilité. */
  label: string;
}

/** Libellé d'affichage d'une plateforme (nom propre, indépendant de la locale). */
const LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
  x: "X",
  google: "Google",
  googlemaps: "Google Maps",
};

export function socialLabel(platform: string): string {
  const p = platform.toLowerCase();
  return LABELS[p] ?? platform.charAt(0).toUpperCase() + platform.slice(1);
}

/**
 * Normalise l'URL d'un réseau. WhatsApp : accepte une URL (wa.me / api.whatsapp)
 * OU un numéro → lien `wa.me` correct (réutilise `waHref`). Autres : exige une
 * URL http(s) ; tolère un domaine sans protocole. `null` si invalide/vide.
 */
function normalizeUrl(link: SocialLink): string | null {
  const raw = (link.url ?? "").trim();
  if (!raw) return null;
  const platform = (link.platform ?? "").toLowerCase();
  const hasProto = /^https?:\/\//i.test(raw);
  if (platform === "whatsapp") {
    return hasProto ? raw : waHref(raw); // numéro → wa.me
  }
  if (hasProto) return raw;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;
  return null;
}

/** Réseaux valides du site, normalisés et prêts à afficher (ordre conservé). */
export function resolveSocials(config: SiteConfig): ResolvedSocial[] {
  const out: ResolvedSocial[] = [];
  for (const link of config.social ?? []) {
    if (!link?.platform) continue;
    const href = normalizeUrl(link);
    if (!href) continue;
    const platform = link.platform.toLowerCase();
    out.push({ platform, href, label: link.label ?? socialLabel(platform) });
  }
  return out;
}

/**
 * URLs pour le JSON-LD `sameAs` : PROFILS sociaux uniquement. On exclut WhatsApp
 * (canal de contact `wa.me`, pas un profil identifiant l'entreprise — déjà
 * couvert par `telephone`). `[]` si aucun profil → pas de `sameAs`.
 */
export function socialSameAs(config: SiteConfig): string[] {
  return resolveSocials(config)
    .filter((s) => s.platform !== "whatsapp")
    .map((s) => s.href);
}
