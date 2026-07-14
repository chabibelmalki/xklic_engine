import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * En-tête atelier — AUDACIEUX : kicker en PASTILLE cerclée avec étoile dorée,
 * grand titre display serré, lede sobre. Signature de la famille (à l'opposé du
 * kicker-filet éditorial). 100 % tokens.
 */
export function EpureHeading({
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
  const titleColor = onDark ? "text-brand-contrast" : "text-ink";
  const ledeColor = onDark ? "text-brand-contrast/85" : "text-muted";
  const kickerCls = onDark
    ? "border-white/40 text-brand-contrast"
    : "border-brand-800 text-brand-800";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <span
          className={cn(
            "mb-6 inline-flex items-center gap-2 rounded-[var(--radius-btn)] border-2 bg-transparent px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]",
            kickerCls,
          )}
        >
          <Star className="size-3.5 fill-accent-500 text-accent-500" />
          {kicker}
        </span>
      )}
      <h2
        className={cn(
          "font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-5xl",
          titleColor,
        )}
      >
        {title}
      </h2>
      {lede && <p className={cn("mt-5 max-w-2xl text-lg leading-relaxed", ledeColor)}>{lede}</p>}
    </div>
  );
}
