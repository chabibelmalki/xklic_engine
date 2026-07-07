import { cn } from "@/lib/utils";
import type { SectionStrategy } from "@/lib/packs";
import { Container } from "./Container";

/** Tons de fond possibles d'une section. `brand` = teinte de marque légère. */
export type SectionTone = "bg" | "alt" | "surface" | "surface-2" | "brand";

/**
 * Section pleine largeur, fond alterné, padding vertical cohérent.
 * tone : "bg" (base) · "alt" (section alternée teintée) · "surface" (carte) ·
 * "brand" (teinte de marque légère).
 */
export function Section({
  id,
  tone = "bg",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "alt"
      ? "bg-alt"
      : tone === "surface"
        ? "bg-surface"
        : tone === "surface-2"
          ? "bg-surface-2"
          : tone === "brand"
            ? "bg-brand-50"
            : "bg-bg";
  return (
    <section
      id={id}
      // scroll-mt : compense le header sticky pour que l'ancre ne masque pas le titre.
      // Densité verticale pilotée par le pack (--section-py, globals.css). Le mobile
      // garde py-16 (compact), le desktop prend la valeur authored du pack.
      className={cn("scroll-mt-20 py-16 sm:py-[var(--section-py)] lg:scroll-mt-24", toneClass, className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/**
 * Alternance de fond déterministe selon la position du bloc (rendu historique).
 * Conservée pour compat ; le rendu passe désormais par `sectionTone`.
 */
export function toneForIndex(index: number): "bg" | "alt" {
  return index % 2 === 0 ? "bg" : "alt";
}

/**
 * Ton de fond d'une section selon la STRATÉGIE du pack et sa position tonale.
 * `striped` reproduit exactement `toneForIndex` (rétro-compat). Résolu une seule
 * fois côté SiteRenderer, puis passé en prop `tone` à chaque bloc.
 */
export function sectionTone(strategy: SectionStrategy, index: number): SectionTone {
  const odd = index % 2 === 1;
  switch (strategy) {
    case "flat":
    case "bordered":
      return "bg";
    case "surface-alt":
      return odd ? "surface-2" : "bg";
    case "brand-tinted":
      return odd ? "brand" : "bg";
    case "striped":
    default:
      return odd ? "alt" : "bg";
  }
}
