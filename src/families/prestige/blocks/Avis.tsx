import { Quote, Star } from "lucide-react";
import type { AvisContent, AvisItem } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { PrestigeSection } from "../ui/Section";
import { PrestigeContainer } from "../ui/Container";
import { PrestigeHeading } from "../ui/Heading";

/** Rangée d'étoiles en OR client (--px-gold), sur near-black. */
function GoldStars({ note = 5 }: { note?: number }) {
  const full = Math.round(note);
  return (
    <span role="img" aria-label={`${note}/5`} className="inline-flex items-center gap-1 text-[var(--px-gold)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4" fill={i < full ? "currentColor" : "none"} strokeWidth={i < full ? 0 : 1.5} />
      ))}
    </span>
  );
}

/** Carte témoignage — fond « raised » (le plus clair des near-black), filet métallique. */
function AvisCard({ a }: { a: AvisItem }) {
  return (
    <figure className="flex h-full flex-col border border-[var(--px-line)] bg-[var(--px-raised)] p-8">
      <Quote className="size-8 shrink-0 text-[var(--px-gold)]" />
      <blockquote className="mt-5 flex-1 leading-relaxed text-[var(--px-ink-soft)]">“{a.texte}”</blockquote>
      <figcaption className="mt-6 flex items-end justify-between gap-3 border-t border-[var(--px-hairline)] pt-5">
        <div>
          <p className="font-display text-lg font-semibold text-white">{a.auteur}</p>
          {a.ville && <p className="mt-0.5 text-sm text-[var(--px-muted)]">{a.ville}</p>}
        </div>
        {a.note && <GoldStars note={a.note} />}
      </figcaption>
    </figure>
  );
}

/**
 * AVIS prestige — témoignages en registre SOMBRE (le classic `Avis` clair casse
 * la nuit du pack). `variant: "carrousel"` (défaut ici) = rangée défilante en
 * scroll-snap CSS pur (zéro JS), pensée pour « faire défiler les avis ». Les
 * autres variantes retombent sur une grille immersive. Or client pour les
 * étoiles et le filet, cartes `--px-raised`. Garde-fou : pas d'items ⇒ rien
 * (jamais de bloc orphelin, cf. NEWCLIENT.md).
 */
export function Avis({ block, strings }: BlockComponentProps<AvisContent>) {
  const c = block.content;
  if (!c.items?.length) return null;

  const variant = block.variant ?? "carrousel";

  const header = (
    <>
      <PrestigeHeading kicker={c.eyebrow ?? "Avis clients"} title={c.titre ?? strings.avis.defaultTitle} />
      {c.noteGlobale && (
        <div className="mt-6 flex items-center gap-3 text-[var(--px-ink)]">
          <GoldStars note={c.noteGlobale} />
          <span className="font-display text-lg font-semibold">{c.noteGlobale.toFixed(1)}/5</span>
          {c.nombre && <span className="text-[var(--px-muted)]">· {c.nombre} avis</span>}
        </div>
      )}
    </>
  );

  const disclaimer = c.disclaimer ? (
    <p className="mt-10 text-sm text-[var(--px-muted)]">{c.disclaimer}</p>
  ) : null;

  return (
    <PrestigeSection id="avis" surface="void">
      <PrestigeContainer>
        {header}

        {variant === "carrousel" ? (
          // Défilement horizontal en scroll-snap CSS (pas de JS). Le débordement
          // est volontaire : il signale qu'on peut faire défiler.
          <div className="mt-14 -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {c.items.map((a, i) => (
              <div key={i} className="w-[85%] shrink-0 snap-start sm:w-[380px]">
                <AvisCard a={a} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.items.map((a, i) => (
              <AvisCard key={i} a={a} />
            ))}
          </div>
        )}

        {disclaimer}
      </PrestigeContainer>
    </PrestigeSection>
  );
}
