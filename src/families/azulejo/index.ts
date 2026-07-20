import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { PageHero } from "./blocks/PageHero";
import { AzulejoHeader } from "./chrome/Header";
import { AzulejoFooter } from "./chrome/Footer";
import { AzulejoFloatingActions } from "./chrome/FloatingActions";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack d'azulejo : coins doux, ombres discrètes).
// Même approche que `riso` / `littoral` / `signal` : l'énergie va sur les blocs
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
 * Famille AZULEJO — MUR DE FAÏENCE. La page est un pan de carreaux émaillés :
 * fonds clairs (blanc cassé) tramés de joints fins, tomettes à reflet d'émail et
 * coins arrondis doux, frises de losanges (motif azulejo) en guise de filet de
 * chrome et de séparateur, motif quatre-feuilles en filigrane, titres en serif
 * haute (DM Serif Display). Le relief vient de l'émail, jamais d'une ombre dure.
 *
 * Volontairement DISTINCTE de `riso` (encre saturée + trame + décalage),
 * `classic` (cartes flottantes), `editorial` (photo plein cadre + filets),
 * `epure` (grotesque XXL + marquee), `signal` (bento à hairlines), `foyer`
 * (carnet manuscrit), `cascade` (dégradés hydro). Couleurs 100 % tokens
 * (= palette du thème / `branding.colors`), calme et clair (pas saturé).
 */
export const AZULEJO: TemplateFamily = {
  id: "azulejo",
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
    Header: AzulejoHeader,
    Footer: AzulejoFooter,
    FloatingActions: AzulejoFloatingActions,
  },
};
