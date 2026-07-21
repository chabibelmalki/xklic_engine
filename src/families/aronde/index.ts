import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { PageHero } from "./blocks/PageHero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { Galerie } from "./blocks/Galerie";
// Blocs utilitaires : réutilisés depuis `editorial` (contrat identique, 100 %
// tokens → ils suivent la palette + le pack d'aronde). Même approche que
// `littoral` / `foyer` : l'énergie va sur les blocs d'identité (hero/pageHero/
// services/etapes/cta) + le chrome, le reste est couvert SANS fallback `classic`.
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";
import { ArondeHeader } from "./chrome/Header";
import { ArondeFooter } from "./chrome/Footer";
import { EditorialFloatingActions } from "../editorial/chrome/FloatingActions";

/**
 * Famille ARONDE — MENUISERIE D'ASSEMBLAGE, taillée pour un ébéniste/poseur.
 * Grammaire à fort parti pris : corps clair « établi crème » ponctué de pans de
 * bois ESPRESSO pleine largeur (hero, pageHero, cta, footer en `brand-800`)
 * assemblés au corps par une QUEUE D'ARONDE signature ; panneaux de services à
 * COUPE D'ONGLET (coin taillé 45°), index chiffrés slab au fil de coupe, mortaises
 * carrées pour les étapes, slab serif robuste (Zilla Slab), grain de bois discret.
 * Registre OPPOSÉ à editorial (magazine), littoral (côtier navy), foyer (carnet),
 * epure/signal (grille technique), riso (sérigraphie), cascade (verre d'eau).
 * 100 % SSR, contrastes AA.
 *
 * PÉRIMÈTRE : blocs d'identité (hero, pageHero, services, etapes, cta) + chrome
 * (Header/Footer) propres ; blocs utilitaires (faq, zone, tarifs, contenu,
 * galerie, simulateur, contact) + FloatingActions empruntés à `editorial` (mêmes
 * tokens) → couverture COMPLÈTE, aucun fallback `classic`. Couleurs 100 % tokens
 * (brand/accent = branding.colors du client).
 */
export const ARONDE: TemplateFamily = {
  id: "aronde",
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
    Header: ArondeHeader,
    Footer: ArondeFooter,
    FloatingActions: EditorialFloatingActions,
  },
};
