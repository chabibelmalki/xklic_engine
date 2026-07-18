import type { CSSProperties } from "react";

/**
 * COUPE D'ONGLET (miter) — le coin haut-droit taillé à 45°, comme deux tasseaux
 * assemblés en cadre. Rendu via `clip-path` (aucune image, suit le pack). Sert
 * aux panneaux de services, images et cartes de la famille aronde → grammaire
 * d'assemblage cohérente. `px` = longueur de la coupe.
 */
export function miterTR(px = 16): CSSProperties {
  return {
    clipPath: `polygon(0 0, calc(100% - ${px}px) 0, 100% ${px}px, 100% 100%, 0 100%)`,
  };
}
