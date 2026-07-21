import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { PageHero } from "./blocks/PageHero";
import { EclatHeader } from "./chrome/Header";
import { EclatFooter } from "./chrome/Footer";
import { EclatFloatingActions } from "./chrome/FloatingActions";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack d'éclat : coins doux, filets fins, zéro ombre
// lourde). Même approche que `riso` / `azulejo` : l'énergie va sur les blocs
// d'identité + le chrome, le reste est couvert SANS fallback `classic`.
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Galerie } from "../editorial/blocks/Galerie";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";

/**
 * Famille ÉCLAT — MINIMALISME LUMINEUX. La page est claire de bout en bout :
 * fonds blancs, beaucoup d'air, structure en FILETS fins (jamais d'aplats lourds
 * ni d'ombres dures), une seule signature — l'ÉTINCELLE — et une serif éditoriale
 * à caractère (Instrument Serif) mariée à un sans géométrique net (Manrope). La
 * couleur ne vient qu'en touches.
 *
 * Volontairement DISTINCTE de `riso` (encre saturée), `azulejo` (carreaux),
 * `clair-frais` (arrondi générique, pack classic), `editorial` (photo plein cadre
 * + serif traditionnelle), `signal` (bento technique). Simple, clair, propre —
 * avec du caractère. Couleurs 100 % tokens.
 */
export const ECLAT: TemplateFamily = {
  id: "eclat",
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
    Header: EclatHeader,
    Footer: EclatFooter,
    FloatingActions: EclatFloatingActions,
  },
};
