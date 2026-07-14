import { Check, Star } from "lucide-react";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * HERO épure — CLAIR, jamais d'image en fond (parti pris de la famille). Fond
 * dégradé blanc → lavis de marque (chaleureux, aéré), texte à filet à gauche,
 * CARTE DE PRIX encadrée à droite : liseré OR en tête, bandeau de marque, points
 * cochés, note dorée. Registre distinct de classic (carte sur mesh), editorial
 * (photo plein cadre) et littoral (nuit marine). 100 % tokens, mobile-first, AA.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const card = c.card;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);

  return (
    <header className="relative overflow-hidden border-b border-brand-100 bg-gradient-to-b from-bg to-brand-50/60">
      {/* Lavis de marque diffus (décor, jamais une image). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 -z-10 hidden size-[42rem] rounded-full bg-[color-mix(in_srgb,var(--brand-500)_14%,transparent)] blur-3xl lg:block"
      />
      <EditorialContainer className="grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="min-w-0">
          {c.eyebrow && (
            <div className="mb-6 flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-accent-500" />
              <span className="h-px w-8 bg-brand-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                {c.eyebrow}
              </span>
            </div>
          )}
          <h1 className="font-display text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
            {c.titre}
            {c.titreAccent && <span className="text-brand-600"> {c.titreAccent}</span>}
            {showVilleSuffix && <span className="text-brand-600"> à {ville}</span>}
          </h1>
          {c.accroche && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{c.accroche}</p>
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
          {c.trust?.length ? (
            <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-brand-100 pt-6 sm:flex sm:flex-wrap sm:gap-x-8">
              {c.trust.map((t) => (
                <li
                  key={t.label}
                  className="flex items-center gap-2.5 text-sm font-medium text-ink-soft"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Icon name={t.icone} className="size-4" />
                  </span>
                  {t.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {card && (
          <div className="mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto">
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-brand-100 bg-surface shadow-[var(--shadow-pop)]">
              {/* Liseré or : l'accent chaud, signature de la carte. */}
              <span aria-hidden className="block h-1.5 bg-gradient-to-r from-accent-400 to-accent-600" />
              <div className="bg-brand-gradient p-7 text-brand-contrast">
                {card.label && (
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-90">
                    {card.label}
                  </p>
                )}
                <p className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold leading-none">{card.prix}</span>
                  {card.unite && <span className="text-lg opacity-90">{card.unite}</span>}
                </p>
                {(card.mention || card.prixBarre) && (
                  <p className="mt-2 text-sm opacity-90">
                    {card.mention}
                    {card.prixBarre && (
                      <span className="ms-1.5 line-through opacity-70">{card.prixBarre}</span>
                    )}
                  </p>
                )}
              </div>
              <div className="p-7">
                {card.points?.length ? (
                  <ul className="space-y-3">
                    {card.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm text-ink-soft">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                          <Check className="size-3.5" strokeWidth={2.6} />
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {card.rating && (
                  <div className="mt-6 flex items-center gap-2 border-t border-border pt-5">
                    <span className="inline-flex items-center gap-0.5 text-accent-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </span>
                    {card.rating.label && (
                      <span className="text-sm text-muted">{card.rating.label}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </EditorialContainer>
    </header>
  );
}
