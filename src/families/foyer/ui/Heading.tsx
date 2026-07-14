import { cn } from "@/lib/utils";

/**
 * En-tête de section FOYER — la signature de la famille : un kicker MANUSCRIT
 * (script Caveat, `.foyer-script`) précédé d'un petit trait « à main levée »,
 * puis un grand titre serif chaleureux (Newsreader) et un lede posé. Registre
 * « carnet de maison » : chaleureux, personnel, écrit à la main — à l'opposé du
 * kicker majuscule technique d'`editorial`/`signal`. Couleurs 100 % tokens.
 */
export function FoyerHeading({
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
  const ledeColor = onDark ? "text-white/85" : "text-muted";
  const kickerColor = onDark ? "text-accent-50" : "text-brand-600";
  const ruleColor = onDark ? "bg-white/50" : "bg-accent-500";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div className={cn("mb-3 flex items-center gap-2.5", align === "center" && "justify-center")}>
          <span className={cn("h-px w-8 rounded-full", ruleColor)} aria-hidden />
          <span className={cn("foyer-script text-2xl leading-none sm:text-[1.7rem]", kickerColor)}>
            {kicker}
          </span>
        </div>
      )}
      <h2
        className={cn(
          "pack-heading font-display text-[2.1rem] font-semibold leading-[1.08] sm:text-[2.75rem]",
          titleColor,
        )}
      >
        {title}
      </h2>
      {lede && <p className={cn("mt-5 max-w-2xl text-lg leading-relaxed", ledeColor)}>{lede}</p>}
    </div>
  );
}
