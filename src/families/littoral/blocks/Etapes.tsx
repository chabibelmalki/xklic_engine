import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { LittoralSection } from "../ui/Section";
import { LittoralContainer } from "../ui/Container";
import { LittoralHeading } from "../ui/Heading";

/**
 * « Comment ça se passe » — littoral : LIGNE DE MARÉE verticale. Un rail marine
 * relie des pastilles rondes (numéro serif, liseré doré = soleil du logo) ; le
 * contenu se déploie à droite, beaucoup d'air. Pas de cartes, pas d'ombres.
 * Couleurs 100 % tokens.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <LittoralSection id="etapes" tone={tone}>
      <LittoralContainer>
        <LittoralHeading
          kicker={c.eyebrow ?? "Simple et rapide"}
          title={c.titre ?? "Comment ça se passe"}
          lede={c.intro}
        />
        <ol className="mt-14 space-y-0">
          {c.items.map((step, i) => {
            const last = i === c.items.length - 1;
            return (
              <li key={step.titre} className="relative grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-8">
                {/* Rail de marée : trait vertical marine reliant les pastilles. */}
                {!last && (
                  <span
                    aria-hidden
                    className="absolute left-[1.4rem] top-12 bottom-0 w-px bg-brand-200 sm:left-[1.6rem]"
                  />
                )}
                <span className="relative z-10 grid size-11 place-items-center rounded-full bg-brand-600 font-display text-lg font-semibold tabular-nums text-brand-contrast ring-4 ring-accent-500/25 sm:size-[3.25rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={last ? "pb-0 pt-1" : "pb-12 pt-1"}>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                      {step.titre}
                    </h3>
                    {step.icone && (
                      <span className="text-brand-500">
                        <Icon name={step.icone} className="size-5" />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted">{step.texte}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </LittoralContainer>
    </LittoralSection>
  );
}
