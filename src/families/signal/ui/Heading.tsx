import { cn } from "@/lib/utils";

/**
 * En-tête de section SIGNAL — grammaire éditoriale-TECHNIQUE : un kicker en
 * MAJUSCULES très espacées précédé d'un CARRÉ plein (le « signal », en accent),
 * puis un grand titre display adossé à une ARÊTE de marque à gauche (le « spine »).
 * Signature de la famille, distincte du filet-seul d'editorial et du kicker à
 * pastille de classic. Couleurs 100 % tokens.
 */
export function SignalHeading({
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
  const kickerColor = onDark ? "text-white/85" : "text-brand-700";
  const spine = onDark ? "border-white/40" : "border-brand-500";
  const tick = onDark ? "bg-white/70" : "bg-accent-500";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div className={cn("mb-5 flex items-center gap-2.5", align === "center" && "justify-center")}>
          <span className={cn("size-2.5 shrink-0", tick)} />
          <span className={cn("text-[0.72rem] font-bold uppercase tracking-[0.26em]", kickerColor)}>
            {kicker}
          </span>
        </div>
      )}
      <h2
        className={cn(
          "border-s-[3px] ps-5 font-display text-3xl font-bold leading-[1.06] tracking-tight sm:text-[2.6rem]",
          spine,
          titleColor,
        )}
      >
        {title}
      </h2>
      {lede && (
        <p className={cn("mt-5 max-w-2xl ps-5 text-lg leading-relaxed", ledeColor)}>{lede}</p>
      )}
    </div>
  );
}

/**
 * Cadre à ÉQUERRES (bracket corners) — quatre tenons d'accent aux angles d'un
 * panneau. Décor pur (aria-hidden), signature « fiche technique » de la famille.
 */
export function CornerTicks({ className }: { className?: string }) {
  const base = "pointer-events-none absolute size-3.5 border-accent-500";
  return (
    <div aria-hidden className={cn("absolute inset-0", className)}>
      <span className={cn(base, "left-0 top-0 border-l-2 border-t-2")} />
      <span className={cn(base, "right-0 top-0 border-r-2 border-t-2")} />
      <span className={cn(base, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span className={cn(base, "bottom-0 right-0 border-b-2 border-r-2")} />
    </div>
  );
}
