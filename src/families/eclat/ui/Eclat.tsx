import { cn } from "@/lib/utils";

/**
 * PRIMITIVES de la famille ÉCLAT — un minimalisme LUMINEUX.
 *
 * Parti pris : le propre, c'est le VIDE et la BRILLANCE. Fonds blancs, beaucoup
 * d'air, structure en FILETS fins (jamais d'aplats lourds ni d'ombres dures), et
 * une seule signature graphique : l'ÉTINCELLE (`Sparkle`), le glyphe de la
 * propreté qui éclate. La couleur ne vient qu'en touches ; le caractère vient de
 * la serif éditoriale (Instrument Serif) et du rythme, pas d'un décor.
 *
 * Volontairement DISTINCT de riso (encre saturée), azulejo (carreaux),
 * clair-frais (arrondi générique), editorial (photo + filets serif classique).
 * 100 % tokens, zéro couleur en dur.
 */

/**
 * ÉTINCELLE — le glyphe signature (sparkle à quatre pointes concaves, la brillance
 * d'une surface propre). Décor + puce ; couleur via `text-*` (`currentColor`).
 */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("size-4", className)} fill="currentColor">
      <path d="M12 0c.6 6.6 4.8 10.8 12 12-7.2 1.2-11.4 5.4-12 12-.6-6.6-4.8-10.8-12-12 7.2-1.2 11.4-5.4 12-12Z" />
    </svg>
  );
}

/**
 * FILET fin horizontal — l'outil de structure de la famille (à la place des
 * cartes/ombres). Une étincelle centrale optionnelle en fait un séparateur signé.
 */
export function EclatRule({ marked = false, className }: { marked?: boolean; className?: string }) {
  if (!marked) return <hr className={cn("border-0 border-t border-border", className)} />;
  return (
    <div aria-hidden className={cn("flex items-center gap-4 text-brand-500", className)}>
      <span className="h-px flex-1 bg-border" />
      <Sparkle className="size-3.5" />
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * En-tête de section ÉCLAT — kicker = étincelle + label espacé, titre en serif
 * éditoriale (Instrument Serif), lede en gris. Sobre, aéré.
 */
export function EclatHeading({
  kicker,
  title,
  lede,
  align = "left",
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <div
          className={cn(
            "mb-5 flex items-center gap-2 text-brand-700",
            align === "center" && "justify-center",
          )}
        >
          <Sparkle className="size-3.5" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">{kicker}</span>
        </div>
      )}
      <h2 className="font-display text-[2rem] leading-[1.1] text-ink sm:text-[2.75rem]">{title}</h2>
      {lede && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed text-muted",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
