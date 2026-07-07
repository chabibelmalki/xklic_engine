import { blockRegistry } from "@/blocks/catalog";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingActions } from "@/components/layout/FloatingActions";
import type { TemplateFamily } from "./types";

/**
 * Famille HISTORIQUE. Référence les objets existants — le MÊME registre de blocs
 * que `catalog.ts` et le chrome actuel — donc `classic` rend strictement comme
 * avant l'introduction du seam. C'est le défaut de tous les packs.
 */
export const CLASSIC: TemplateFamily = {
  id: "classic",
  registry: blockRegistry,
  Chrome: { Header: SiteHeader, Footer: SiteFooter, FloatingActions },
};
