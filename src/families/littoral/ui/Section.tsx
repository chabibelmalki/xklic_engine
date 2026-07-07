import { cn } from "@/lib/utils";
import type { SectionTone } from "@/components/ui/Section";

/**
 * Section LITTORAL. Corps clair « bord de mer » : alternance blanc / écume pâle
 * pilotée par le SiteRenderer (stratégie `brand-tinted` du pack) — le ton
 * `brand` devient un lavis d'écume (mélange `--brand-50`/`--bg`). Respiration
 * généreuse via `--section-py`. Aucune carte lourde, aucune couleur en dur :
 * uniquement des tokens sémantiques dérivés de la palette client.
 */
export function LittoralSection({
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
            ? // Écume : lavis d'azur très pâle (≈ brand-50 fondu dans le blanc).
              "bg-[color-mix(in_srgb,var(--brand-50)_58%,var(--bg))]"
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
