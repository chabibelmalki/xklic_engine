"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, Star } from "lucide-react";
import type { ProduitsContent, ProduitItem, ProduitCategorie } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { formatEUR, cn, withBase } from "@/lib/utils";
import { localeDir } from "@/lib/i18n";

function priceLabel(prix?: number | string): string | null {
  if (prix === undefined || prix === "") return null;
  return typeof prix === "number" ? formatEUR(prix) : prix;
}

/**
 * Produits — catalogue de VENTE : grille de cartes « photo + nom + prix »,
 * regroupables par catégorie. Comble le trou entre `tarifs` (prix sans photo)
 * et `galerie` (photo sans prix). Les photos ouvrent une visionneuse plein
 * écran (clavier + piège de focus), réutilisant les libellés de la galerie.
 */
export function Produits({
  block,
  index,
  basePath = "",
  locale,
  strings,
}: BlockComponentProps<ProduitsContent>) {
  const c = block.content;
  const lightboxOn = c.lightbox !== false;
  const isRtl = localeDir(locale) === "rtl";
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  // Catégories normalisées : soit `categories`, soit une catégorie unique `items`.
  const categories: ProduitCategorie[] = c.categories?.length
    ? c.categories
    : [{ items: c.items ?? [] }];

  // Index plat des articles AVEC photo (pour la visionneuse) : on numérote
  // chaque carte par sa position globale, mais seules les photos sont navigables.
  const withPhotos: { item: ProduitItem; key: string }[] = [];
  categories.forEach((cat, ci) =>
    cat.items.forEach((item, ii) => {
      if (item.image) withPhotos.push({ item, key: `${ci}-${ii}` });
    }),
  );
  const photoIndex = new Map(withPhotos.map((p, i) => [p.key, i]));

  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? i : (i + dir + withPhotos.length) % withPhotos.length)),
    [withPhotos.length],
  );

  useEffect(() => {
    if (open === null) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "Tab") {
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

  const current = open === null ? null : withPhotos[open].item;

  return (
    <Section id="produits" tone={toneForIndex(index)}>
      <Reveal>
        <SectionHeading
          eyebrow={c.eyebrow ?? strings.produits.defaultTitle}
          title={c.titre ?? strings.produits.defaultTitle}
          intro={c.intro}
        />
      </Reveal>

      <div className="mt-12 space-y-12">
        {categories.map((cat, ci) => (
          <div key={ci}>
            {(cat.titre || cat.description) && (
              <Reveal>
                <div className="mb-6 border-s-2 border-brand-200 ps-4">
                  {cat.titre && (
                    <h3 className="font-display text-xl font-bold text-ink">{cat.titre}</h3>
                  )}
                  {cat.description && (
                    <p className="mt-1 text-sm text-muted">{cat.description}</p>
                  )}
                </div>
              </Reveal>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item, ii) => {
                const price = priceLabel(item.prix);
                const pIdx = photoIndex.get(`${ci}-${ii}`);
                const clickable = lightboxOn && item.image && pIdx !== undefined;
                return (
                  <Reveal key={item.nom} delay={(ii % 3) * 0.05}>
                    <article
                      className={cn(
                        "group flex h-full flex-col overflow-hidden rounded-theme border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/5",
                        item.populaire ? "border-brand-500 ring-1 ring-brand-500" : "border-border hover:border-brand-200",
                      )}
                    >
                      {item.image &&
                        (clickable ? (
                          <button
                            type="button"
                            onClick={() => setOpen(pIdx!)}
                            aria-label={item.nom}
                            className="relative block aspect-[4/3] w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          >
                            <Image
                              src={item.image.url}
                              alt={item.image.alt ?? item.nom}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                            <span className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-white/85 text-brand-700 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                              <ZoomIn className="size-4" />
                            </span>
                            {item.badge && (
                              <span className="absolute start-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-accent-contrast shadow-sm">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ) : (
                          <div className="relative aspect-[4/3] w-full overflow-hidden">
                            <Image
                              src={item.image.url}
                              alt={item.image.alt ?? item.nom}
                              fill
                              sizes="(max-width: 640px) 100vw, 33vw"
                              className="object-cover"
                            />
                            {item.badge && (
                              <span className="absolute start-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-accent-contrast shadow-sm">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        ))}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-display text-lg font-bold text-ink">{item.nom}</h4>
                          {item.populaire && (
                            <Star className="mt-1 size-4 shrink-0 fill-brand-500 text-brand-500" />
                          )}
                        </div>
                        {!item.image && item.badge && (
                          <span className="mt-2 w-fit rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-600 ring-1 ring-inset ring-accent-500/30">
                            {item.badge}
                          </span>
                        )}
                        {item.description && (
                          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
                            {item.description}
                          </p>
                        )}
                        {price && (
                          <p className="mt-4 flex items-baseline gap-1.5 border-t border-border pt-3">
                            <span className="font-display text-xl font-extrabold text-brand-700">
                              {price}
                            </span>
                            {item.unite && <span className="text-sm text-muted">{item.unite}</span>}
                          </p>
                        )}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {c.note && <p className="mt-8 text-center text-sm text-muted">{c.note}</p>}

      {c.cta && (
        <Reveal>
          <div className="mt-10 text-center">
            <Button href={withBase(basePath, c.cta.href)} size="lg">
              {c.cta.label}
            </Button>
          </div>
        </Reveal>
      )}

      {/* Visionneuse plein écran */}
      {current?.image && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={current.nom}
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
          {withPhotos.length > 1 && (
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
              alt={current.image.alt ?? current.nom}
              width={1000}
              height={1000}
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
              sizes="100vw"
            />
            <figcaption className="text-center text-sm font-medium text-white">
              {current.nom}
              {priceLabel(current.prix) && (
                <span className="text-white/70">
                  {" — "}
                  {priceLabel(current.prix)}
                  {current.unite ? ` ${current.unite}` : ""}
                </span>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </Section>
  );
}
