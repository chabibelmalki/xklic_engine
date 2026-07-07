import { cn } from "@/lib/utils";

/**
 * VAGUE — le motif SIGNATURE de la famille (repris du logo : la maison sur la
 * mer). SVG 100 % statique (SSR, zéro JS, zéro motion), `preserveAspectRatio`
 * "none" pour s'étirer sur toute la largeur. Trois crêtes superposées à
 * opacités décroissantes → profondeur marine.
 *
 * Emploi : posée en bas d'un bloc immersif NAVY (`Hero`, `PageHero`), remplie de
 * la couleur du fond CLAIR qui suit (`fill`, défaut `--bg` = blanc) : la « mousse
 * de rivage » remonte dans la nuit marine → transition mer ↔ rivage sans couture.
 * Couleur pilotée par les tokens client (aucune couleur en dur).
 */
export function LittoralWave({
  fill = "var(--bg)",
  className,
}: {
  /** Couleur de la crête = fond clair suivant (token). Défaut `--bg`. */
  fill?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 -mb-px", className)}
      style={{ color: fill }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[52px] w-full sm:h-[88px]"
        role="presentation"
      >
        {/* Crête lointaine (mousse pâle) */}
        <path
          d="M0,64 C240,26 420,102 720,72 C1020,42 1200,104 1440,66 L1440,120 L0,120 Z"
          fill="currentColor"
          opacity="0.35"
        />
        {/* Crête médiane */}
        <path
          d="M0,86 C260,52 460,116 720,90 C1000,62 1220,116 1440,84 L1440,120 L0,120 Z"
          fill="currentColor"
          opacity="0.65"
        />
        {/* Rivage (plein) */}
        <path
          d="M0,104 C280,84 500,122 720,106 C980,88 1200,122 1440,102 L1440,120 L0,120 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
