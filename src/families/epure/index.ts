import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { EpureHeader } from "./chrome/Header";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack d'épure). Même approche que la famille
// `littoral` : l'énergie va sur les blocs d'identité (hero/services/cta + header),
// le reste est couvert sans aucun fallback `classic` (zéro page « fade »).
import { PageHero } from "../editorial/blocks/PageHero";
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Galerie } from "../editorial/blocks/Galerie";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";
import { EditorialFooter } from "../editorial/chrome/Footer";
import { EditorialFloatingActions } from "../editorial/chrome/FloatingActions";

/**
 * Famille ÉPURE — CLAIRE, aérée, à FILETS : hero à carte SANS image de fond,
 * services en grille hairline, CTA encadré, header à nav centrée sous un liseré
 * de marque. Registre net et éditorial, pensé pour un rendu moderne, élégant et
 * professionnel — volontairement DISTINCT de `classic` (cartes sur mesh, utilisé
 * par sanadclean/casa-clean-provence), `editorial` (photo plein cadre),
 * `littoral` (nuit marine) et `prestige` (nuit near-black). Couleurs 100 %
 * tokens (brand/accent = branding.colors du client).
 */
export const EPURE: TemplateFamily = {
  id: "epure",
  registry: {
    hero: Hero,
    services: Services,
    cta: Cta,
    pageHero: PageHero,
    etapes: Etapes,
    faq: Faq,
    zone: Zone,
    tarifs: Tarifs,
    contenu: Contenu,
    galerie: Galerie,
    simulateur: Simulateur,
    contact: Contact,
  },
  Chrome: {
    Header: EpureHeader,
    Footer: EditorialFooter,
    FloatingActions: EditorialFloatingActions,
  },
};
