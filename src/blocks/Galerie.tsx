"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { GalerieContent, GalerieVariant, GalerieImageItem } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ImageCycle } from "@/components/ui/ImageCycle";
import { localeDir } from "@/lib/i18n";

function ratioClass(ratio?: string, fallback = "aspect-[4/3]") {
  switch (ratio) {
    case "3/4":
      return "aspect-[3/4]";
    case "1/1":
      return "aspect-square";
    case "4/3":
      return "aspect-[4/3]";
    case "16/10":
      return "aspect-[16/10]";
    default:
      return fallback;
  }
}

/**
 * Galerie. variant : "avant-apres" (paires statiques) · "montage" / "produits" /
 * "grille" (vignettes cliquables -> visionneuse plein écran avec clavier).
 */
export function Galerie({ block, tone, locale, strings }: BlockComponentProps<GalerieContent>) {
  const c = block.content;
  const variant = (block.variant as GalerieVariant | "montage" | "masonry") ?? "grille";
  const images: GalerieImageItem[] = c.images ?? [];
  const groupes = c.groupes ?? [];
  const lightboxOn = c.lightbox !== false && variant !== "avant-apres" && images.length > 0;
  const pastille = c.pastille ?? (variant === "montage" ? strings.galerie.beforeAfter : undefined);
  const isRtl = localeDir(locale) === "rtl";
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const isMontage = variant === "montage";
  const tileRatio = ratioClass(c.ratio, isMontage ? "aspect-[3/4]" : "aspect-[4/3]");

  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    // Mémorise l'élément déclencheur pour restaurer le focus à la fermeture.
    restoreRef.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "Tab") {
        // Piège le focus dans la visionneuse.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Déplace le focus dans la modale (bouton Fermer).
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      restoreRef.current?.focus?.();
    };
  }, [open, close, move]);

  const current = open === null ? null : images[open];

  return (
    <Section id="galerie" tone={tone}>
      <Reveal>
        <SectionHeading
          eyebrow={c.eyebrow ?? strings.galerie.defaultTitle}
          title={c.titre ?? (variant === "avant-apres" ? strings.galerie.beforeAfter : strings.galerie.defaultTitle)}
          intro={c.intro}
        />
      </Reveal>

      {variant === "avant-apres" ? (
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {(c.avantApres ?? []).map((pair, i) => (
            <Reveal key={i} delay={(i % 2) * 0.05}>
              <figure className="overflow-hidden rounded-theme border border-border bg-surface shadow-sm">
                <div className="grid grid-cols-2">
                  {(["avant", "apres"] as const).map((k) => {
                    const video = k === "avant" ? pair.avantVideo : pair.apresVideo;
                    const cycle = (k === "avant" ? pair.avantImages : pair.apresImages) ?? [];
                    const img = pair[k];
                    return (
                      <div key={k} className="relative aspect-square bg-ink/5">
                        {video ? (
                          <video
                            src={video.url}
                            poster={video.poster}
                            controls
                            playsInline
                            preload="metadata"
                            aria-label={video.alt ?? `${k} — ${pair.legende ?? ""}`}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : cycle.length > 0 ? (
                          <ImageCycle fill images={cycle} sizes="(max-width: 768px) 50vw, 25vw" />
                        ) : img ? (
                          <Image
                            src={img.url}
                            alt={img.alt ?? `${k} — ${pair.legende ?? ""}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : null}
                        <span className="pointer-events-none absolute start-2 top-2 z-10 rounded-full bg-ink/75 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                          {k === "avant" ? strings.galerie.before : strings.galerie.after}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {pair.legende && (
                  <figcaption className="px-4 py-3 text-sm text-muted">{pair.legende}</figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      ) : groupes.length > 0 ? (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groupes.map((g, i) => (
            <Reveal key={i} delay={(i % 3) * 0.05}>
              <figure className="group overflow-hidden rounded-theme border border-border bg-surface shadow-sm">
                <ImageCycle
                  images={g.images}
                  ratioClassName={tileRatio}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {(g.titre || g.description) && (
                  <figcaption className="p-4">
                    {g.titre && <p className="font-medium text-ink">{g.titre}</p>}
                    {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      ) : variant === "masonry" ? (
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {images.map((item, i) => {
            const r = ["aspect-[3/4]", "aspect-[4/3]", "aspect-square", "aspect-[4/5]"][i % 4];
            const tile = (
              <div className={`relative ${r}`}>
                <Image
                  src={item.image.url}
                  alt={item.image.alt ?? item.titre ?? "Réalisation"}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            );
            return (
              <div key={i} className="break-inside-avoid">
                {lightboxOn ? (
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-label={`Agrandir : ${item.titre ?? "réalisation"}`}
                    className="group block w-full overflow-hidden rounded-theme border border-border bg-surface-2 shadow-sm transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    {tile}
                  </button>
                ) : (
                  <figure className="group overflow-hidden rounded-theme border border-border bg-surface shadow-sm">
                    {tile}
                  </figure>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((item, i) => (
            <Reveal key={i} delay={(i % 3) * 0.05}>
              {lightboxOn ? (
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Agrandir : ${item.titre ?? "réalisation"}`}
                  className="group relative block w-full overflow-hidden rounded-theme border border-border bg-surface-2 text-start shadow-sm transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <div className={`relative ${tileRatio}`}>
                    <Image
                      src={item.image.url}
                      alt={item.image.alt ?? item.titre ?? "Réalisation"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-white/85 text-brand-700 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                      <ZoomIn className="size-4" />
                    </span>
                  </div>
                  {(item.titre || pastille) && (
                    <div className="flex items-center justify-between gap-3 px-5 py-4">
                      {item.titre && (
                        <p className="text-sm font-semibold text-ink">{item.titre}</p>
                      )}
                      {pastille && (
                        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                          {pastille}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ) : (
                <figure className="group overflow-hidden rounded-theme border border-border bg-surface shadow-sm">
                  <div className={`relative ${tileRatio}`}>
                    <Image
                      src={item.image.url}
                      alt={item.image.alt ?? item.titre ?? "Réalisation"}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {(item.titre || item.description) && (
                    <figcaption className="p-4">
                      {item.titre && <p className="font-medium text-ink">{item.titre}</p>}
                      {item.description && (
                        <p className="mt-1 text-sm text-muted">{item.description}</p>
                      )}
                    </figcaption>
                  )}
                </figure>
              )}
            </Reveal>
          ))}
        </div>
      )}

      {/* Visionneuse plein écran */}
      {current && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={current.titre ?? "Photo"}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={strings.galerie.close}
          >
            <X className="size-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(-1);
                }}
                className="absolute start-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:start-6"
                aria-label={strings.galerie.prev}
              >
                <PrevIcon className="size-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                className="absolute end-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:end-6"
                aria-label={strings.galerie.next}
              >
                <NextIcon className="size-6" />
              </button>
            </>
          )}
          <figure
            className="flex max-h-full flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.image.url}
              alt={current.image.alt ?? current.titre ?? "Réalisation"}
              width={1000}
              height={1333}
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
              sizes="100vw"
            />
            {current.titre && (
              <figcaption className="text-center text-sm font-medium text-white">
                {current.titre}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </Section>
  );
}
