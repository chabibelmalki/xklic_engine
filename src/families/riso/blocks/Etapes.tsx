import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { RisoHeading } from "../ui/Riso";

/**
 * ÉTAPES riso — les PASSES D'IMPRESSION : une colonne par étape, chacune coiffée
 * d'un chiffre géant tiré en CONTOUR (`text-stroke`), c'est-à-dire l'encre
 * évidée. Les colonnes sont séparées par un filet de coupe, pas par des cartes.
 *
 * Le chiffre creux distingue ce bloc des gros numéros pleins déjà utilisés
 * ailleurs dans le parc : ici le nombre est une réserve, pas un aplat.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;

  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        {/* Titre porté par la config (donc traduit par locale) — jamais un libellé
            français en dur, comme le fait `signal`. */}
        <RisoHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <ol className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((e, i) => (
            <li key={e.titre} className="relative flex flex-col bg-bg p-7 sm:p-8">
              <span
                aria-hidden
                className="riso-mono text-[3.5rem] font-bold leading-none text-transparent [-webkit-text-stroke:2px_var(--brand-500)]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 flex items-center gap-2.5 font-display text-lg uppercase leading-tight text-ink">
                {e.icone && (
                  <span className="text-accent-500">
                    <Icon name={e.icone} className="size-5 shrink-0" />
                  </span>
                )}
                {e.titre}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{e.texte}</p>
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
