import { cn } from "@/lib/utils";

/**
 * Surface d'une section PRESTIGE. Le registre est SOMBRE par parti pris : trois
 * profondeurs de fond (`void` le plus profond, `panel`, `raised`) dérivées de la
 * palette CLIENT (noir de lecture teinté par `--brand`, cf. `--px-*` dans
 * globals.css). On n'utilise PAS le `tone` alterné clair du moteur (stratégie du
 * pack = `flat`) : la rythmique vient des profondeurs choisies bloc par bloc.
 * Contraste AA garanti (blanc / gris clairs sur near-black).
 */
export type PrestigeSurface = "void" | "panel" | "raised";

const SURFACE: Record<PrestigeSurface, string> = {
  void: "bg-[var(--px-void)]",
  panel: "bg-[var(--px-panel)]",
  raised: "bg-[var(--px-raised)]",
};

export function PrestigeSection({
  id,
  surface = "void",
  className,
  children,
}: {
  id?: string;
  surface?: PrestigeSurface;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-24 text-[var(--px-ink)] sm:py-[var(--section-py)]",
        SURFACE[surface],
        className,
      )}
    >
      {children}
    </section>
  );
}
