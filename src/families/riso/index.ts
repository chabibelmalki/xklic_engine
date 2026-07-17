import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { PageHero } from "./blocks/PageHero";
import { RisoHeader } from "./chrome/Header";
import { RisoFooter } from "./chrome/Footer";
import { RisoFloatingActions } from "./chrome/FloatingActions";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack de riso : rayons à 0, ombres neutralisées).
// Même approche que `littoral` / `signal` / `epure` : l'énergie va sur les blocs
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
 * Famille RISO — ATELIER DE SÉRIGRAPHIE. La page est une affiche imprimée à
 * l'encre : aplats saturés pleine largeur (le fond n'est PAS du papier blanc),
 * surimpression `multiply` de deux encres qui fabriquent la troisième couleur,
 * trame de points visible, décalage de repérage assumé sur les titres, barre de
 * contrôle couleur en guise de filet de chrome, mires de repérage en marge.
 * Toute donnée (prix, horaires, index) est en mono d'imprimeur ; les planches
 * sont indexées par LETTRES (A/B/C), les services forment un DAMIER encre/papier
 * sans une seule carte, et les photos passent en DUOTONE (désaturées + fondues
 * dans l'aplat) au lieu d'être voilées de noir.
 *
 * Volontairement DISTINCTE de `classic` (cartes flottantes), `editorial` (photo
 * plein cadre + filets), `epure` (ombres dures + marquee), `littoral` (nuit
 * marine + vague), `prestige` (near-black + or), `signal` (bento à hairlines) et
 * `foyer` (carnet manuscrit). Couleurs 100 % tokens (= `branding.colors`).
 */
export const RISO: TemplateFamily = {
  id: "riso",
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
    Header: RisoHeader,
    Footer: RisoFooter,
    FloatingActions: RisoFloatingActions,
  },
};
