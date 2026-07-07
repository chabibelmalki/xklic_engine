import type { GalerieContent, GalerieImageItem } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";
import { EditorialImage } from "../ui/Image";

/**
 * Galerie éditoriale — 100 % SSR (aucune visionneuse/JS) : photos NETTES en
 * grille magazine, sans radius ni ombre. Gère aussi les paires avant/après.
 */
export function Galerie({ block, tone, strings }: BlockComponentProps<GalerieContent>) {
  const c = block.content;
  const variant = block.variant ?? "grille";
  const images: GalerieImageItem[] = c.images ?? [];

  return (
    <EditorialSection id="galerie" tone={tone}>
      <EditorialContainer>
        <EditorialHeading
          kicker={c.eyebrow ?? strings.galerie.defaultTitle}
          title={c.titre ?? (variant === "avant-apres" ? strings.galerie.beforeAfter : strings.galerie.defaultTitle)}
          lede={c.intro}
        />

        {variant === "avant-apres" ? (
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {(c.avantApres ?? []).map((pair, i) => (
              <figure key={i}>
                <div className="grid grid-cols-2 gap-1">
                  {(["avant", "apres"] as const).map((k) => (
                    <div key={k} className="relative">
                      <EditorialImage
                        src={pair[k].url}
                        alt={pair[k].alt ?? `${k} — ${pair.legende ?? ""}`}
                        ratio="1/1"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <span className="absolute start-3 top-3 text-xs font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
                        {k === "avant" ? strings.galerie.before : strings.galerie.after}
                      </span>
                    </div>
                  ))}
                </div>
                {pair.legende && (
                  <figcaption className="mt-3 text-sm text-muted">{pair.legende}</figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item, i) => (
              <figure key={i}>
                <EditorialImage
                  src={item.image.url}
                  alt={item.image.alt ?? item.titre ?? "Réalisation"}
                  ratio={c.ratio ?? "4/3"}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                {(item.titre || item.description) && (
                  <figcaption className="mt-4 border-t border-border pt-4">
                    {item.titre && <p className="font-display text-lg font-semibold text-ink">{item.titre}</p>}
                    {item.description && <p className="mt-1 text-sm text-muted">{item.description}</p>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
