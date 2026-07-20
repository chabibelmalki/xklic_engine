import Image from "next/image";
import { Check } from "lucide-react";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";
import { AzulejoFrieze, AzulejoWall, TileChip, TileMotif } from "../ui/Azulejo";

/**
 * HERO azulejo — un pan de mur en FAÏENCE, clair et aéré. Le fond est du blanc
 * cassé (`bg-alt`) parcouru d'une grille de joints très pâle : une surface
 * céramique propre, pas un aplat d'encre saturé (l'inverse de riso).
 *
 * Le prix est une TOMETTE ÉMAILLÉE — un carreau clair à reflet d'émail, coins
 * arrondis doux, coiffé d'une frise de losanges : la seule pièce en relief de la
 * composition. Une frise ferme le bas du hero comme la bordure d'un panneau.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const card = c.card;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const trust = c.trust ?? [];
  const img = c.image;

  return (
    <header className="relative isolate overflow-hidden bg-alt text-ink">
      {/* Joints de carreaux, très pâles : la texture d'un mur émaillé. */}
      <AzulejoWall className="text-brand-500/[0.07]" />

      <EditorialContainer className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
        <div className="min-w-0">
          {c.eyebrow && <TileChip>{c.eyebrow}</TileChip>}
          <h1 className="mt-7 font-display text-[2.5rem] leading-[1.03] text-ink sm:text-6xl lg:text-[4rem]">
            {c.titre}
            {c.titreAccent && <span className="text-brand-600"> {c.titreAccent}</span>}
            {showVilleSuffix && <span className="text-brand-600"> à {ville}</span>}
          </h1>
          {c.accroche && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{c.accroche}</p>
          )}

          {(c.ctaPrimaire || secondary) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {c.ctaPrimaire && (
                <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                  {c.ctaPrimaire.label}
                </Button>
              )}
              {secondary && (
                <Button href={withBase(basePath, secondary.href)} variant="outline" size="lg">
                  {secondary.label}
                </Button>
              )}
            </div>
          )}

          {trust.length ? (
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {trust.map((t) => (
                <li
                  key={t.label}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink-soft"
                >
                  <Icon name={t.icone} className="size-4 shrink-0 text-brand-600" />
                  {t.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* TOMETTE — le carreau émaillé qui porte le prix (ou, à défaut, la photo). */}
        {card ? (
          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto">
            <div className="relative isolate overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-pop)]">
              {/* Reflet d'émail en haut du carreau. */}
              <span aria-hidden className="azulejo-glaze pointer-events-none absolute inset-0" />
              <AzulejoFrieze />
              <div className="relative px-7 pb-6 pt-7">
                {card.label && (
                  <p className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
                    <TileMotif className="size-3.5" />
                    {card.label}
                  </p>
                )}
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-[3.3rem] leading-none text-brand-700">
                    {card.prix}
                  </span>
                  {card.unite && (
                    <span className="text-lg font-semibold text-muted">{card.unite}</span>
                  )}
                </p>
                {(card.mention || card.prixBarre) && (
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {card.mention}
                    {card.prixBarre && (
                      <span className="ms-1.5 text-muted line-through">{card.prixBarre}</span>
                    )}
                  </p>
                )}
              </div>
              {card.points?.length ? (
                <ul className="relative space-y-3 border-t border-border px-7 py-6">
                  {card.points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-ink-soft">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded bg-brand-600 text-brand-contrast">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {card.rating?.label && (
                <p className="relative border-t border-border px-7 py-4 text-xs uppercase tracking-[0.1em] text-muted">
                  {card.rating.label}
                </p>
              )}
            </div>
          </div>
        ) : (
          img?.url && (
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ms-auto">
              <div className="relative overflow-hidden rounded-xl border border-border shadow-[var(--shadow-pop)]">
                <AzulejoFrieze />
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  width={640}
                  height={520}
                  priority
                  className="aspect-[5/4] w-full object-cover"
                />
              </div>
            </div>
          )
        )}
      </EditorialContainer>

      {/* Frise de bas de panneau : la bordure du pan de faïence. */}
      <AzulejoFrieze className="absolute inset-x-0 bottom-0" />
    </header>
  );
}
