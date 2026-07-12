import type { GalerieContent, GalerieImageItem } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { ImageCycle } from "@/components/ui/ImageCycle";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";
import { EditorialImage } from "../ui/Image";

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
 * Galerie éditoriale — 100 % SSR pour les grilles NETTES (magazine, sans radius
 * ni ombre). Gère aussi : paires avant/après (image OU vidéo OU diaporama
 * `apresImages`) et cartes-chantiers `groupes` (une carte dont les photos
 * basculent). Le diaporama est le seul morceau client (voir `ImageCycle`).
 */
export function Galerie({ block, tone, strings }: BlockComponentProps<GalerieContent>) {
  const c = block.content;
  const variant = block.variant ?? "grille";
  const images: GalerieImageItem[] = c.images ?? [];
  const groupes = c.groupes ?? [];

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
                  {(["avant", "apres"] as const).map((k) => {
                    const video = k === "avant" ? pair.avantVideo : pair.apresVideo;
                    const cycle = (k === "avant" ? pair.avantImages : pair.apresImages) ?? [];
                    const img = pair[k];
                    return (
                      <div key={k} className="relative">
                        {video ? (
                          <div className="relative aspect-square overflow-hidden bg-ink/5">
                            <video
                              src={video.url}
                              poster={video.poster}
                              controls
                              playsInline
                              preload="metadata"
                              aria-label={video.alt ?? `${k} — ${pair.legende ?? ""}`}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          </div>
                        ) : cycle.length > 0 ? (
                          <div className="relative aspect-square overflow-hidden bg-ink/5">
                            <ImageCycle fill images={cycle} sizes="(max-width: 768px) 50vw, 25vw" />
                          </div>
                        ) : img ? (
                          <EditorialImage
                            src={img.url}
                            alt={img.alt ?? `${k} — ${pair.legende ?? ""}`}
                            ratio="1/1"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : null}
                        <span className="pointer-events-none absolute start-3 top-3 z-10 text-xs font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
                          {k === "avant" ? strings.galerie.before : strings.galerie.after}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {pair.legende && (
                  <figcaption className="mt-3 text-sm text-muted">{pair.legende}</figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : groupes.length > 0 ? (
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {groupes.map((g, i) => (
              <figure key={i}>
                <div className="relative overflow-hidden">
                  <ImageCycle
                    images={g.images}
                    ratioClassName={ratioClass(c.ratio)}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                {(g.titre || g.description) && (
                  <figcaption className="mt-4 border-t border-border pt-4">
                    {g.titre && <p className="font-display text-lg font-semibold text-ink">{g.titre}</p>}
                    {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
                  </figcaption>
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
