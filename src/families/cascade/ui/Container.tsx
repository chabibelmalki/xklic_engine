import { cn } from "@/lib/utils";

/**
 * Conteneur de la famille CASCADE. Mesure pilotée par `--content-max` (comme les
 * autres familles) ; padding horizontal généreux et aéré (registre « respiration
 * d'eau »). `bleed` = pleine largeur (dégradés/vagues plein-bord).
 */
export function CascadeContainer({
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
    <div className={cn("mx-auto w-full max-w-[var(--content-max)] px-6 sm:px-8 lg:px-10", className)}>
      {children}
    </div>
  );
}
