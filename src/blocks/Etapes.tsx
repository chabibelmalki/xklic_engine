import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Bloc "comment ça marche". variant : "cartes-numerotees" (cartes, défaut) ·
 * "timeline-verticale" (fil vertical, pastilles numérotées) · "ligne-horizontale"
 * (étapes alignées sur une ligne, nœuds numérotés) · "sentier-alterne" (fil
 * central, cartes en quinconce gauche/droite — pack marine-premium).
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  const variant = block.variant ?? "cartes-numerotees";
  const cols = c.items.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  const header = (
    <Reveal>
      <SectionHeading
        eyebrow={c.eyebrow ?? "Simple et rapide"}
        title={c.titre ?? "Comment ça se passe"}
        intro={c.intro}
      />
    </Reveal>
  );

  if (variant === "timeline-verticale") {
    return (
      <Section id="etapes" tone={tone}>
        {header}
        <ol className="relative mx-auto mt-12 max-w-2xl space-y-9 border-s-2 border-border ps-9">
          {c.items.map((step, i) => (
            <li key={step.titre} className="relative">
              <Reveal delay={i * 0.06}>
                <span className="absolute -start-[3.05rem] grid size-9 place-items-center rounded-full bg-brand-600 font-display text-sm font-bold text-brand-contrast">
                  {i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-theme bg-brand-50 text-brand-600">
                    <Icon name={step.icone} className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink">{step.titre}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.texte}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>
    );
  }

  if (variant === "ligne-horizontale") {
    return (
      <Section id="etapes" tone={tone}>
        {header}
        <div className="relative mt-14">
          <div className="absolute inset-x-[12%] top-6 hidden h-0.5 bg-border md:block" aria-hidden />
          <ol className={`grid gap-x-6 gap-y-10 ${cols}`}>
            {c.items.map((step, i) => (
              <li key={step.titre} className="text-center">
                <Reveal delay={i * 0.06}>
                  <span className="relative z-10 mx-auto grid size-12 place-items-center rounded-full bg-brand-600 font-display text-lg font-bold text-brand-contrast">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">{step.titre}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{step.texte}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    );
  }

  if (variant === "sentier-alterne") {
    return (
      <Section id="etapes" tone={tone}>
        {header}
        <div className="relative mx-auto mt-14 max-w-3xl">
          <div className="absolute inset-y-2 start-4 w-px bg-border sm:start-1/2" aria-hidden />
          <ol className="space-y-10 sm:space-y-16">
            {c.items.map((step, i) => {
              const onRight = i % 2 === 1;
              return (
                <li key={step.titre} className="relative ps-12 sm:ps-0">
                  <Reveal delay={i * 0.08} className="relative">
                    <span className="absolute start-4 top-1 z-10 grid size-9 -translate-x-1/2 place-items-center rounded-full border-2 border-bg bg-brand-600 font-display text-sm font-bold text-brand-contrast sm:start-1/2">
                      {i + 1}
                    </span>
                    <div className="sm:grid sm:grid-cols-2 sm:items-start sm:gap-10">
                      <div className={onRight ? "sm:col-start-2" : "sm:col-start-1 sm:row-start-1"}>
                        <div
                          className={cn(
                            "rounded-theme border border-border bg-surface p-6",
                            !onRight && "sm:text-end",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600",
                              !onRight && "sm:ms-auto",
                            )}
                          >
                            <Icon name={step.icone} className="size-5" />
                          </span>
                          <h3 className="mt-3 font-display text-lg font-bold text-ink">{step.titre}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted">{step.texte}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>
    );
  }

  return (
    <Section id="etapes" tone={tone}>
      {header}
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
