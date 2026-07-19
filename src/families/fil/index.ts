import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { PageHero } from "./blocks/PageHero";
import { Services } from "./blocks/Services";
import { Etapes } from "./blocks/Etapes";
import { Cta } from "./blocks/Cta";
// Blocs utilitaires : réutilisés depuis `editorial` (contrat identique, 100 %
// tokens → ils suivent la palette + le pack de fil). Même approche
// qu'`aronde` / `littoral` : l'énergie va sur les blocs d'identité (hero/
// pageHero/services/etapes/cta) + le chrome, le reste est couvert SANS
// fallback `classic`.
import { Faq } from "../editorial/blocks/Faq";
import { Zone } from "../editorial/blocks/Zone";
import { Tarifs } from "../editorial/blocks/Tarifs";
import { Contenu } from "../editorial/blocks/Contenu";
import { Galerie } from "../editorial/blocks/Galerie";
import { Simulateur } from "../editorial/blocks/Simulateur";
import { Contact } from "../editorial/blocks/Contact";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FilFooter } from "./chrome/Footer";
import { EditorialFloatingActions } from "../editorial/chrome/FloatingActions";

/**
 * Famille FIL — ATELIER DE COUTURE / CONFECTION, née pour un atelier de
 * confection mais liée à AUCUN métier (règle du parc). Grammaire à fort parti
 * pris : le FIL COUSU comme motif conducteur — hero plein cadre dont la photo
 * est RE-TEINTÉE aux couleurs de la marque (duotone `mix-blend-color`), titre
 * ÉCLATÉ relié par une couture SVG qui se trace au chargement, timeline des
 * étapes cousue au scroll (le fil noue chaque étape à son passage), coutures
 * pointillées + nœuds entre les pans d'encre et le corps clair « papier
 * patron », cartes-échantillons épinglées, serif Fraunces. Registre OPPOSÉ à
 * aronde (bois), riso (encre d'imprimerie), foyer (carnet), littoral/cascade
 * (eau), editorial (magazine). SSR complet, contrastes AA.
 *
 * PÉRIMÈTRE : blocs d'identité (hero, pageHero, services, etapes, cta) +
 * Footer propres ; Header = `SiteHeader` partagé (il porte déjà l'overlay
 * immersif `headerOverlay` dont le hero plein cadre a besoin) ; blocs
 * utilitaires + FloatingActions empruntés à `editorial` (mêmes tokens) →
 * couverture COMPLÈTE, aucun fallback `classic`. Couleurs 100 % tokens
 * (brand/accent = branding.colors du client).
 */
export const FIL: TemplateFamily = {
  id: "fil",
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
    Header: SiteHeader,
    Footer: FilFooter,
    FloatingActions: EditorialFloatingActions,
  },
};
