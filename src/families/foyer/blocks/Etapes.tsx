import { Check } from "lucide-react";
import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialSection } from "../../editorial/ui/Section";
import { EditorialContainer } from "../../editorial/ui/Container";
import { FoyerHeading } from "../ui/Heading";

/**
 * ÉTAPES foyer — une CHECK-LIST de maison : chaque étape est une carte
 * arrondie reliée par un fil COUTURE pointillé vertical, avec une case cochée
 * (✓) numérotée, un titre serif et un texte posé. Métaphore domestique
 * (« tout est coché »), distincte de la timeline à filets d'`editorial` et de
 * la bande-procédure de `signal`. Couleurs 100 % tokens.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        <FoyerHeading
          kicker={c.eyebrow ?? "en toute simplicité"}
          title={c.titre ?? "Comment ça se passe"}
          lede={c.intro}
        />
        <ol className="mt-12 space-y-4">
          {c.items.map((step, i) => (
            <li key={step.titre} className="relative ps-4">
              <div className="flex items-start gap-4 rounded-[var(--radius-card)] border border-brand-100 bg-surface p-5 shadow-[var(--shadow-card)] sm:gap-5 sm:p-6">
                <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-brand-contrast">
                  <Check className="size-5" strokeWidth={3} />
                  <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full border border-brand-100 bg-accent-500 text-xs font-bold text-accent-contrast">
                    {i + 1}
                  </span>
                </span>
                <div className="min-w-0 pt-1">
                  <div className="flex items-center gap-2">
                    {step.icone && (
                      <Icon name={step.icone} className="size-5 shrink-0 text-brand-500" />
                    )}
                    <h3 className="font-display text-xl font-semibold text-ink">{step.titre}</h3>
                  </div>
                  <p className="mt-2 leading-relaxed text-muted">{step.texte}</p>
                </div>
              </div>
              {/* Fil couture reliant les cartes (sauf après la dernière). */}
              {i < c.items.length - 1 && (
                <span
                  aria-hidden
                  className="absolute bottom-[-1rem] left-[1.6rem] top-[3.6rem] w-px border-l-2 border-dashed border-brand-200"
                />
              )}
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
