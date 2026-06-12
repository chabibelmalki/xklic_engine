import type { ComponentType } from "react";
import type { BlockComponentProps } from "./types";
import { Hero } from "./Hero";
import { PageHero } from "./PageHero";
import { Services } from "./Services";
import { Etapes } from "./Etapes";
import { Simulateur } from "./Simulateur";
import { Tarifs } from "./Tarifs";
import { ServiceQuoteBuilder } from "./ServiceQuoteBuilder";
import { Zone } from "./Zone";
import { Faq } from "./Faq";
import { Galerie } from "./Galerie";
import { Avis } from "./Avis";
import { Cta } from "./Cta";
import { Contact } from "./Contact";
import { Unknown } from "./Unknown";

/**
 * REGISTRE des blocs : type -> composant. C'est l'unique endroit à éditer pour
 * ajouter un bloc (créer le composant, l'importer, l'enregistrer ici).
 *
 * `getBlockComponent` renvoie le composant du type, ou `Unknown` (repli) si le
 * type n'est pas connu — un type inconnu ne casse jamais le rendu.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, ComponentType<BlockComponentProps<any>>> = {
  hero: Hero,
  pageHero: PageHero,
  services: Services,
  etapes: Etapes,
  simulateur: Simulateur,
  tarifs: Tarifs,
  serviceQuoteBuilder: ServiceQuoteBuilder,
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
  return registry[type] ?? Unknown;
}

export function isKnownBlock(type: string): boolean {
  return type in registry;
}
