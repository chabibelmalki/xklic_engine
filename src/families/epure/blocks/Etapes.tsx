import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { EpureHeading } from "../ui/Heading";

/**
 * ÉTAPES atelier — cartes à bordure épaisse et GROS CHIFFRE de marque, icône en
 * chip. Registre affirmé, cohérent avec les cartes services. 100 % tokens.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        <EpureHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((it, i) => (
            <li
              key={it.titre}
              className="relative flex flex-col rounded-[var(--radius-card)] border-2 border-brand-800 bg-surface p-7"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-6xl font-bold leading-none text-brand-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid size-11 place-items-center rounded-[0.5rem] bg-brand-800 text-brand-contrast">
                  <Icon name={it.icone} className="size-5" />
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink">{it.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{it.texte}</p>
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
