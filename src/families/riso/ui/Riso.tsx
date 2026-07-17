import { cn } from "@/lib/utils";

/**
 * PRIMITIVES de la famille RISO — le vocabulaire d'un atelier de sérigraphie.
 *
 * Parti pris : la page est une AFFICHE IMPRIMÉE. Le relief ne vient jamais d'une
 * ombre portée (une encre est plate) mais de la SURIMPRESSION (`mix-blend-mode`),
 * de la TRAME de points et du DÉCALAGE DE REPÉRAGE assumé. Les données (prix,
 * horaires, index) sont en mono d'imprimeur ; les sections sont indexées par
 * LETTRES (A/B/C), jamais par les chiffres 01/02 déjà saturés dans le parc.
 *
 * 100 % tokens (brand/accent/ink… = `branding.colors` du client), zéro couleur en
 * dur, zéro JS.
 */

/**
 * DÉCALAGE DE REPÉRAGE — la signature de la famille. Le texte est imprimé deux
 * fois : une passe d'encre d'accent légèrement décalée, puis la passe d'encre
 * principale par-dessus. C'est le « défaut » d'impression revendiqué comme style.
 *
 * Le fantôme se fond dans l'aplat qui est DERRIÈRE lui : `multiply` sur du papier
 * clair (l'accent reste franc), `screen` sur un aplat d'encre foncé (l'accent
 * s'éclaircit au lieu de disparaître). Le décalage est en `em` : il suit la
 * taille du titre au lieu d'être un offset fixe qui deviendrait ridicule en XXL.
 */
export function OffsetText({
  children,
  onDark = false,
  className,
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 translate-x-[0.055em] translate-y-[0.035em] text-accent-500",
          onDark ? "mix-blend-screen" : "mix-blend-multiply",
        )}
      >
        {children}
      </span>
      <span className="relative">{children}</span>
    </span>
  );
}

/**
 * TRAME d'impression (halftone). Décor pur : la couleur vient de `text-*` posé
 * par l'appelant (`text-white/25` sur une encre, `text-ink/15` sur du papier).
 * `lg` = trame large des grands aplats, où le point doit se voir.
 */
export function Halftone({ className, lg = false }: { className?: string; lg?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        lg ? "riso-halftone-lg" : "riso-halftone",
        className,
      )}
    />
  );
}

/**
 * REPÈRE DE REPÉRAGE (registration mark) — la mire que l'imprimeur pose hors
 * format pour caler ses passes de couleur. Décor pur. Distinct des équerres
 * d'angle de `signal` : c'est une mire ronde à réticule, pas un cadre.
 */
export function RegistrationMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("size-6", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 0v8M12 16v8M0 12h8M16 12h8" />
    </svg>
  );
}

/**
 * BARRE D'ENCRES — la bande de contrôle couleur imprimée en marge d'une feuille.
 * Sert de filet de signature au chrome (header/footer/actions flottantes) à la
 * place d'un dégradé. Segments = les encres du site, dans l'ordre des passes.
 */
export function InkBar({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex h-1.5 w-full", className)}>
      <span className="flex-1 bg-brand-800" />
      <span className="flex-1 bg-brand-600" />
      <span className="flex-1 bg-brand-400" />
      <span className="flex-1 bg-accent-500" />
      <span className="flex-1 bg-ink" />
    </div>
  );
}

/** Index par LETTRE (A, B, C…) — l'indexation d'une planche, pas un numéro. */
export function inkLetter(i: number): string {
  return String.fromCharCode(65 + (i % 26));
}

/**
 * En-tête de section RISO — un CARTOUCHE d'imprimeur : étiquette d'encre pleine
 * (rectangle d'accent, mono en capitales) puis un titre d'affiche en Archivo
 * Black imprimé en double passe (décalage de repérage).
 *
 * Distinct du kicker-pilule de `classic`, du filet d'`editorial`, du carré de
 * `signal`, de la pastille cerclée d'`epure`, du script de `foyer`.
 */
export function RisoHeading({
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
        <div className={cn("mb-6 flex", align === "center" && "justify-center")}>
          <span className="riso-mono inline-block bg-accent-500 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-accent-contrast">
            {kicker}
          </span>
        </div>
      )}
      <h2
        className={cn(
          "font-display text-3xl uppercase leading-[0.98] sm:text-[2.7rem]",
          onDark ? "text-white" : "text-ink",
        )}
      >
        <OffsetText onDark={onDark}>{title}</OffsetText>
      </h2>
      {lede && (
        <p
          className={cn(
            "mt-6 max-w-2xl text-lg leading-relaxed",
            onDark ? "text-white/85" : "text-muted",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
