import { cn } from "@/lib/utils";

/**
 * QUEUE D'ARONDE — le motif SIGNATURE de la famille (l'assemblage roi de la
 * menuiserie : deux pièces qui s'emboîtent sans vis). SVG 100 % statique (SSR,
 * zéro JS, zéro motion), motif tuilé en coordonnées pixel (`patternUnits
 * userSpaceOnUse`) : les angles du tenon restent NETS quelle que soit la largeur
 * (contrairement à un `preserveAspectRatio="none"` qui les écraserait).
 *
 * Emploi : posée à la jointure entre un bloc SOMBRE (espresso `brand-800`) et le
 * corps clair. Remplie de la couleur du fond CLAIR (`fill`, défaut `--bg`) : les
 * tenons clairs mordent dans le bois sombre → transition assemblée sans couture.
 *  - `edge="bottom"` (défaut) : base en bas, tenons vers le haut (pied d'un hero).
 *  - `edge="top"` : base en haut, tenons vers le bas (tête d'une bande CTA).
 * Chaque emploi passe un `variant` (id de motif unique par instance, SSR-safe —
 * aucun `Math.random`). Couleur 100 % token.
 */
export function ArondeDovetail({
  variant,
  edge = "bottom",
  fill = "var(--bg)",
  className,
}: {
  /** Suffixe d'id unique (une seule aronde par bloc). Ex. "hero", "cta". */
  variant: string;
  edge?: "bottom" | "top";
  /** Couleur des tenons = fond clair adjacent (token). Défaut `--bg`. */
  fill?: string;
  className?: string;
}) {
  const id = `aronde-dt-${variant}`;
  const top = edge === "top";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0",
        top ? "top-0 -mt-px" : "bottom-0 -mb-px",
        className,
      )}
      style={{ color: fill }}
    >
      <svg
        className={cn("block h-[26px] w-full sm:h-[38px]", top && "-scale-y-100")}
        role="presentation"
      >
        <defs>
          {/* Une maille = base pleine (bas) + un tenon en trapèze (plus large en
              haut = queue d'aronde) qui monte dans le bois sombre. Le vide entre
              deux mailles dessine le tenon complémentaire (couleur du bloc sombre). */}
          <pattern id={id} width="92" height="38" patternUnits="userSpaceOnUse">
            <path d="M0,38 H92 V22 H62 L74,4 H18 L30,22 H0 Z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
