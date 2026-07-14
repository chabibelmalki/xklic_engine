import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { SignalHeading } from "../ui/Heading";

/**
 * ÉTAPES signal — BANDE de procédure à filets : chaque étape est une cellule
 * réglée portant un grand chiffre-repère en filigrane, une puce d'icône carrée à
 * arête d'accent et un intitulé d'étape en majuscules. Lue comme une chaîne
 * opératoire (gauche→droite), cohérente avec la grille bento des services et
 * distincte des cartes numérotées arrondies d'épure. 100 % tokens.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        <SignalHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <ol className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((it, i) => (
            <li key={it.titre} className="relative flex flex-col overflow-hidden bg-surface p-6 sm:p-7">
              {/* Chiffre-repère en filigrane. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-2 font-display text-6xl font-bold leading-none text-brand-50"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative mb-5 inline-grid size-11 place-items-center border-s-2 border-accent-500 bg-brand-600 text-brand-contrast">
                <Icon name={it.icone} className="size-5" />
              </span>
              <h3 className="relative font-display text-base font-bold uppercase tracking-wide text-ink">
                {it.titre}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted">{it.texte}</p>
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
