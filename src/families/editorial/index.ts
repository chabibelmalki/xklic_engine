import type { TemplateFamily } from "../types";
import { Hero } from "./blocks/Hero";
import { Services } from "./blocks/Services";
import { Cta } from "./blocks/Cta";
import { EditorialHeader } from "./chrome/Header";
import { EditorialFooter } from "./chrome/Footer";
import { EditorialFloatingActions } from "./chrome/FloatingActions";

/**
 * Famille EDITORIAL — premium sobre, magazine : hero plein cadre à surimpression,
 * sections plates à filets (pas de cartes/ombres), images nettes, grande typo,
 * beaucoup d'air. 100 % rendu serveur, zéro motion lourd.
 *
 * PÉRIMÈTRE : seuls les blocs porteurs d'identité (hero, services, cta) + le
 * chrome sont fournis. Tous les autres types retombent sur `classic` via
 * `getFamilyBlock` (fallback). Couleurs 100 % tokens → suit la palette client.
 */
export const EDITORIAL: TemplateFamily = {
  id: "editorial",
  registry: {
    hero: Hero,
    services: Services,
    cta: Cta,
  },
  Chrome: {
    Header: EditorialHeader,
    Footer: EditorialFooter,
    FloatingActions: EditorialFloatingActions,
  },
};
