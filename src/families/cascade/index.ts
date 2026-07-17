import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { PageHero } from "./blocks/PageHero";
import { CascadeHeader } from "./chrome/Header";
import { CascadeFooter } from "./chrome/Footer";
import { CascadeFloatingActions } from "./chrome/FloatingActions";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack de cascade : rayons généreux, ombres douces).
// Même approche que `littoral` / `epure` / `signal` : l'énergie va sur les blocs
// d'identité (hero/services/etapes/cta/pageHero + chrome), le reste est couvert
// SANS aucun fallback `classic` (zéro page « fade »).
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Galerie } from "../editorial/blocks/Galerie";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";

/**
 * Famille CASCADE — « HYDRO-FRESH IMMERSIF DE JOUR » : grands dégradés bleu→vert
 * lumineux, cartes de VERRE GIVRÉ, transitions en VAGUES, SCEAU circulaire de
 * promesse (écho de la tagline client), pilules ultra-arrondies, ombres douces
 * lumineuses et gouttelettes. Display géométrique (Sora).
 *
 * Volontairement DISTINCTE de : `classic` (cartes sur mesh), `editorial` (serif,
 * photo plein cadre, filets), `littoral` (NUIT marine, serif, or), `prestige`
 * (near-black luxe), `epure`/`riso`/`signal` (angles durs, grille, encre) et
 * `foyer` (carnet manuscrit chaud). Couleurs 100 % tokens (branding.colors).
 */
export const CASCADE: TemplateFamily = {
  id: "cascade",
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
    Header: CascadeHeader,
    Footer: CascadeFooter,
    FloatingActions: CascadeFloatingActions,
  },
};
