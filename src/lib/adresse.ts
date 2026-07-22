import type { SiteConfig, ContactContent } from "@/types/config";

/**
 * Adresse à AFFICHER (bloc contact, footers, JSON-LD, llms.txt).
 *
 * Historiquement chaque config devait répéter l'adresse dans `contact.adresse`,
 * alors que `entreprise.siege` la porte déjà pour les mentions légales : les
 * dossiers qui oubliaient la clé n'affichaient tout simplement aucune adresse,
 * sans erreur (cf. clean-habitat-pro, ab-pro-service, hygifrance).
 *
 * Règles :
 * - `contact.adresse` renseignée => elle gagne (elle peut être plus « publique »
 *   que le siège : accroche de zone, agence, adresse d'accueil…) ;
 * - `contact.adresse: false` => masquage EXPLICITE, aucun repli sur le siège
 *   (clients sans local recevant du public : taxis, prestations à domicile…) ;
 * - sinon => repli sur `entreprise.siege`.
 */
export function resolveAdresse(
  config: SiteConfig,
  contact?: ContactContent,
): string | undefined {
  if (contact?.adresse === false) return undefined;
  const explicite = contact?.adresse?.trim();
  if (explicite) return explicite;
  return config.entreprise?.siege?.trim() || undefined;
}
