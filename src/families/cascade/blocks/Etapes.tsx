import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { CascadeSection } from "../ui/Section";
import { CascadeContainer } from "../ui/Container";
import { CascadeHeading } from "../ui/Heading";

/**
 * ÉTAPES cascade — « le courant » : nœuds ronds numérotés (dégradé bleu→vert)
 * enfilés sur un RAIL vertical dégradé, chaque étape dans une carte de surface
 * arrondie. Lecture fluide, descendante, comme un fil d'eau. Distinct des grands
 * numéros-filet éditoriaux et de la bande-procédure de signal. 100 % tokens.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  const items = c.items ?? [];

  return (
    <CascadeSection id="etapes" tone={tone}>
      <CascadeContainer>
        <CascadeHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <ol className="relative mt-12 space-y-5">
          {/* Rail dégradé continu (le fil d'eau). */}
          <span
            aria-hidden
            className="absolute left-[27px] top-4 bottom-4 w-[3px] rounded-full sm:left-[31px]"
            style={{ background: "linear-gradient(180deg, var(--brand-500), var(--accent-500))" }}
          />
          {items.map((step, i) => (
            <li key={step.titre} className="relative grid grid-cols-[auto_1fr] items-start gap-5">
              <span
                className={cn(
                  "relative z-10 grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-extrabold text-white ring-4 ring-bg sm:size-16",
                )}
                style={{ background: "linear-gradient(140deg, var(--brand-500), var(--accent-600))" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
                <div className="flex items-center gap-2.5">
                  {step.icone && (
                    <span className="grid size-8 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name={step.icone} className="size-4.5" />
                    </span>
                  )}
                  <h3 className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
                    {step.titre}
                  </h3>
                </div>
                <p className="mt-2 leading-relaxed text-muted">{step.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </CascadeContainer>
    </CascadeSection>
  );
}
