import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { PageHero } from "./blocks/PageHero";
import { EscaleHeader } from "./chrome/Header";
import { EscaleFooter } from "./chrome/Footer";
import { EscaleFloatingActions } from "./chrome/FloatingActions";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack d'escale : angles nets, ombres basses,
// display Bebas). Même approche que `azulejo` / `riso` / `signal` : l'énergie va
// sur les blocs d'identité (hero/services/etapes/cta/pageHero + chrome), le
// reste est couvert SANS aucun fallback `classic`.
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Galerie } from "../editorial/blocks/Galerie";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";

/**
 * Famille ESCALE — SALLE DES OPÉRATIONS INTERNATIONALES. La page est un centre
 * de coordination ouvert en continu : panneaux de NUIT (brand-800) parcourus du
 * GRATICULE DE MÉRIDIENS (le quadrillage d'un globe), données composées en MONO
 * d'afficheur (chiffres tabulaires, capitales espacées), intitulés posés dans des
 * VOLETS split-flap, prestations éditées en ORDRES DE MISSION (talon + couture
 * perforée + corps), et un voyant vert « en service » qui bat lentement.
 *
 * Volontairement DISTINCTE de tout le parc : ni cartes flottantes (`classic`),
 * ni faïence émaillée (`azulejo`), ni encre sérigraphiée (`riso`), ni pans de
 * bois (`aronde`), ni couture (`fil`), ni dégradés hydro (`cascade`), ni nuit
 * dorée de luxe (`prestige`). Couleurs 100 % tokens (palette du thème /
 * `branding.colors`) — le vert d'accent y joue le rôle de voyant opérationnel.
 */
export const ESCALE: TemplateFamily = {
  id: "escale",
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
    Header: EscaleHeader,
    Footer: EscaleFooter,
    FloatingActions: EscaleFloatingActions,
  },
};
