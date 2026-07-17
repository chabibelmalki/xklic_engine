import { cn } from "@/lib/utils";
import type { SectionTone } from "@/components/ui/Section";

/**
 * Section CASCADE : respiration généreuse (`--section-py`), fond piloté par le
 * ton résolu au SiteRenderer (stratégie `brand-tinted` → alternance blanc / lavis
 * de marque). Aucune couleur en dur : uniquement les tokens sémantiques.
 */
export function CascadeSection({
  id,
  tone = "bg",
  className,
  children,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
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
            ? "bg-[color-mix(in_srgb,var(--brand-500)_5%,var(--bg))]"
            : "bg-bg";
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-16 sm:py-[var(--section-py)]", toneClass, className)}
    >
      {children}
    </section>
  );
}
