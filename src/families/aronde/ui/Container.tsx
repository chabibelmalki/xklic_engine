import { cn } from "@/lib/utils";

/**
 * Conteneur ARONDE. Deux mesures :
 *  - défaut : colonne de corps pilotée par `--content-max` (cohérent pack).
 *  - `wide` : mesure large (chrome, bandes espresso, grilles de panneaux).
 * `bleed` = pleine largeur (jointures en aronde). Purement structurel.
 */
export function ArondeContainer({
  className,
  wide = false,
  bleed = false,
  children,
}: {
  className?: string;
  wide?: boolean;
  bleed?: boolean;
  children: React.ReactNode;
}) {
  if (bleed) return <div className={cn("w-full", className)}>{children}</div>;
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 sm:px-10",
        wide ? "max-w-7xl" : "max-w-[var(--content-max)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
