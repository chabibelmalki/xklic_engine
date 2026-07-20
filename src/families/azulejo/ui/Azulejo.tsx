import { cn } from "@/lib/utils";

/**
 * PRIMITIVES de la famille AZULEJO — le vocabulaire d'un mur de FAÏENCE.
 *
 * Parti pris : la page est un pan de CARREAUX ÉMAILLÉS. Le relief vient de
 * l'ÉMAIL (un reflet clair en haut de chaque carreau, `.azulejo-glaze`) et des
 * JOINTS fins entre les cases (`.azulejo-wall`), jamais d'une ombre dure. La
 * signature est la FRISE géométrique (`.azulejo-frieze`) — une bande de losanges
 * façon bordure d'azulejo — qui coiffe le chrome et sépare les sections.
 *
 * Volontairement DISTINCT de riso (encre saturée + trame), de classic (cartes
 * flottantes), d'epure (grotesque XXL) : ici tout est céramique, arrondi doux,
 * serif haute, teintes émaillées. 100 % tokens (`branding.colors` / thème), zéro
 * couleur en dur (hors reflet d'émail blanc, neutre), zéro JS.
 */

/**
 * MOTIF de carreau — un QUATRE-FEUILLES (quatrefoil), le motif central classique
 * d'un azulejo, formé de quatre lobes. Décor pur : la couleur vient du `text-*`
 * de l'appelant via `currentColor`.
 */
export function TileMotif({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("size-5", className)} fill="currentColor">
      <circle cx="12" cy="8" r="4.3" />
      <circle cx="12" cy="16" r="4.3" />
      <circle cx="8" cy="12" r="4.3" />
      <circle cx="16" cy="12" r="4.3" />
    </svg>
  );
}

/**
 * MUR DE CARREAUX — la grille de joints fins posée en fond (décor pur, sur un
 * élément aria-hidden). Prend la couleur du texte courant : `text-white/12` sur
 * un pan émaillé, `text-brand-500/[0.07]` sur du blanc cassé.
 */
export function AzulejoWall({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("azulejo-wall pointer-events-none absolute inset-0", className)} />
  );
}

/**
 * FRISE de faïence — la bande de losanges qui borde une composition de carreaux.
 * Sert de filet de signature au chrome (header/footer/actions flottantes) et de
 * séparateur entre sections, à la place d'un dégradé ou d'un filet plein.
 */
export function AzulejoFrieze({ className }: { className?: string }) {
  return <div aria-hidden className={cn("azulejo-frieze h-4 w-full", className)} />;
}

/**
 * PUCE-CARREAU (kicker) — une petite tomette émaillée : coin arrondi doux, motif
 * quatre-feuilles, libellé en capitales espacées. Distincte du kicker-pilule de
 * classic, du cartouche d'encre de riso, du filet d'editorial.
 */
export function TileChip({
  children,
  onDark = false,
  className,
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em]",
        onDark ? "bg-white/15 text-white" : "bg-brand-600 text-brand-contrast",
        className,
      )}
    >
      <TileMotif className="size-3.5 opacity-80" />
      {children}
    </span>
  );
}

/**
 * En-tête de section AZULEJO — puce-carreau + titre en serif haute (DM Serif
 * Display), lede en gris. Pas de capitales forcées (le serif porte l'élégance),
 * à l'inverse du titre d'affiche tout en capitales de riso.
 */
export function AzulejoHeading({
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
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div className={cn("mb-5 flex", align === "center" && "justify-center")}>
          <TileChip onDark={onDark}>{kicker}</TileChip>
        </div>
      )}
      <h2
        className={cn(
          "font-display text-[1.9rem] leading-[1.08] sm:text-[2.5rem]",
          onDark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-lg leading-relaxed",
            align === "center" && "mx-auto",
            onDark ? "text-white/85" : "text-muted",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
