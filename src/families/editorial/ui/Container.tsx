import { cn } from "@/lib/utils";

/**
 * Conteneur éditorial. Mesure pilotée par le token `--content-max` (comme la
 * famille classic) → cohérent avec la densité/largeur du pack. `bleed` = pleine
 * largeur (photos plein-bord). Padding horizontal généreux.
 */
export function EditorialContainer({
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
