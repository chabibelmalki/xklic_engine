import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { PageHero } from "./blocks/PageHero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
// Blocs utilitaires : réutilisés depuis `editorial` (contrat identique, 100 %
// tokens → ils suivent la palette + le pack de littoral). Ils évitent tout
// retour au fallback `classic` (aucune page « fade »), tout en gardant l'énergie
// concentrée sur les blocs porteurs d'identité ci-dessus.
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Galerie } from "../editorial/blocks/Galerie";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";
import { LittoralHeader } from "./chrome/Header";
import { LittoralFooter } from "./chrome/Footer";
import { LittoralFloatingActions } from "./chrome/FloatingActions";

/**
 * Famille LITTORAL — CÔTIER PREMIUM immersif, taillée pour mb-nettoyage à partir
 * de son LOGO (la maison sur la mer au soleil levant). Grammaire à fort parti
 * pris : corps clair « bord de mer » (blanc / écume azur) PONCTUÉ de moments
 * NUIT MARINE pleine largeur (hero, page-hero, CTA, footer en navy `brand-800`)
 * avec SOLEIL doré et VAGUE signature. Registre OPPOSÉ à editorial (magazine
 * clair sobre), prestige (nuit near-black) et classic (cartes). 100 % SSR, zéro
 * motion lourd, contrastes AA.
 *
 * PÉRIMÈTRE : les blocs d'identité (hero, pageHero, services, etapes, cta) + le
 * chrome sont propres à la famille ; les blocs utilitaires (faq, zone, tarifs,
 * contenu, galerie, simulateur, contact) sont empruntés à `editorial` (mêmes
 * tokens) → couverture COMPLÈTE, aucun fallback `classic`. Couleurs 100 % tokens
 * (brand/accent = branding.colors du client).
 */
export const LITTORAL: TemplateFamily = {
  id: "littoral",
  registry: {
    hero: Hero,
    pageHero: PageHero,
    services: Services,
    etapes: Etapes,
    cta: Cta,
    faq: Faq,
    zone: Zone,
    tarifs: Tarifs,
    contenu: Contenu,
    galerie: Galerie,
    simulateur: Simulateur,
    contact: Contact,
  },
  Chrome: {
    Header: LittoralHeader,
    Footer: LittoralFooter,
    FloatingActions: LittoralFloatingActions,
  },
};
