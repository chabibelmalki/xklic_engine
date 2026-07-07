import { cn } from "@/lib/utils";
import type { SectionTone } from "@/components/ui/Section";

/**
 * Section éditoriale : fond PLAT (pas de carte, pas d'ombre), respiration
 * généreuse pilotée par `--section-py` (cohérent avec le pack). Le ton vient du
 * SiteRenderer (stratégie du pack) — `brand-tinted`/`bordered`/etc. restent
 * respectés. Aucune couleur en dur : uniquement les tokens sémantiques.
 */
export function EditorialSection({
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
            ? // Lavis TRÈS pâle : ~6 % de marque dans le fond (bleu à peine perceptible).
              // Piloté par la palette client (--brand-500 + --bg), pas de couleur en dur.
              "bg-[color-mix(in_srgb,var(--brand-500)_6%,var(--bg))]"
            : "bg-bg";
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-20 sm:py-[var(--section-py)]", toneClass, className)}
    >
      {children}
    </section>
  );
}
