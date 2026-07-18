import { cn } from "@/lib/utils";
import type { SectionTone } from "@/components/ui/Section";

/**
 * Section ARONDE. Corps clair « établi crème » : alternance blanc / lavis de
 * bois très pâle (stratégie `brand-tinted` du pack — le ton `brand` devient un
 * mélange `--brand-50`/`--bg`). Respiration ample via `--section-py`. Aucune
 * couleur en dur : uniquement des tokens dérivés de la palette client.
 */
export function ArondeSection({
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
            ? // Lavis de bois : brand-50 fondu dans le blanc (établi crème).
              "bg-[color-mix(in_srgb,var(--brand-50)_62%,var(--bg))]"
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
