import Image from "next/image";
import type { GalerieContent, GalerieImageItem } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { ImageCycle } from "@/components/ui/ImageCycle";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { cn } from "@/lib/utils";
import { CascadeSection } from "../ui/Section";
import { CascadeContainer } from "../ui/Container";
import { CascadeHeading } from "../ui/Heading";

function ratioClass(ratio?: string): string {
  switch (ratio) {
    case "3/4":
      return "aspect-[3/4]";
    case "1/1":
      return "aspect-square";
    case "16/10":
      return "aspect-[16/10]";
    case "4/5":
      return "aspect-[4/5]";
    case "4/3":
    default:
      return "aspect-[4/3]";
  }
}

/**
 * GALERIE cascade. Pour `variant: "avant-apres"`, chaque paire est rendue en
 * COMPARATEUR à CURSEUR (une seule image, on glisse pour dévoiler l'après) —
 * signature « réalisations » demandée par le client. Sinon : grille de cartes
 * arrondies (ombre douce) ou diaporamas `groupes`. 100 % tokens.
 */
export function Galerie({ block, tone, strings }: BlockComponentProps<GalerieContent>) {
  const c = block.content;
  const variant = block.variant ?? "grille";
  const images: GalerieImageItem[] = c.images ?? [];
  const groupes = c.groupes ?? [];

  return (
    <CascadeSection id="galerie" tone={tone}>
      <CascadeContainer>
        <CascadeHeading
          kicker={c.eyebrow ?? strings.galerie.defaultTitle}
          title={c.titre ?? (variant === "avant-apres" ? strings.galerie.beforeAfter : strings.galerie.defaultTitle)}
          lede={c.intro}
        />

        {variant === "avant-apres" ? (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {(c.avantApres ?? []).map((pair, i) =>
              pair.avant && pair.apres ? (
                <figure key={i}>
                  {pair.legende && (
                    <figcaption className="mb-4 font-display text-base font-semibold leading-snug text-ink">
                      {pair.legende}
                    </figcaption>
                  )}
                  <BeforeAfterSlider
                    before={{ url: pair.avant.url, alt: pair.avant.alt }}
                    after={{ url: pair.apres.url, alt: pair.apres.alt }}
                    beforeLabel={strings.galerie.before}
                    afterLabel={strings.galerie.after}
                    ratioClassName={ratioClass(c.ratio ?? "4/3")}
                  />
                </figure>
              ) : null,
            )}
          </div>
        ) : groupes.length > 0 ? (
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {groupes.map((g, i) => (
              <figure key={i}>
                <div className="overflow-hidden rounded-[var(--radius-image)] shadow-[var(--shadow-card)]">
                  <ImageCycle images={g.images} ratioClassName={ratioClass(c.ratio)} sizes="(max-width: 640px) 100vw, 33vw" />
                </div>
                {(g.titre || g.description) && (
                  <figcaption className="mt-4">
                    {g.titre && <p className="font-display text-lg font-bold text-ink">{g.titre}</p>}
                    {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item, i) => (
              <figure key={i}>
                <div className={cn("relative overflow-hidden rounded-[var(--radius-image)] shadow-[var(--shadow-card)]", ratioClass(c.ratio ?? "4/3"))}>
                  <Image
                    src={item.image.url}
                    alt={item.image.alt ?? item.titre ?? "Réalisation"}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                {(item.titre || item.description) && (
                  <figcaption className="mt-4">
                    {item.titre && <p className="font-display text-lg font-bold text-ink">{item.titre}</p>}
                    {item.description && <p className="mt-1 text-sm text-muted">{item.description}</p>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </CascadeContainer>
    </CascadeSection>
  );
}
