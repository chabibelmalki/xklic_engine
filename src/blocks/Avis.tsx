import { Quote } from "lucide-react";
import type { AvisContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import { Reveal } from "@/components/ui/Reveal";

/** Avis / témoignages. La note globale alimente aussi le JSON-LD. */
export function Avis({ block, index, strings }: BlockComponentProps<AvisContent>) {
  const c = block.content;

  return (
    <Section id="avis" tone={toneForIndex(index)}>
      <Reveal>
        <SectionHeading eyebrow={c.eyebrow ?? "Avis clients"} title={c.titre ?? strings.avis.defaultTitle} />
      </Reveal>

      {c.noteGlobale && (
        <Reveal>
          <div className="mt-6 flex items-center justify-center gap-3 text-ink">
            <Stars note={c.noteGlobale} />
            <span className="font-semibold">{c.noteGlobale.toFixed(1)}/5</span>
            {c.nombre && <span className="text-muted">· {c.nombre} avis</span>}
          </div>
        </Reveal>
      )}

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {c.items.map((a, i) => (
          <Reveal key={i} delay={(i % 3) * 0.06}>
            <figure className="flex h-full flex-col rounded-theme border border-border bg-surface p-7 shadow-sm">
              <Quote className="size-8 text-brand-200" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                “{a.texte}”
              </blockquote>
              <figcaption className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
                <div>
                  <p className="font-semibold text-ink">{a.auteur}</p>
                  {a.ville && <p className="text-sm text-muted">{a.ville}</p>}
                </div>
                {a.note && <Stars note={a.note} />}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      {c.disclaimer && <p className="mt-6 text-center text-xs text-muted-2">{c.disclaimer}</p>}
    </Section>
  );
}
