import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { PrestigeSection } from "../ui/Section";
import { PrestigeContainer } from "../ui/Container";
import { PrestigeHeading } from "../ui/Heading";

/**
 * « Comment ça se passe » — prestige : liste verticale à GROS numéros dorés et
 * filets métalliques, registre sombre. Pas de cartes, beaucoup d'air.
 */
export function Etapes({ block }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <PrestigeSection id="etapes" surface="panel">
      <PrestigeContainer>
        <PrestigeHeading
          kicker={c.eyebrow ?? "Simple et rapide"}
          title={c.titre ?? "Comment ça se passe"}
          lede={c.intro}
        />
        <ol className="mt-16 border-t border-[var(--px-line)]">
          {c.items.map((step, i) => (
            <li
              key={step.titre}
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b border-[var(--px-line)] py-9 sm:grid-cols-[auto_auto_1fr] sm:gap-x-10"
            >
              <span className="font-display text-3xl font-semibold tabular-nums leading-none text-[var(--px-gold)] sm:text-4xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              {step.icone ? (
                <span className="hidden text-[var(--px-gold)] sm:block">
                  <Icon name={step.icone} className="size-6" />
                </span>
              ) : (
                <span className="hidden sm:block" />
              )}
              <div>
                <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
                  {step.titre}
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-[var(--px-ink-soft)]">
                  {step.texte}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </PrestigeContainer>
    </PrestigeSection>
  );
}
