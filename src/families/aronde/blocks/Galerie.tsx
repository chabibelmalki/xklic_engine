import type { GalerieContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { ArondeSection } from "../ui/Section";
import { ArondeContainer } from "../ui/Container";
import { ArondeHeading } from "../ui/Heading";
import { ArondeImage } from "../ui/Image";
import { miterTR } from "../ui/miter";

/** Ratio du cadre (aligné sur ui/Image). */
function ratioClass(ratio?: string) {
  switch (ratio) {
    case "1/1":
      return "aspect-square";
    case "4/5":
      return "aspect-[4/5]";
    case "3/4":
      return "aspect-[3/4]";
    case "3/2":
      return "aspect-[3/2]";
    case "16/9":
      return "aspect-[16/9]";
    case "4/3":
    default:
      return "aspect-[4/3]";
  }
}

/**
 * GALERIE aronde — les RÉALISATIONS de l'atelier. Deux grammaires :
 *  - variant `avant-apres` → COMPARATEUR À CURSEUR (`BeforeAfterSlider` partagé) :
 *    une seule image, on fait glisser la poignée pour dévoiler l'après. Posé dans
 *    un panneau à coupe d'onglet, légende en pied sur filet caramel.
 *  - sinon → GRILLE de cadres à coupe d'onglet (photos de chantier), titre et
 *    description optionnels sous chaque cliché.
 * Couleurs 100 % tokens.
 */
export function Galerie({ block, tone, strings }: BlockComponentProps<GalerieContent>) {
  const c = block.content;
  const variant = block.variant;
  const pairs = (c.avantApres ?? []).filter((p) => p.avant?.url && p.apres?.url);
  const images = c.images ?? [];

  return (
    <ArondeSection id="galerie" tone={tone}>
      <ArondeContainer wide>
        <ArondeHeading
          kicker={c.eyebrow}
          title={c.titre ?? strings.galerie.defaultTitle}
          lede={c.intro}
        />

        {variant === "avant-apres" && pairs.length > 0 ? (
          <div
            className={
              pairs.length === 1
                ? "mx-auto mt-14 max-w-2xl"
                : "mt-14 grid gap-10 md:grid-cols-2"
            }
          >
            {pairs.map((pair, i) => (
              <figure key={i}>
                <div style={miterTR(22)} className="overflow-hidden ring-1 ring-brand-100">
                  <BeforeAfterSlider
                    before={{ url: pair.avant!.url, alt: pair.avant!.alt }}
                    after={{ url: pair.apres!.url, alt: pair.apres!.alt }}
                    beforeLabel={strings.galerie.before}
                    afterLabel={strings.galerie.after}
                    ratioClassName={ratioClass(c.ratio ?? "4/3")}
                  />
                </div>
                {pair.legende && (
                  <figcaption className="mt-4 border-t-[3px] border-accent-500 pt-4 text-sm leading-relaxed text-muted">
                    {pair.legende}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((it, i) => (
              <figure key={`${it.image.url}-${i}`}>
                <ArondeImage
                  src={it.image.url}
                  alt={it.image.alt ?? it.titre ?? ""}
                  ratio={c.ratio ?? "4/3"}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                {(it.titre || it.description) && (
                  <figcaption className="mt-4">
                    <div className="mb-3 h-[3px] w-10 bg-accent-500" />
                    {it.titre && (
                      <h3 className="font-display text-lg font-bold text-ink">{it.titre}</h3>
                    )}
                    {it.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{it.description}</p>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </ArondeContainer>
    </ArondeSection>
  );
}
