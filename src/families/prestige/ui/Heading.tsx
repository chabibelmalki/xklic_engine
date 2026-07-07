import { cn } from "@/lib/utils";

/**
 * En-tête PRESTIGE — la signature de la famille : kicker MAJUSCULE très espacé
 * précédé d'un FILET MÉTALLIQUE doré (accent client), grand titre display
 * (Bodoni Moda) massif. À l'opposé de `SectionHeading` classic (centré, pastille)
 * et du kicker sobre editorial. Registre sombre : texte blanc, or pour le kicker.
 */
export function PrestigeHeading({
  kicker,
  title,
  lede,
  align = "left",
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div
          className={cn(
            "mb-6 flex items-center gap-4",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-px w-12 bg-[var(--px-gold)]" />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--px-gold)]">
            {kicker}
          </span>
        </div>
      )}
      <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--px-ink)] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {lede && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--px-ink-soft)]">{lede}</p>
      )}
    </div>
  );
}
