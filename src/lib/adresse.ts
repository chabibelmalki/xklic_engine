import type { SiteConfig, ContactContent } from "@/types/config";
import { isCompany } from "@/lib/legal";

/**
 * Adresse à AFFICHER (bloc contact, footers, JSON-LD, llms.txt).
 *
 * Historiquement chaque config devait répéter l'adresse dans `contact.adresse`,
 * alors que `entreprise.siege` la porte déjà pour les mentions légales : les
 * dossiers qui oubliaient la clé n'affichaient tout simplement aucune adresse,
 * sans erreur (cf. clean-habitat-pro, ab-pro-service, hygifrance).
 *
 * Règles :
 * - `contact.adresse` renseignée => elle gagne. C'est un acte DÉLIBÉRÉ : on ne
 *   l'écrit que si l'adresse est un lieu qui reçoit du public (boutique, atelier,
 *   agence) ou un simple libellé de zone ;
 * - `contact.adresse: false` => masquage explicite, aucun repli ;
 * - sinon => repli sur `entreprise.siege` UNIQUEMENT pour une personne MORALE
 *   (société : SARL, SAS, EURL, SRL belge…), dont le siège est de toute façon
 *   public au RCS / à la BCE.
 *
 * Pour une personne PHYSIQUE (EI, micro-entrepreneur / auto-entrepreneur, et
 * leurs équivalents belges), le siège est presque toujours le DOMICILE du
 * dirigeant : jamais de repli automatique. Le défaut est donc silencieux et sûr,
 * y compris pour les futurs dossiers où la clé serait oubliée. La loi n'y perd
 * rien : l'adresse reste affichée là où elle est obligatoire, en mentions
 * légales (`buildMentionsLegales`), insensible à cette règle d'affichage.
 */
export function resolveAdresse(
  config: SiteConfig,
  contact?: ContactContent,
): string | undefined {
  if (contact?.adresse === false) return undefined;
  const explicite = contact?.adresse?.trim();
  if (explicite) return explicite;
  const e = config.entreprise;
  if (!e || !isCompany(e)) return undefined;
  return e.siege?.trim() || undefined;
}
