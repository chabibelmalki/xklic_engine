import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { PageHero } from "./blocks/PageHero";
import { Services } from "./blocks/Services";
import { Avis } from "./blocks/Avis";
import { Contenu } from "./blocks/Contenu";
import { Etapes } from "./blocks/Etapes";
import { Faq } from "./blocks/Faq";
import { Cta } from "./blocks/Cta";
import { Zone } from "./blocks/Zone";
import { PrestigeHeader } from "./chrome/Header";
import { PrestigeFooter } from "./chrome/Footer";
import { PrestigeFloatingActions } from "./chrome/FloatingActions";

/**
 * Famille PRESTIGE — luxe SOMBRE immersif (taxi de luxe / chauffeur classe). Fond
 * near-black teinté par la palette client, accents métalliques dorés, typo
 * display massive (Bodoni), bandes pleine largeur, gros chiffres, filets fins,
 * numéro de réservation géant. La grammaire OPPOSÉE à editorial (clair/magazine)
 * et à classic (cartes) : c'est le pari « caractère fort » qui casse la
 * ressemblance. 100 % rendu serveur, zéro motion lourd.
 *
 * PÉRIMÈTRE : blocs porteurs d'identité (hero, pageHero, services, avis, contenu,
 * etapes, faq, zone, cta) + le chrome.
 * Tous les autres types retombent sur `classic` via `getFamilyBlock`. Couleurs
 * via tokens client (brand/accent) + noir/blanc d'infrastructure de lecture.
 */
export const PRESTIGE: TemplateFamily = {
  id: "prestige",
  registry: {
    hero: Hero,
    pageHero: PageHero,
    services: Services,
    avis: Avis,
    contenu: Contenu,
    etapes: Etapes,
    faq: Faq,
    zone: Zone,
    cta: Cta,
  },
  Chrome: {
    Header: PrestigeHeader,
    Footer: PrestigeFooter,
    FloatingActions: PrestigeFloatingActions,
  },
};
