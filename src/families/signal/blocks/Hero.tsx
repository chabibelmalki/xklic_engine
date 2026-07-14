import { Check, Star } from "lucide-react";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";
import { CornerTicks } from "../ui/Heading";

/**
 * HERO signal — asymétrique et STRUCTURÉ, jamais d'image plein cadre : grille de
 * fins filets de marque en fond, ÉTIQUETTE encadrée en tête (carré d'accent),
 * grand titre, bande de gages en CELLULES à filets, et une FICHE technique à
 * équerres à droite (bandeau de marque + lignes réglées + note). Registre net,
 * opératoire — à l'opposé de la carte-prix arrondie d'épure et du hero-photo
 * d'editorial. 100 % tokens, mobile-first, AA.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const card = c.card;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const trust = c.trust ?? [];

  return (
    <header className="relative overflow-hidden border-b border-border bg-bg">
      {/* Grille de filets de marque (décor technique, jamais une image). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--brand-500) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "3.5rem 100%",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 -z-10 hidden size-[40rem] rounded-full bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)] blur-3xl lg:block"
      />
      <EditorialContainer className="grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-24">
        <div className="min-w-0">
          {c.eyebrow && (
            <div className="inline-flex items-center gap-2.5 border border-border bg-surface px-3 py-1.5">
              <span className="size-2 shrink-0 bg-accent-500" />
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-brand-700">
                {c.eyebrow}
              </span>
            </div>
          )}
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
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
          {trust.length ? (
            <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
              {trust.map((t) => (
                <li key={t.label} className="flex flex-col gap-2.5 bg-bg p-4">
                  <span className="text-brand-600">
                    <Icon name={t.icone} className="size-5" />
                  </span>
                  <span className="text-xs font-medium leading-snug text-ink-soft">{t.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {card && (
          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto">
            <CornerTicks className="-m-2.5" />
            <div className="relative border border-border bg-surface shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-3 bg-brand-gradient px-6 py-5 text-brand-contrast">
                <div>
                  {card.label && (
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-90">
                      {card.label}
                    </p>
                  )}
                  <p className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-display text-[2rem] font-bold leading-none">
                      {card.prix}
                    </span>
                    {card.unite && <span className="text-base opacity-90">{card.unite}</span>}
                  </p>
                </div>
                <span aria-hidden className="size-2.5 shrink-0 bg-white/70" />
              </div>
              {(card.mention || card.prixBarre) && (
                <p className="border-b border-border bg-alt px-6 py-3 text-sm text-ink-soft">
                  {card.mention}
                  {card.prixBarre && (
                    <span className="ms-1.5 line-through opacity-60">{card.prixBarre}</span>
                  )}
                </p>
              )}
              {card.points?.length ? (
                <ul className="divide-y divide-border">
                  {card.points.map((p) => (
                    <li key={p} className="flex gap-3 px-6 py-3.5 text-sm text-ink-soft">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center bg-brand-50 text-brand-600">
                        <Check className="size-3.5" strokeWidth={2.8} />
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {card.rating && (
                <div className="flex items-center gap-2 border-t border-border px-6 py-4">
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
        )}
      </EditorialContainer>
    </header>
  );
}
