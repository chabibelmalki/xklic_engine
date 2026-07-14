import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { EditorialHeading } from "../../editorial/ui/Heading";

/**
 * ÉTAPES épure — CARTES NUMÉROTÉES : chaque étape est une carte à filet avec un
 * grand chiffre de marque en filigrane, une icône en chip et le texte. Registre
 * net et lisible, cohérent avec les cartes services. 100 % tokens.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        <EditorialHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((it, i) => (
            <li
              key={it.titre}
              className="relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-7"
            >
              {/* Grand chiffre en filigrane. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-3 font-display text-7xl font-bold leading-none text-brand-50"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative mb-5 inline-grid size-11 place-items-center rounded-xl bg-brand-600 text-brand-contrast">
                <Icon name={it.icone} className="size-5" />
              </span>
              <h3 className="relative font-display text-lg font-bold text-ink">{it.titre}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted">{it.texte}</p>
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
