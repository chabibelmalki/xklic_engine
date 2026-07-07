import { cn } from "@/lib/utils";

/**
 * En-tête LITTORAL — la signature typographique de la famille. Kicker MAJUSCULE
 * espacé précédé d'un POINT doré + filet (rappel du soleil du logo), grand titre
 * display (Cormorant, haute lisibilité en gros) aligné à gauche, lede posé.
 * `onDark` : variante sur nuit marine (texte clair, filet/or clairs). Couleurs
 * 100 % tokens → suit la palette client.
 */
export function LittoralHeading({
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
  const ruleColor = onDark ? "bg-white/40" : "bg-brand-200";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div
          className={cn(
            "mb-6 flex items-center gap-3",
            align === "center" && "justify-center",
          )}
        >
          <span className="size-2 shrink-0 rounded-full bg-accent-500" />
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.24em]",
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
          "font-display text-[2.1rem] font-semibold leading-[1.04] tracking-[-0.01em] sm:text-5xl",
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
