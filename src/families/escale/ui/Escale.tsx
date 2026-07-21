import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * PRIMITIVES de la famille ESCALE — le vocabulaire d'une SALLE DES OPÉRATIONS
 * internationales / tableau des départs.
 *
 * Parti pris : la page est un centre de coordination 24/7. Les surfaces
 * d'identité (hero, page-hero, cta, footer) sont des PANNEAUX DE NUIT (brand-800)
 * parcourus d'une GRILLE DE MÉRIDIENS (le graticule d'un globe → l'international).
 * La donnée (téléphone, horaires, codes, zone) est composée en MONO façon
 * afficheur d'aéroport (chiffres tabulaires, capitales espacées). Les intitulés
 * sont des VOLETS (split-flap) : petites cases sombres à couture centrale. Le
 * vert de la marque sert de voyant OPÉRATIONNEL (« en service »).
 *
 * Volontairement DISTINCT de tout le parc : ni cartes flottantes (classic), ni
 * faïence (azulejo), ni encre sérigraphiée (riso), ni bois (aronde), ni couture
 * (fil), ni hydro (cascade). 100 % tokens sémantiques (`branding.colors` /
 * thème), zéro hex en dur, motion CSS débrayable.
 */

/**
 * GRATICULE DE MÉRIDIENS — la grille d'un globe (longitudes en arcs, parallèles
 * horizontales), étirée en fond de panneau. Décor pur (aria-hidden) : la couleur
 * vient du `text-*` de l'appelant via `currentColor`.
 */
export function MeridianField({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 200 120"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      {/* Longitudes : ellipses concentriques (les fuseaux vus de face). */}
      {[18, 40, 62, 84].map((rx) => (
        <ellipse key={rx} cx="100" cy="60" rx={rx} ry="59" />
      ))}
      <line x1="100" y1="1" x2="100" y2="119" />
      {/* Parallèles. */}
      {[20, 40, 60, 80, 100].map((y) => (
        <line key={y} x1="6" y1={y} x2="194" y2={y} />
      ))}
    </svg>
  );
}

/**
 * VOYANT « EN SERVICE » — pastille verte (accent) qui bat lentement. La pulsation
 * est portée par `.escale-live` (globals.css) et INERTE sous
 * `prefers-reduced-motion: reduce`.
 */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative grid size-2.5 place-items-center", className)}>
      <span className="escale-live absolute inset-0 rounded-full bg-accent-500/60" />
      <span className="relative size-2.5 rounded-full bg-accent-500" />
    </span>
  );
}

/**
 * VOLET (split-flap) — l'intitulé « eyebrow » posé dans une case d'afficheur :
 * fond sombre, couture centrale (`.escale-flap`), mono en capitales espacées.
 * Sur fond clair (`onDark=false`) la case est encrée en marque profonde ; sur un
 * panneau de nuit (`onDark`) elle s'éclaircit d'un voile blanc.
 */
export function FlapChip({
  children,
  onDark = false,
  live = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  live?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "escale-flap escale-mono inline-flex items-center gap-2 px-3 py-1.5 text-[0.68rem] font-bold",
        onDark ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-brand-800 text-white",
        className,
      )}
    >
      {live && <LiveDot />}
      {children}
    </span>
  );
}

/**
 * BANDEAU D'AFFICHEUR — une ligne de données en mono séparées par des points
 * médians, précédée du voyant « en service ». Les `items` viennent TOUJOURS de la
 * config (donc traduits), jamais d'un libellé en dur.
 */
export function StatusStrip({
  items,
  onDark = false,
  className,
}: {
  items: string[];
  onDark?: boolean;
  className?: string;
}) {
  const shown = items.filter(Boolean);
  if (shown.length === 0) return null;
  return (
    <div
      className={cn(
        "escale-mono flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.7rem] font-medium",
        onDark ? "text-white/70" : "text-muted",
        className,
      )}
    >
      <LiveDot />
      {shown.map((it, i) => (
        <span key={`${it}-${i}`} className="inline-flex items-center gap-3">
          {i > 0 && <span aria-hidden className={onDark ? "text-white/30" : "text-border"}>·</span>}
          <span className={onDark ? "text-white/85" : "text-ink-soft"}>{it}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * En-tête de section ESCALE — volet-kicker + titre display (Bebas, capitales) +
 * lede. Un filet de méridien court sous le kicker rappelle la ligne d'un tableau.
 */
export function EscaleHeading({
  kicker,
  title,
  lede,
  align = "left",
  onDark = false,
  className,
}: {
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div className={cn("mb-5 flex", align === "center" && "justify-center")}>
          <FlapChip onDark={onDark}>{kicker}</FlapChip>
        </div>
      )}
      <h2
        className={cn(
          "font-display text-[2.1rem] leading-[0.98] sm:text-[3rem]",
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
            onDark ? "text-white/80" : "text-muted",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
