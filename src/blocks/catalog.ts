import type { ComponentType } from "react";
import type { BlockComponentProps } from "./types";
import { Hero } from "./Hero";
import { PageHero } from "./PageHero";
import { Contenu } from "./Contenu";
import { Services } from "./Services";
import { Etapes } from "./Etapes";
import { Simulateur } from "./Simulateur";
import { Tarifs } from "./Tarifs";
import { ServiceQuoteBuilder } from "./ServiceQuoteBuilder";
import { Produits } from "./Produits";
import { Boutique } from "./Boutique";
import { CatalogueLive } from "./CatalogueLive";
import { CommandeRecap } from "./CommandeRecap";
import { Zone } from "./Zone";
import { Faq } from "./Faq";
import { Galerie } from "./Galerie";
import { Avis } from "./Avis";
import { Cta } from "./Cta";
import { Contact } from "./Contact";
import { Unknown } from "./Unknown";

/**
 * REGISTRE des blocs de la famille HISTORIQUE (classic) : type -> composant.
 * C'est l'unique endroit à éditer pour ajouter un bloc (créer le composant,
 * l'importer, l'enregistrer ici). Référencé tel quel par la famille `classic`
 * (voir src/families/classic.ts).
 *
 * `getBlockComponent` renvoie le composant du type, ou `Unknown` (repli) si le
 * type n'est pas connu — un type inconnu ne casse jamais le rendu.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockRegistry: Record<string, ComponentType<BlockComponentProps<any>>> = {
  hero: Hero,
  pageHero: PageHero,
  contenu: Contenu,
  services: Services,
  etapes: Etapes,
  simulateur: Simulateur,
  tarifs: Tarifs,
  serviceQuoteBuilder: ServiceQuoteBuilder,
  produits: Produits,
  boutique: Boutique,
  catalogue: CatalogueLive,
  commandeRecap: CommandeRecap,
  zone: Zone,
  faq: Faq,
  galerie: Galerie,
  avis: Avis,
  cta: Cta,
  contact: Contact,
};

export function getBlockComponent(
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ComponentType<BlockComponentProps<any>> {
  return blockRegistry[type] ?? Unknown;
}

export function isKnownBlock(type: string): boolean {
  return type in blockRegistry;
}
