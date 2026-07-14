import { Check, Star } from "lucide-react";
import type { HeroContent, ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { findBlock } from "@/lib/pages";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * HERO atelier — AUDACIEUX, jamais d'image en fond. Titre display XXL (Bricolage),
 * eyebrow en TAG, carte de prix en « STICKER » (bordure épaisse + ombre DURE
 * décalée de marque), badges en pastilles cerclées, puis un BANDEAU MARQUEE
 * pleine largeur (mots-clés des prestations qui défilent). Parti pris fort et
 * affirmé, à l'opposé des cartes lisses de classic. 100 % tokens, AA, SSR.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const card = c.card;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);

  // Mots du marquee = noms des prestations (traduits), repli sobre sinon.
  const services = findBlock<ServicesContent>(config, "services")?.content;
  const words = (services?.items ?? []).map((s) => s.nom).slice(0, 6);
  const marquee = words.length ? words : [config.seo.ville, config.entreprise.nom];

  return (
    <header className="relative overflow-hidden border-b-2 border-brand-800 bg-[color-mix(in_srgb,var(--brand-500)_7%,var(--bg))]">
      <EditorialContainer className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24">
        <div className="min-w-0">
          {c.eyebrow && (
            <span className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-btn)] border-2 border-brand-800 bg-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-800">
              <Star className="size-3.5 fill-accent-500 text-accent-500" />
              {c.eyebrow}
            </span>
          )}
          <h1 className="font-display text-[2.6rem] font-bold leading-[0.98] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[4.4rem]">
            {c.titre}
            {c.titreAccent && <span className="text-brand-600"> {c.titreAccent}</span>}
            {showVilleSuffix && <span className="text-brand-600"> à {ville}</span>}
          </h1>
          {c.accroche && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{c.accroche}</p>
          )}
          {(c.ctaPrimaire || secondary) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {c.ctaPrimaire && (
                <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="accent" size="lg">
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
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {c.trust.map((t) => (
                <li
                  key={t.label}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-brand-200 bg-surface px-3.5 py-1.5 text-sm font-semibold text-brand-800"
                >
                  <Icon name={t.icone} className="size-4 text-brand-600" />
                  {t.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {card && (
          <div className="mx-auto w-full max-w-[21rem] pe-1.5 lg:mx-0 lg:ms-auto">
            <div className="overflow-hidden rounded-[var(--radius-card)] border-2 border-brand-800 bg-surface shadow-[6px_6px_0_0_var(--brand-800)]">
              <div className="flex items-center justify-between bg-brand-800 px-6 py-2.5 text-brand-contrast">
                {card.label && (
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">{card.label}</span>
                )}
                <Star className="size-4 fill-accent-400 text-accent-400" />
              </div>
              <div className="bg-brand-gradient px-6 py-7 text-brand-contrast">
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-[3.4rem] font-bold leading-none">{card.prix}</span>
                  {card.unite && <span className="text-lg font-medium opacity-90">{card.unite}</span>}
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
              <div className="px-6 py-6">
                {card.points?.length ? (
                  <ul className="space-y-3">
                    {card.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm font-medium text-ink-soft">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-[0.3rem] bg-brand-600 text-brand-contrast">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {card.rating && (
                  <div className="mt-6 flex items-center gap-2 border-t-2 border-dashed border-border pt-5">
                    <span className="inline-flex items-center gap-0.5 text-accent-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </span>
                    {card.rating.label && (
                      <span className="text-sm font-medium text-muted">{card.rating.label}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </EditorialContainer>

      {/* BANDEAU MARQUEE — signature de la famille. */}
      <div className="flex overflow-hidden border-t-2 border-brand-800 bg-brand-800 text-brand-contrast">
        <div className="epure-marquee-track flex shrink-0 items-center whitespace-nowrap py-3">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1 ? true : undefined}>
              {marquee.map((w, i) => (
                <span key={`${dup}-${i}`} className="flex items-center">
                  <span className="px-6 text-sm font-bold uppercase tracking-[0.18em]">{w}</span>
                  <Star className="size-3.5 shrink-0 fill-accent-400 text-accent-400" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
