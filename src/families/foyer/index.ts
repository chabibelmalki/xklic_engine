import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
import { PageHero } from "./blocks/PageHero";
import { FoyerHeader } from "./chrome/Header";
// Blocs utilitaires empruntés à `editorial` (contrat identique, 100 % tokens →
// ils suivent la palette + le pack de foyer). Même approche que `littoral` /
// `epure` / `signal` : l'énergie va sur les blocs d'identité (hero/services/
// etapes/cta/pageHero + header), le reste est couvert SANS fallback `classic`.
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
 * Famille FOYER — « carnet de maison » CHALEUREUX et tactile : voix MANUSCRITE
 * en signature (script Caveat pour les kickers, façon note « by Maman »), titres
 * en serif éditorial chaud (Newsreader), cartes-recette arrondies à liseré
 * COUTURE pointillé, étapes en CHECK-LIST cochée, CTA en carton d'invitation,
 * header à filet-couture. Registre domestique, personnel, rassurant —
 * volontairement DISTINCT de `classic` (clinique, sanadclean), `editorial`
 * (photo plein-bord), `epure`/`signal` (angles durs / grille technique),
 * `littoral`/`prestige` (immersif sombre). Couleurs 100 % tokens
 * (brand/accent = branding.colors du client).
 */
export const FOYER: TemplateFamily = {
  id: "foyer",
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
    Header: FoyerHeader,
    Footer: EditorialFooter,
    FloatingActions: EditorialFloatingActions,
  },
};
