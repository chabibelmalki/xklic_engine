import { cn } from "@/lib/utils";
import { Container } from "./Container";

/**
 * Section pleine largeur, fond alterné, padding vertical cohérent.
 * tone : "bg" (base) · "alt" (section alternée teintée) · "surface" (carte).
 */
export function Section({
  id,
  tone = "bg",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: "bg" | "alt" | "surface" | "surface-2";
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
          : "bg-bg";
  return (
    <section
      id={id}
      // scroll-mt : compense le header sticky pour que l'ancre ne masque pas le titre.
      className={cn("scroll-mt-20 py-16 sm:py-20 lg:scroll-mt-24", toneClass, className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Alternance de fond déterministe selon la position du bloc. */
export function toneForIndex(index: number): "bg" | "alt" {
  return index % 2 === 0 ? "bg" : "alt";
}
