import type { SiteConfig, CTA } from "@/types/config";
import { resolvePages } from "@/lib/pages";

/**
 * Règle UNIFIÉE des CTA de hero (accueil + pages intérieures), valable pour TOUS
 * les sites — sans uniformiser leur identité.
 *
 *  - Le CTA PRIMAIRE (devis / RDV / commande / essai…) reste 100 % défini par le
 *    site : c'est là que vit la personnalité du client. Le moteur n'y touche pas.
 *  - Le CTA SECONDAIRE ne doit JAMAIS être un canal de contact direct
 *    (tél / WhatsApp / e-mail) : ils sont déjà dans le header + le bouton flottant
 *    et saturent le hero. Un secondaire « exploration » choisi par le site
 *    (« Voir les créations / forfaits / formules »…) est CONSERVÉ tel quel. Un
 *    secondaire « contact » est remplacé par un lien d'exploration DÉRIVÉ des
 *    pages du site (libellé propre à CHAQUE site → pas de hero clone). Absent,
 *    on n'invente rien (un seul bouton, c'est très bien).
 */

/** href = canal de contact direct (tél / e-mail / SMS / WhatsApp) ? */
export function isContactChannelHref(href: string): boolean {
  return /^(tel:|mailto:|sms:)/i.test(href.trim()) || /wa\.me|whatsapp/i.test(href);
}

// Pages « exploration » candidates au secondaire dérivé, par ordre de priorité.
const EXPLORE_PRIORITY = [
  "tarifs",
  "forfaits",
  "prestations",
  "services",
  "offres",
  "boutique",
  "produits",
  "galerie",
  "creations",
  "realisations",
];

/** Lien d'exploration dérivé des pages du site (libellé localisé de la page). */
export function deriveExploreCta(config: SiteConfig): CTA | undefined {
  const pages = resolvePages(config).filter((p) => !p.isHome && !p.navHidden && !p.noindex);
  for (const slug of EXPLORE_PRIORITY) {
    const page = pages.find((p) => p.slug === slug);
    if (page) return { label: page.label, href: page.path };
  }
  return undefined;
}

/**
 * CTA secondaire à afficher dans un hero, selon la règle ci-dessus.
 * Garde le choix de l'auteur s'il n'est pas un canal de contact ; sinon dérive.
 */
export function resolveHeroSecondary(config: SiteConfig, secondary?: CTA): CTA | undefined {
  if (!secondary) return undefined;
  if (!isContactChannelHref(secondary.href)) return secondary;
  return deriveExploreCta(config);
}
