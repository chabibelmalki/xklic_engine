import { Quote } from "lucide-react";
import type { AvisContent, AvisItem } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import { Reveal } from "@/components/ui/Reveal";

/** Carte d'avis réutilisée par les variantes grille / carrousel. */
function AvisCard({ a, className = "" }: { a: AvisItem; className?: string }) {
  return (
    <figure className={`flex h-full flex-col rounded-theme border border-border bg-surface p-7 shadow-sm ${className}`}>
      <Quote className="size-8 text-brand-200" />
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">“{a.texte}”</blockquote>
      <figcaption className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="font-semibold text-ink">{a.auteur}</p>
          {a.ville && <p className="text-sm text-muted">{a.ville}</p>}
        </div>
        {a.note && <Stars note={a.note} />}
      </figcaption>
    </figure>
  );
}

/**
 * Avis / témoignages. variant : "grille" (cartes, défaut) · "carrousel" (rangée
 * défilante en scroll-snap) · "vedette" (1 témoignage en grand + le reste en
 * appoint). La note globale alimente aussi le JSON-LD.
 */
export function Avis({ block, index, strings }: BlockComponentProps<AvisContent>) {
  const c = block.content;
  const variant = block.variant ?? "grille";

  const note = c.noteGlobale ? (
    <Reveal>
      <div className="mt-6 flex items-center justify-center gap-3 text-ink">
        <Stars note={c.noteGlobale} />
        <span className="font-semibold">{c.noteGlobale.toFixed(1)}/5</span>
        {c.nombre && <span className="text-muted">· {c.nombre} avis</span>}
      </div>
    </Reveal>
  ) : null;

  const header = (
    <>
      <Reveal>
        <SectionHeading eyebrow={c.eyebrow ?? "Avis clients"} title={c.titre ?? strings.avis.defaultTitle} />
      </Reveal>
      {note}
    </>
  );

  const disclaimer = c.disclaimer ? (
    <p className="mt-6 text-center text-xs text-muted-2">{c.disclaimer}</p>
  ) : null;

  if (variant === "carrousel") {
    return (
      <Section id="avis" tone={toneForIndex(index)}>
        {header}
        {/* Défilement horizontal en CSS scroll-snap (pas de JS). */}
        <div className="mt-12 -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
          {c.items.map((a, i) => (
            <div key={i} className="w-[82%] shrink-0 snap-start sm:w-[360px]">
              <AvisCard a={a} />
            </div>
          ))}
        </div>
        {disclaimer}
      </Section>
    );
  }

  if (variant === "vedette" && c.items.length > 0) {
    const [lead, ...rest] = c.items;
    return (
      <Section id="avis" tone={toneForIndex(index)}>
        {header}
        <Reveal>
          <figure className="mx-auto mt-12 max-w-3xl rounded-theme border border-border bg-surface p-8 text-center shadow-sm sm:p-12">
            <Quote className="mx-auto size-10 text-brand-200" />
            <blockquote className="mt-5 font-display text-xl leading-relaxed text-ink sm:text-2xl">
              “{lead.texte}”
            </blockquote>
            <figcaption className="mt-6 flex flex-col items-center gap-1.5">
              {lead.note && <Stars note={lead.note} />}
              <p className="font-semibold text-ink">{lead.auteur}</p>
              {lead.ville && <p className="text-sm text-muted">{lead.ville}</p>}
            </figcaption>
          </figure>
        </Reveal>
        {rest.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a, i) => (
              <Reveal key={i} delay={(i % 3) * 0.06}>
                <AvisCard a={a} />
              </Reveal>
            ))}
          </div>
        )}
        {disclaimer}
      </Section>
    );
  }

  return (
    <Section id="avis" tone={toneForIndex(index)}>
      {header}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {c.items.map((a, i) => (
          <Reveal key={i} delay={(i % 3) * 0.06}>
            <AvisCard a={a} />
          </Reveal>
        ))}
      </div>
      {disclaimer}
    </Section>
  );
}
