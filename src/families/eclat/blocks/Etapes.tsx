import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { EclatHeading } from "../ui/Eclat";

/**
 * ÉTAPES éclat — une suite AÉRÉE : chaque étape est menée par un grand numéro en
 * serif éditoriale (léger, élégant), séparée des voisines par un simple filet.
 * Pas de carte pleine : le numéro et le trait suffisent.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;

  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        {/* Titre porté par la config (donc traduit par locale). */}
        <EclatHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((e, i) => (
            <li key={e.titre} className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl leading-none text-brand-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {e.icone && (
                  <span className="text-brand-400">
                    <Icon name={e.icone} className="size-5" />
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-display text-lg leading-tight text-ink">{e.titre}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{e.texte}</p>
            </li>
          ))}
        </ol>
      </EditorialContainer>
    </EditorialSection>
  );
}
