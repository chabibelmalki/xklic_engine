import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

/** Bloc "comment ça marche" : étapes numérotées avec icône. */
export function Etapes({ block, index }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  const cols = c.items.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <Section id="etapes" tone={toneForIndex(index)}>
      <Reveal>
        <SectionHeading
          eyebrow={c.eyebrow ?? "Simple et rapide"}
          title={c.titre ?? "Comment ça se passe"}
          intro={c.intro}
        />
      </Reveal>
      <div className={`mt-12 grid gap-6 ${cols}`}>
        {c.items.map((step, i) => (
          <Reveal key={step.titre} delay={i * 0.08}>
            <div className="relative h-full rounded-theme border border-border bg-surface p-7">
              <span className="absolute end-6 top-6 font-display text-4xl font-extrabold text-brand-100">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon name={step.icone} className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{step.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.texte}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
