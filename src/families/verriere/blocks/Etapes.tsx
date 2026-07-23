import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Icon } from "@/components/ui/Icon";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { Medaillon, VerriereHeading } from "../ui/Verriere";

/**
 * ÉTAPES verrière — une TIGE qui court d'un médaillon à l'autre. Les étapes ne
 * sont pas des cartes mais des fleurons montés sur une même tige végétale
 * (tracée au scroll comme le coup de fouet), chacun coiffé d'un médaillon de
 * ferronnerie portant son chiffre. La tige ne s'affiche qu'en grand écran, où
 * elle a la place de filer ; en mobile la lecture reste une simple colonne.
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;

  return (
    <EditorialSection id="etapes" tone={tone}>
      <EditorialContainer>
        {/* Titre porté par la config (donc traduit par locale) — jamais un
            libellé français en dur. */}
        <VerriereHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} align="center" />

        <div className="relative mt-16">
          {/* LA TIGE — passe derrière les médaillons, alignée sur leur centre. */}
          <svg
            aria-hidden
            viewBox="0 0 240 32"
            fill="none"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-[8%] top-9 hidden h-8 text-accent-500/60 lg:block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="verriere-trace"
              d="M2 22C40 22 52 6 92 10c36 4 40 17 68 16 26-1 30-14 46-14 12 0 16 8 10 12-5 3-11 0-8-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {c.items.map((e, i) => (
              <li key={e.titre} className="flex flex-col items-center text-center">
                <Medaillon size="lg" className="ring-offset-[var(--bg)]">
                  <span className="font-display text-2xl leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Medaillon>
                {e.icone && (
                  <Icon name={e.icone} className="mt-5 size-5 text-accent-600" />
                )}
                <h3 className="mt-3 font-display text-lg leading-tight text-ink">{e.titre}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{e.texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </EditorialContainer>
    </EditorialSection>
  );
}
