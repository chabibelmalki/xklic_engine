import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { EscaleHeading } from "../ui/Escale";

/**
 * ÉTAPES escale — l'ITINÉRAIRE d'une intervention, lu comme une séquence de vol.
 * Chaque étape est une ESCALE numérotée : grand indice mono, filet de route
 * pointillé en tête (`.escale-perf` horizontal), icône en pastille d'accent,
 * puis le texte. Distinct des timelines classiques et des tomettes d'azulejo.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;

  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        <EscaleHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((e, i) => (
            <li
              key={e.titre}
              className="relative isolate flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
            >
              {/* Filet de route pointillé en tête de carte. */}
              <span aria-hidden className="escale-perf-h absolute inset-x-6 top-0 h-px" />
              <div className="flex items-center justify-between">
                <span className="escale-mono font-display text-[3rem] leading-none text-brand-800">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {e.icone && (
                  <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-btn)] bg-brand-50 text-brand-700">
                    <Icon name={e.icone} className="size-5" />
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-display text-xl leading-tight text-ink">{e.titre}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{e.texte}</p>
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
