import Image from "next/image";
import { Check, Heart } from "lucide-react";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * HERO foyer — « carnet de maison » CHALEUREUX. Colonne texte à gauche
 * (kicker manuscrit + grand titre serif + accroche + CTA + étiquettes de
 * confiance), colonne image à droite dans un CADRE PHOTO d'album (double liseré
 * chaud, coins arrondis, petite légende manuscrite épinglée) surmonté d'une
 * CARTE-RECETTE de prix (en-tête miel, liseré couture pointillé, check-list
 * cochée). Aucune photo plein cadre / voile sombre : registre clair, tactile,
 * personnel — distinct d'`editorial`/`epure` (photo plein-bord) et du clinique
 * `classic`. Couleurs 100 % tokens.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const card = c.card;
  const img = c.image;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);

  return (
    <section className="relative isolate overflow-hidden bg-[color-mix(in_srgb,var(--brand-500)_5%,var(--bg))]">
      {/* Halo chaud très doux en coin (papier ensoleillé). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent-500) 30%, transparent), transparent 70%)" }}
      />
      <EditorialContainer className="grid items-start gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="min-w-0 lg:pt-6">
          {c.eyebrow && (
            <p className="foyer-script mb-2 text-[1.9rem] leading-none text-brand-600 sm:text-4xl">
              {c.eyebrow}
            </p>
          )}
          <h1 className="pack-heading font-display text-[2.6rem] font-semibold leading-[1.02] text-ink sm:text-6xl lg:text-[4rem]">
            {c.titre}
            {c.titreAccent && <span className="text-brand-600"> {c.titreAccent}</span>}
            {showVilleSuffix && <span className="text-brand-600"> à {ville}</span>}
          </h1>
          {c.accroche && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{c.accroche}</p>
          )}
          {(c.ctaPrimaire || secondary) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {c.ctaPrimaire && (
                <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="primary" size="lg">
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
            <ul className="mt-9 flex flex-wrap gap-2.5">
              {c.trust.map((t) => (
                <li
                  key={t.label}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface px-4 py-2 text-sm font-medium text-brand-800 shadow-[0_2px_0_0_color-mix(in_srgb,var(--brand-500)_18%,transparent)]"
                >
                  <Icon name={t.icone} className="size-4 text-brand-600" />
                  {t.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Colonne visuelle : cadre photo album + carte-recette de prix. */}
        <div className="flex flex-col items-center gap-6 lg:items-end">
          {img && (
            <figure className="relative w-full max-w-md">
              <div className="rotate-[-1.2deg] rounded-[calc(var(--radius-card)+0.4rem)] border border-brand-100 bg-surface p-3 shadow-[var(--shadow-pop)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
                  <Image
                    src={img.url}
                    alt={img.alt ?? c.titre}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <figcaption className="foyer-script absolute -bottom-3 left-6 rotate-[-2deg] rounded-full border border-brand-100 bg-accent-50 px-4 py-1 text-xl text-brand-700 shadow-sm">
                fait avec soin
                <Heart className="ms-1 inline size-4 fill-brand-400 text-brand-400" />
              </figcaption>
            </figure>
          )}

          {card && (
            <div
              className={cn(
                "w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-brand-100 bg-surface shadow-[var(--shadow-card)]",
                img && "mt-2",
              )}
            >
              <div className="flex items-center justify-between bg-accent-500 px-6 py-3 text-accent-contrast">
                {card.label && (
                  <span className="text-sm font-semibold tracking-wide">{card.label}</span>
                )}
                <Heart className="size-4 fill-current" />
              </div>
              <div className="px-6 pt-6">
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-[3.2rem] font-semibold leading-none text-ink">
                    {card.prix}
                  </span>
                  {card.unite && <span className="text-lg font-medium text-muted">{card.unite}</span>}
                </p>
                {(card.mention || card.prixBarre) && (
                  <p className="mt-2 text-sm text-muted">
                    {card.mention}
                    {card.prixBarre && (
                      <span className="ms-1.5 line-through opacity-70">{card.prixBarre}</span>
                    )}
                  </p>
                )}
              </div>
              <div className="px-6 pb-6 pt-5">
                {card.points?.length ? (
                  <ul className="space-y-3 border-t border-dashed border-brand-200 pt-5">
                    {card.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm font-medium text-ink-soft">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-700">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </EditorialContainer>
    </section>
  );
}
