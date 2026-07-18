import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { ArondeSection } from "../ui/Section";
import { ArondeContainer } from "../ui/Container";
import { ArondeHeading } from "../ui/Heading";

/**
 * « Comment ça se passe » — aronde : ASSEMBLAGE vertical. Un rail bois relie des
 * MORTAISES carrées (numéro slab, liseré caramel) ; le contenu se déploie à
 * droite, beaucoup d'air. Pas de cartes, pas d'ombres : des pièces alignées au
 * cordeau. Couleurs 100 % tokens.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <ArondeSection id="etapes" tone={tone}>
      <ArondeContainer>
        <ArondeHeading
          kicker={c.eyebrow ?? "Du relevé à la pose"}
          title={c.titre ?? "Comment ça se passe"}
          lede={c.intro}
        />
        <ol className="mt-14 space-y-0">
          {c.items.map((step, i) => {
            const last = i === c.items.length - 1;
            return (
              <li key={step.titre} className="relative grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-8">
                {/* Rail bois : trait vertical reliant les mortaises. */}
                {!last && (
                  <span
                    aria-hidden
                    className="absolute left-[1.4rem] top-12 bottom-0 w-px bg-brand-200 sm:left-[1.6rem]"
                  />
                )}
                <span className="relative z-10 grid size-11 place-items-center rounded-[3px] bg-brand-800 font-display text-lg font-bold tabular-nums text-white ring-4 ring-accent-500/25 sm:size-[3.25rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={last ? "pb-0 pt-1.5" : "pb-12 pt-1.5"}>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                      {step.titre}
                    </h3>
                    {step.icone && (
                      <span className="text-brand-700">
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
      </ArondeContainer>
    </ArondeSection>
  );
}
