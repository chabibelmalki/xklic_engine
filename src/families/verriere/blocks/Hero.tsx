import Image from "next/image";
import { Check } from "lucide-react";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";
import {
  CoupDeFouet,
  Ferronnerie,
  Medaillon,
  Ombelle,
  Resille,
  VerriereKicker,
  Vitrail,
} from "../ui/Verriere";

/**
 * HERO verrière — une baie vitrée. À gauche le texte, posé sur le papier ivoire
 * et scandé par le COUP DE FOUET qui se trace au scroll ; à droite un unique
 * PANNEAU DE VITRAIL cintré qui empile, dans la même sertissure de plomb, la
 * PHOTO (prise dans l'arc, striée de la résille de cames) puis le CARTOUCHE de
 * prix sur le verre. Photo et prix ne sont donc pas deux cartes flottantes mais
 * un seul vitrail — c'est la composition qui signe la famille.
 *
 * Sans photo, le panneau n'est que verre : le cartouche prend alors tout l'arc
 * (d'où le padding haut, qui l'empêche d'être rogné par la courbe).
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
      {/* Ombelle en filigrane + volute forgée : la marge ouvragée de la baie. */}
      <Ombelle className="pointer-events-none absolute -right-16 -top-24 size-[26rem] text-brand-500/[0.05]" />
      <Ferronnerie
        corner="bl"
        className="pointer-events-none absolute -bottom-4 left-0 size-40 text-brand-700/10"
      />

      <EditorialContainer className="relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="min-w-0">
          {c.eyebrow && <VerriereKicker>{c.eyebrow}</VerriereKicker>}

          <h1 className="mt-7 font-display text-[2.4rem] leading-[1.08] text-ink sm:text-[3.4rem] lg:text-[3.9rem]">
            {c.titre}
            {c.titreAccent && <span className="text-brand-700"> {c.titreAccent}</span>}
            {showVilleSuffix && <span className="text-brand-700"> à {ville}</span>}
          </h1>

          <CoupDeFouet className="mt-5 h-7 w-64 text-accent-500/75" />

          {c.accroche && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{c.accroche}</p>
          )}

          {(c.ctaPrimaire || secondary) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
            <ul className="mt-11 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {trust.map((t) => (
                <li key={t.label} className="flex items-center gap-3">
                  <Medaillon size="sm" className="ring-offset-[var(--alt)]">
                    <Icon name={t.icone} className="size-4" />
                  </Medaillon>
                  <span className="text-sm font-medium leading-snug text-ink-soft">{t.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* LE VITRAIL — photo prise dans l'arc, puis cartouche de prix sur verre. */}
        {(img?.url || card) && (
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ms-auto">
            <Vitrail className="shadow-[var(--shadow-pop)]">
              {img?.url && (
                <div className="relative">
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    width={720}
                    height={860}
                    priority
                    className="aspect-[4/5] w-full object-cover"
                  />
                  {/* Cames de plomb + voile vert : la photo devient un verre teinté. */}
                  <Resille className="text-brand-700 opacity-40" />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-800/45 via-transparent to-brand-800/15"
                  />
                </div>
              )}

              {card && (
                <div
                  className={
                    img?.url
                      ? "relative border-t-2 border-brand-700 px-7 pb-7 pt-6"
                      : "relative px-7 pb-7 pt-20 text-center"
                  }
                >
                  {card.label && (
                    <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-700">
                      <Ombelle className="size-3.5 text-accent-600" />
                      {card.label}
                    </p>
                  )}
                  <p
                    className={
                      img?.url
                        ? "mt-3 flex items-baseline gap-2"
                        : "mt-3 flex items-baseline justify-center gap-2"
                    }
                  >
                    <span className="font-display text-[3rem] leading-none text-brand-700">
                      {card.prix}
                    </span>
                    {card.unite && (
                      <span className="text-lg font-semibold text-muted">{card.unite}</span>
                    )}
                  </p>
                  {(card.mention || card.prixBarre) && (
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                      {card.mention}
                      {card.prixBarre && (
                        <span className="ms-1.5 text-muted line-through">{card.prixBarre}</span>
                      )}
                    </p>
                  )}

                  {card.points?.length ? (
                    <ul className="mt-5 space-y-2.5 border-t border-border pt-5 text-start">
                      {card.points.map((p) => (
                        <li key={p} className="flex gap-3 text-sm text-ink-soft">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-500 text-accent-contrast">
                            <Check className="size-3" strokeWidth={3.2} />
                          </span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {card.rating?.label && (
                    <p className="mt-5 border-t border-border pt-4 text-xs uppercase tracking-[0.12em] text-muted">
                      {card.rating.label}
                    </p>
                  )}
                </div>
              )}
            </Vitrail>
          </div>
        )}
      </EditorialContainer>
    </header>
  );
}
