import { Unknown } from "@/blocks/Unknown";
import { CLASSIC } from "./classic";
import { EDITORIAL } from "./editorial";
import { PRESTIGE } from "./prestige";
import type { FamilyBlock, TemplateFamily } from "./types";

export type { TemplateFamily, FamilyChrome, FamilyBlock } from "./types";

/**
 * Registre des familles. Le rendu sélectionne une famille via `StylePack.family`
 * (défaut "classic"). Une famille inconnue/absente retombe sur `classic` sans
 * casser — même contrat que `resolvePack`/`resolveTheme`.
 */
const FAMILIES: Record<string, TemplateFamily> = {
  classic: CLASSIC,
  editorial: EDITORIAL,
  prestige: PRESTIGE,
};

export const DEFAULT_FAMILY = CLASSIC;

/** Renvoie la famille à appliquer (défaut `classic` si absente/inconnue). */
export function getFamily(id?: string): TemplateFamily {
  return (id && FAMILIES[id]) || CLASSIC;
}

/**
 * Composant du bloc `type` dans la famille donnée. FALLBACK : si la famille ne
 * définit pas ce type, on retombe sur `classic`, puis sur `Unknown` (dégradation
 * propre). Pour `classic`, `family.registry === blockRegistry`, donc le résultat
 * est identique à l'ancien `getBlockComponent(type)`.
 */
export function getFamilyBlock(family: TemplateFamily, type: string): FamilyBlock {
  return family.registry[type] ?? CLASSIC.registry[type] ?? Unknown;
}
