import { cn } from "@/lib/utils";

/**
 * SOLEIL LEVANT — halo décoratif doré (repris du logo). Rendu SSR pur : un
 * dégradé radial or (`--accent-500`) fondu dans la nuit marine, posé derrière le
 * titre des blocs immersifs. Opacité volontairement BASSE : c'est une lueur
 * d'infrastructure, elle ne dégrade jamais le contraste AA du texte blanc
 * par-dessus. `-z-0` (sous le contenu). Couleur 100 % token.
 */
export function LittoralSunburst({
  className,
  position = "top-right",
}: {
  className?: string;
  position?: "top-right" | "top-center";
}) {
  const at = position === "top-center" ? "50% -8%" : "84% -14%";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-0 overflow-hidden", className)}
      style={{
        background: `radial-gradient(38rem 30rem at ${at}, color-mix(in srgb, var(--accent-500) 30%, transparent) 0%, color-mix(in srgb, var(--accent-500) 10%, transparent) 34%, transparent 62%)`,
      }}
    />
  );
}
