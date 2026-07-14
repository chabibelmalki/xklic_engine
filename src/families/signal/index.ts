import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { PageHero } from "./blocks/PageHero";
import { SignalHeader } from "./chrome/Header";
import { SignalFooter } from "./chrome/Footer";
import { SignalFloatingActions } from "./chrome/FloatingActions";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack de signal). Même approche que `littoral` /
// `epure` : l'énergie va sur les blocs d'identité (hero/services/etapes/cta/
// pageHero + chrome), le reste est couvert SANS aucun fallback `classic`.
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Galerie } from "../editorial/blocks/Galerie";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";

/**
 * Famille SIGNAL — CLAIRE mais STRUCTURÉE, éditoriale-technique : grille de fins
 * filets, étiquettes d'index (carré d'accent + majuscules espacées), titres
 * adossés à une arête de marque (« spine »), services en GRILLE bento soudée par
 * des hairlines, étapes en bande de procédure, CTA en bande de marque pleine
 * largeur, chrome souligné d'un filet de marque. Registre net et opératoire,
 * volontairement DISTINCT de `classic` (cartes sur mesh), `editorial` (photo
 * plein cadre), `epure` (carte-prix arrondie, nav centrée), `littoral` (nuit
 * marine) et `prestige` (near-black). Couleurs 100 % tokens (brand/accent =
 * branding.colors du client).
 */
export const SIGNAL: TemplateFamily = {
  id: "signal",
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
    Header: SignalHeader,
    Footer: SignalFooter,
    FloatingActions: SignalFloatingActions,
  },
};
