import { cn } from "@/lib/utils";

/**
 * Décor de la famille CASCADE — 100 % décoratif (aria-hidden), zéro dépendance.
 * Trois pièces qui font « couler » les blocs immersifs :
 *  - <WaveEdge/>  : bord ondulé plein-bord (le dégradé se déverse dans la section
 *                   suivante). `fill` = couleur de la section d'accueil.
 *  - <Aura/>      : halos flous (lumière d'eau) posés derrière un dégradé.
 *  - <BubbleField/> : gouttelettes dispersées (fines bulles claires).
 */

/**
 * Voile de marque des BANDEAUX PHOTO (hero d'accueil, en-tête de page) : dense
 * (navy) à gauche/haut où vit le texte, s'estompe vers la droite/bas où la photo
 * respire. Garantit l'AA du texte blanc sur n'importe quelle photo, même claire.
 */
export const BANNER_SCRIM =
  "linear-gradient(105deg, color-mix(in srgb, var(--brand-800) 92%, transparent) 0%, color-mix(in srgb, var(--brand-800) 74%, transparent) 44%, color-mix(in srgb, var(--brand-700) 40%, transparent) 72%, color-mix(in srgb, var(--brand-600) 8%, transparent) 100%)";

export function WaveEdge({
  position = "bottom",
  fill = "var(--bg)",
  className,
}: {
  position?: "top" | "bottom";
  fill?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10 leading-[0]",
        position === "bottom" ? "bottom-0" : "top-0",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={cn("block h-[42px] w-full sm:h-[68px]", position === "top" && "rotate-180")}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,64 C240,120 480,8 720,44 C960,80 1200,120 1440,56 L1440,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/** Halos flous « lumière d'eau » derrière un dégradé sombre (bleu + vert). */
export function Aura({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -left-[10%] -top-[30%] size-[46rem] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--brand-400) 55%, transparent), transparent)" }}
      />
      <div
        className="absolute -bottom-[35%] right-[-8%] size-[42rem] rounded-full opacity-55 blur-3xl"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--accent-500) 60%, transparent), transparent)" }}
      />
    </div>
  );
}

/** Champ de gouttelettes claires (fines bulles) — profondeur légère sur dégradé. */
export function BubbleField({ className }: { className?: string }) {
  const dots = [
    { cx: 12, cy: 26, r: 5 },
    { cx: 28, cy: 68, r: 3 },
    { cx: 47, cy: 18, r: 4 },
    { cx: 63, cy: 74, r: 6 },
    { cx: 78, cy: 34, r: 3 },
    { cx: 88, cy: 62, r: 5 },
    { cx: 38, cy: 44, r: 2.5 },
    { cx: 71, cy: 12, r: 2.5 },
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#ffffff" opacity={0.06 + (i % 3) * 0.03} />
      ))}
    </svg>
  );
}
