import { cn } from "@/lib/utils";

/**
 * En-tête FIL — signature typographique de la famille. Kicker MAJUSCULE espacé
 * précédé d'un FIL POINTILLÉ (la couture), grand titre serif (Fraunces) en
 * graisse posée. `onDark` : variante sur fond encre (texte clair). Couleurs
 * 100 % tokens → suit la palette client.
 */
export function FilHeading({
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
  const seamColor = onDark ? "text-white/45" : "text-brand-300";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div className={cn("mb-6 flex items-center gap-3", align === "center" && "justify-center")}>
          {/* Le fil : trait pointillé façon point de couture. */}
          <span aria-hidden className={cn("fil-seam h-px w-11 shrink-0", seamColor)} />
          <span className={cn("text-xs font-semibold uppercase tracking-[0.24em]", kickerColor)}>
            {kicker}
          </span>
        </div>
      )}
      <h2
        className={cn(
          "font-display text-[2.15rem] leading-[1.08] tracking-[-0.015em] sm:text-[2.9rem]",
          titleColor,
        )}
      >
        {title}
      </h2>
      {lede && <p className={cn("mt-6 max-w-2xl text-lg leading-relaxed", ledeColor)}>{lede}</p>}
    </div>
  );
}
