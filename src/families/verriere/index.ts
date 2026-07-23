import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { PageHero } from "./blocks/PageHero";
import { VerriereHeader } from "./chrome/Header";
import { VerriereFooter } from "./chrome/Footer";
import { VerriereFloatingActions } from "./chrome/FloatingActions";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack de verriere : coins doux, ombres de verre).
// Même approche qu'azulejo / riso / signal : l'énergie va sur les blocs
// d'identité (hero/services/etapes/cta/pageHero + chrome), le reste est couvert
// SANS aucun fallback `classic`.
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Galerie } from "../editorial/blocks/Galerie";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";

/**
 * Famille VERRIÈRE — ART NOUVEAU NANCÉIEN (École de Nancy). La page est une
 * VERRIÈRE : panneaux de vitrail à sommet cintré sertis d'un plomb vert et d'un
 * filet de laiton, résille de cames sur les photos, médaillons de ferronnerie,
 * volutes de garde-corps aux angles des panneaux profonds, ombelles végétales en
 * filigrane — et le COUP DE FOUET, la courbe-signature Art nouveau, qui se trace
 * au scroll en CSS natif (scroll-driven, zéro JS, inerte en mouvement réduit).
 *
 * Volontairement DISTINCTE d'azulejo (losanges droits, céramique plate),
 * `fil` (couture, photo duotone), `aronde` (bois, angles nets et coupe d'onglet),
 * `cascade` (dégradés hydro, verre givré), `foyer` (carnet manuscrit), `eclat`
 * (minimalisme en filets), `escale` (afficheur split-flap). Ici tout est COURBE,
 * VÉGÉTAL et SERTI. Couleurs 100 % tokens (= palette du thème / `branding.colors`).
 */
export const VERRIERE: TemplateFamily = {
  id: "verriere",
  registry: {
    hero: Hero,
    services: Services,
    etapes: Etapes,
    cta: Cta,
    pageHero: PageHero,
    faq: Faq,
    zone: Zone,
    tarifs: Tarifs,
    contenu: Contenu,
    galerie: Galerie,
    simulateur: Simulateur,
    contact: Contact,
  },
  Chrome: {
    Header: VerriereHeader,
    Footer: VerriereFooter,
    FloatingActions: VerriereFloatingActions,
  },
};
