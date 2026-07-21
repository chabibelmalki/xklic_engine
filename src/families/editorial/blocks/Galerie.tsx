import Image from "next/image";
import type { GalerieContent, GalerieImageItem } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { cn } from "@/lib/utils";
import { ImageCycle } from "@/components/ui/ImageCycle";
import { MutedVideo } from "@/components/ui/MutedVideo";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
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
                            <MutedVideo
                              src={video.url}
                              poster={video.poster}
                              ariaLabel={video.alt ?? `${k} — ${pair.legende ?? ""}`}
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
        ) : variant === "comparateur" ? (
          <div className="mt-12 space-y-10">
            {(c.avantApres ?? []).map((pair, i) =>
              pair.avant && pair.apres ? (
                <figure key={i} className="mx-auto max-w-2xl">
                  <BeforeAfterSlider
                    before={pair.avant}
                    after={pair.apres}
                    beforeLabel={pair.avantLabel ?? strings.galerie.before}
                    afterLabel={pair.apresLabel ?? strings.galerie.after}
                    ratioClassName={ratioClass(c.ratio ?? "3/4")}
                  />
                  {pair.legende && (
                    <figcaption className="mt-4 text-center text-sm text-muted">{pair.legende}</figcaption>
                  )}
                </figure>
              ) : null,
            )}
          </div>
        ) : variant === "bento" ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.slice(0, 4).map((it, i) => {
              const cell = [
                { pos: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3", img: "h-72 lg:h-full lg:flex-1 lg:min-h-0", obj: "object-center" },
                { pos: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2", img: "h-56", obj: "object-center" },
                { pos: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2", img: "h-56", obj: "object-center" },
                { pos: "sm:col-span-2 lg:col-start-2 lg:col-end-4 lg:row-start-2 lg:row-end-3", img: "h-64", obj: "object-top" },
              ][i];
              // Le focus peut être surchargé par image via `objectPosition` (top/center/bottom…).
              const objClass = it.objectPosition ? `object-${it.objectPosition}` : cell.obj;
              return (
                <figure key={i} className={cn("flex flex-col", cell.pos)}>
                  <div className={cn("relative w-full overflow-hidden bg-ink/5", cell.img)}>
                    <Image
                      src={it.image.url}
                      alt={it.image.alt ?? it.titre ?? "Réalisation"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className={cn("object-cover", objClass)}
                    />
                  </div>
                  {(it.titre || it.description) && (
                    <figcaption className="mt-3 border-t border-border pt-3">
                      {it.titre && <p className="font-display text-base font-semibold text-ink">{it.titre}</p>}
                      {it.description && <p className="mt-1 text-sm text-muted">{it.description}</p>}
                    </figcaption>
                  )}
                </figure>
              );
            })}
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
