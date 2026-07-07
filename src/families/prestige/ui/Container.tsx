import { cn } from "@/lib/utils";

/**
 * Conteneur PRESTIGE. Deux mesures : le corps (mesure `--content-max`, large) et
 * `bleed` = pleine largeur (bandes immersives, photos plein-bord). Padding
 * horizontal ample pour laisser respirer la grande typo. Aucune couleur ici : le
 * fond est posé par `PrestigeSection`.
 */
export function PrestigeContainer({
  className,
  bleed = false,
  children,
}: {
  className?: string;
  bleed?: boolean;
  children: React.ReactNode;
}) {
  if (bleed) return <div className={cn("w-full", className)}>{children}</div>;
  return (
    <div className={cn("mx-auto w-full max-w-[var(--content-max)] px-6 sm:px-10", className)}>
      {children}
    </div>
  );
}
