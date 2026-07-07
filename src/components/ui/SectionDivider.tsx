import type { SectionDivider as SectionDividerVariant } from "@/lib/packs";
import type { SectionTone } from "./Section";

/**
 * Découpe INTER-sections, rendue par le SiteRenderer ENTRE deux sections tonales
 * (jamais dans un bloc). Pilotée par le token `sectionDivider` du pack.
 *
 * - `none` : rien (défaut, rétro-compat stricte).
 * - `rule` : filet 1px (couleur bordure) — aussi la découpe forcée par la
 *   stratégie `bordered`.
 * - `bevel` / `wave` / `arch` : bande SVG pleine largeur. Le fond de la bande
 *   reprend la couleur de la section du DESSUS (`fromTone`) ; la forme SVG est
 *   remplie de la couleur de la section du DESSOUS (`toTone`) → transition nette
 *   sans couture avec les deux sections adjacentes.
 */

/** Couleur CSS d'un ton de section (aligné sur `Section.toneClass`). */
function toneColor(tone: SectionTone): string {
  switch (tone) {
    case "alt":
      return "var(--alt)";
    case "surface":
      return "var(--surface)";
    case "surface-2":
      return "var(--surface-2)";
    case "brand":
      return "var(--brand-50)";
    default:
      return "var(--bg)";
  }
}

export function SectionDivider({
  variant,
  fromTone,
  toTone,
}: {
  variant: SectionDividerVariant;
  fromTone: SectionTone;
  toTone: SectionTone;
}) {
  if (variant === "none") return null;

  if (variant === "rule") {
    return <div aria-hidden className="h-px w-full" style={{ background: "var(--border)" }} />;
  }

  const from = toneColor(fromTone);
  const to = toneColor(toTone);

  // Forme du bord bas de la bande (rempli `to`, sur fond `from`).
  // preserveAspectRatio="none" : la forme s'étire sur toute la largeur.
  const path =
    variant === "bevel"
      ? "M0,0 L100,64 L100,64 L0,64 Z" // biseau diagonal
      : variant === "arch"
        ? "M0,64 L0,28 Q50,-16 100,28 L100,64 Z" // arche (creux vers le haut)
        : "M0,64 L0,30 C25,54 75,6 100,30 L100,64 Z"; // vague

  return (
    <div aria-hidden className="w-full overflow-hidden" style={{ background: from, lineHeight: 0 }}>
      <svg
        viewBox="0 0 100 64"
        preserveAspectRatio="none"
        className="block h-8 w-full sm:h-12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={path} fill={to} />
      </svg>
    </div>
  );
}
