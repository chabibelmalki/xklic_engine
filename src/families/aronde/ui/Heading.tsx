import { cn } from "@/lib/utils";

/**
 * En-tête ARONDE — signature typographique de la famille. Kicker MAJUSCULE
 * espacé précédé d'un CARRÉ plein caramel (une mortaise) + filet de coupe, grand
 * titre slab (Zilla Slab). `onDark` : variante sur bois espresso (texte clair).
 * Couleurs 100 % tokens → suit la palette client. Angles nets (aucun arrondi).
 */
export function ArondeHeading({
  kicker,
  title,
  lede,
  align = "left",
  onDark = false,
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
}) {
  const titleColor = onDark ? "text-white" : "text-ink";
  const ledeColor = onDark ? "text-white/80" : "text-muted";
  const kickerColor = onDark ? "text-accent-50" : "text-brand-700";
  const ruleColor = onDark ? "bg-white/35" : "bg-brand-200";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div
          className={cn(
            "mb-6 flex items-center gap-3",
            align === "center" && "justify-center",
          )}
        >
          <span className="size-2.5 shrink-0 rounded-[1px] bg-accent-500" />
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.22em]",
              kickerColor,
            )}
          >
            {kicker}
          </span>
          <span className={cn("h-px w-10", ruleColor)} />
        </div>
      )}
      <h2
        className={cn(
          "font-display text-[2.1rem] font-bold leading-[1.06] tracking-[-0.01em] sm:text-[2.9rem]",
          titleColor,
        )}
      >
        {title}
      </h2>
      {lede && (
        <p className={cn("mt-6 max-w-2xl text-lg leading-relaxed", ledeColor)}>{lede}</p>
      )}
    </div>
  );
}
