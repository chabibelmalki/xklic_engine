import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { AzulejoHeading } from "../ui/Azulejo";

/**
 * ÉTAPES azulejo — une frise de CARREAUX NUMÉROTÉS. Chaque étape est une tomette
 * émaillée portant un grand chiffre en serif haute (le numéro peint sur le
 * carreau), l'icône dans une pastille émaillée, puis le texte. Distinct des
 * chiffres creux de riso et des timelines classiques.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;

  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        {/* Titre porté par la config (donc traduit par locale) — jamais un libellé
            français en dur. */}
        <AzulejoHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((e, i) => (
            <li
              key={e.titre}
              className="relative isolate flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-7 shadow-[var(--shadow-card)]"
            >
              <span aria-hidden className="azulejo-glaze pointer-events-none absolute inset-0" />
              <div className="relative flex items-center justify-between">
                <span className="font-display text-[2.6rem] leading-none text-brand-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {e.icone && (
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon name={e.icone} className="size-5" />
                  </span>
                )}
              </div>
              <h3 className="relative mt-5 font-display text-lg leading-tight text-ink">
                {e.titre}
              </h3>
              <p className="relative mt-2.5 text-sm leading-relaxed text-muted">{e.texte}</p>
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
