import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";

/**
 * « Comment ça se passe » — éditorial : liste verticale à GRANDS numéros serif et
 * filets fins. Pas de cartes, pas d'ombres. Beaucoup d'air.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        <EditorialHeading kicker={c.eyebrow ?? "Simple et rapide"} title={c.titre ?? "Comment ça se passe"} lede={c.intro} />
        <ol className="mt-14 border-t border-border">
          {c.items.map((step, i) => (
            <li
              key={step.titre}
              className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-border py-9 sm:grid-cols-[auto_auto_1fr] sm:gap-x-10 sm:items-baseline"
            >
              <span className="font-display text-3xl font-semibold tabular-nums text-brand-600 sm:text-4xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              {step.icone ? (
                <span className="hidden text-brand-600 sm:block">
                  <Icon name={step.icone} className="size-6" />
                </span>
              ) : (
                <span className="hidden sm:block" />
              )}
              <div>
                <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">{step.titre}</h3>
                <p className="mt-2 max-w-xl leading-relaxed text-muted">{step.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
