import { cn } from "@/lib/utils";

/**
 * Conteneur FIL. Deux mesures :
 *  - défaut : colonne de corps pilotée par `--content-max` (cohérent pack).
 *  - `wide` : mesure large (chrome, hero plein cadre, moodboard).
 * Purement structurel, aucune couleur.
 */
export function FilContainer({
  className,
  wide = false,
  children,
}: {
  className?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
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
