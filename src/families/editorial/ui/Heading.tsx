import { cn } from "@/lib/utils";

/**
 * En-tête éditorial — l'anti-`SectionHeading` classic (qui est centré, badge
 * pilule + titre moyen). Ici : kicker MAJUSCULE espacé précédé d'un FILET fin,
 * grand titre display aligné à GAUCHE, lede sobre. C'est la signature de la
 * famille. Couleurs 100 % tokens.
 */
export function EditorialHeading({
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
  /** Sur fond sombre (hero) : texte clair, filet/kicker clairs. */
  onDark?: boolean;
  className?: string;
}) {
  const titleColor = onDark ? "text-white" : "text-ink";
  const ledeColor = onDark ? "text-white/85" : "text-muted";
  const kickerColor = onDark ? "text-white/80" : "text-brand-700";
  const ruleColor = onDark ? "bg-white/60" : "bg-brand-500";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div className={cn("mb-6 flex items-center gap-3", align === "center" && "justify-center")}>
          <span className={cn("h-px w-10", ruleColor)} />
          <span className={cn("text-xs font-semibold uppercase tracking-[0.22em]", kickerColor)}>
            {kicker}
          </span>
        </div>
      )}
      <h2
        className={cn(
          "font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl",
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
