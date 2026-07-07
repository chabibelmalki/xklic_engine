import type { ComponentProps, ComponentType } from "react";
import type { BlockComponentProps } from "@/blocks/types";
import type { SiteHeader } from "@/components/layout/SiteHeader";
import type { SiteFooter } from "@/components/layout/SiteFooter";
import type { FloatingActions } from "@/components/layout/FloatingActions";

/**
 * FAMILLE DE TEMPLATE — un jeu de composants (blocs + chrome) sélectionné par le
 * pack du tenant (`StylePack.family`, défaut "classic"). Deux familles rendent la
 * MÊME config de contenu (schéma agnostique de présentation) avec des layouts et
 * une matière visuelle radicalement différents.
 *
 * Le seam ne pose QUE la plomberie : la famille `classic` référence les composants
 * actuels (rendu inchangé). Une famille alternative fournira ses propres blocs et
 * son propre chrome ; les types de blocs qu'elle ne définit pas retombent sur
 * `classic` (voir `getFamilyBlock`).
 */

/** Composant de bloc : même contrat que le registre historique (catalog.ts). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FamilyBlock = ComponentType<BlockComponentProps<any>>;

/**
 * Chrome (habillage hors blocs) d'une famille. Les props sont dérivées des
 * composants actuels : le contrat reste EXACTEMENT celui d'aujourd'hui, donc une
 * future famille doit l'honorer (mêmes props que SiteHeader/SiteFooter/…).
 */
export interface FamilyChrome {
  Header: ComponentType<ComponentProps<typeof SiteHeader>>;
  Footer: ComponentType<ComponentProps<typeof SiteFooter>>;
  FloatingActions: ComponentType<ComponentProps<typeof FloatingActions>>;
}

export interface TemplateFamily {
  id: string;
  /**
   * Registre partiel type→composant. `Partial` : une famille peut n'implémenter
   * qu'un sous-ensemble de blocs ; le reste retombe sur `classic` puis `Unknown`.
   */
  registry: Partial<Record<string, FamilyBlock>>;
  Chrome: FamilyChrome;
}
