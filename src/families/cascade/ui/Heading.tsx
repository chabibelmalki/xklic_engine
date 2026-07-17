import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * En-tête de section CASCADE — signature de la famille : kicker en PASTILLE
 * dégradée bleu→vert avec une goutte, grand titre display géométrique (Sora),
 * lede sobre. À l'opposé du kicker-filet éditorial et du carré-index de signal.
 * Couleurs 100 % tokens (brand/accent = branding.colors du client).
 */
export function CascadeHeading({
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
  /** Sur fond dégradé sombre (hero/cta) : texte clair. */
  onDark?: boolean;
  className?: string;
}) {
  const titleColor = onDark ? "text-white" : "text-ink";
  const ledeColor = onDark ? "text-white/85" : "text-muted";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <span
          className={cn(
            "mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]",
            align === "center" && "mx-auto",
            onDark
              ? "bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm"
              : "text-brand-700 ring-1 ring-inset ring-brand-200 [background:linear-gradient(90deg,color-mix(in_srgb,var(--brand-500)_12%,var(--bg)),color-mix(in_srgb,var(--accent-500)_12%,var(--bg)))]",
          )}
        >
          <Droplet className={cn("size-3.5", onDark ? "fill-white/70 text-white/70" : "fill-accent-500 text-accent-500")} />
          {kicker}
        </span>
      )}
      <h2
        className={cn(
          "font-display text-[2.1rem] font-bold leading-[1.04] tracking-[-0.02em] sm:text-[2.75rem] lg:text-5xl",
          titleColor,
        )}
      >
        {title}
      </h2>
      {lede && <p className={cn("mt-5 max-w-2xl text-lg leading-relaxed", ledeColor)}>{lede}</p>}
    </div>
  );
}
