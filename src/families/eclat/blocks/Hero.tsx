import Image from "next/image";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";
import { Sparkle } from "../ui/Eclat";

/**
 * HERO éclat — deux modes, une même identité lumineuse.
 *
 * - Par défaut : PAGE BLANCHE aérée, la seule couleur en touches, une étincelle
 *   pâle en fond, le prix dans un PANNEAU À FILET (bord fin, blanc).
 * - `fondu` / `plein` + image : hero PLEIN CADRE — la photo d'un intérieur net
 *   remplit le fond, un dégradé assure la lisibilité, le texte passe en clair et
 *   le prix flotte en carte blanche. Le header se met en overlay transparent
 *   (opt-in `headerOverlay`, cf. EclatHeader).
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
  const fullBleed = (block.variant === "fondu" || block.variant === "plein") && !!img?.url;

  // Sur la photo (mode plein cadre) la carte a besoin d'une ombre FRANCHE pour se
  // détacher — une ombre diffuse claire disparaîtrait sur un fond sombre.
  const cardShadow = fullBleed
    ? "shadow-2xl shadow-black/50 ring-1 ring-black/5"
    : "shadow-[var(--shadow-pop)]";

  // Carte de prix — un panneau blanc, identique dans les deux modes (elle flotte
  // aussi bien sur le blanc que par-dessus la photo).
  const priceCard = card ? (
    <div className={cn("rounded-2xl border border-border bg-surface p-8 text-ink", cardShadow)}>
      {card.label && (
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          <Sparkle className="size-3.5" />
          {card.label}
        </p>
      )}
      <p className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-6xl leading-none text-ink">{card.prix}</span>
        {card.unite && <span className="text-lg font-semibold text-muted">{card.unite}</span>}
      </p>
      {(card.mention || card.prixBarre) && (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {card.mention}
          {card.prixBarre && <span className="ms-1.5 line-through opacity-70">{card.prixBarre}</span>}
        </p>
      )}
      {card.points?.length ? (
        <ul className="mt-6 space-y-3 border-t border-border pt-6">
          {card.points.map((p) => (
            <li key={p} className="flex gap-3 text-sm text-ink-soft">
              <Sparkle className="mt-1 size-3.5 shrink-0 text-brand-500" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {card.rating?.label && (
        <p className="mt-6 border-t border-border pt-4 text-xs uppercase tracking-[0.1em] text-muted">
          {card.rating.label}
        </p>
      )}
    </div>
  ) : null;

  // ── Mode PLEIN CADRE ──────────────────────────────────────────────────────
  if (fullBleed) {
    return (
      // `-mt-16 sm:-mt-20` : le hero remonte SOUS le header sticky (hauteur
      // h-16/h-20) pour que la navbar transparente laisse voir l'image derrière
      // elle — sinon « transparent » ne montre que le fond blanc de la page.
      <header className="relative isolate -mt-16 flex min-h-[38rem] items-center overflow-hidden bg-ink text-white sm:-mt-20 lg:min-h-[44rem]">
        <Image src={img!.url} alt={img!.alt ?? ""} fill priority sizes="100vw" className="object-cover" />
        {/* Lisibilité : sombre à gauche (sous le texte) → transparent à droite ;
            voile HAUT pour que la navbar transparente reste lisible ; léger voile
            bas pour asseoir la composition. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/45 to-transparent" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
        <Sparkle className="eclat-twinkle pointer-events-none absolute right-10 top-28 hidden size-24 text-white/20 lg:block" />

        <EditorialContainer className="relative grid w-full items-center gap-10 py-24 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          <div className="min-w-0">
            {c.eyebrow && (
              <div className="flex items-center gap-2 text-white">
                <Sparkle className="size-3.5 text-brand-300" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">{c.eyebrow}</span>
              </div>
            )}
            <h1 className="mt-6 font-display text-[2.7rem] leading-[1.04] text-white sm:text-6xl lg:text-[4.2rem]">
              {c.titre}
              {c.titreAccent && <span className="italic text-brand-300"> {c.titreAccent}</span>}
              {showVilleSuffix && <span className="italic text-brand-300"> à {ville}</span>}
            </h1>
            {c.accroche && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{c.accroche}</p>
            )}

            {(c.ctaPrimaire || secondary) && (
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {c.ctaPrimaire && (
                  <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                    {c.ctaPrimaire.label}
                  </Button>
                )}
                {secondary && (
                  <Button
                    href={withBase(basePath, secondary.href)}
                    variant="outline"
                    size="lg"
                    className="border-white/50 bg-transparent text-white hover:border-white hover:bg-white/10"
                  >
                    {secondary.label}
                  </Button>
                )}
              </div>
            )}

            {trust.length ? (
              <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/85">
                {trust.map((t) => (
                  <li key={t.label} className="inline-flex items-center gap-2">
                    <Icon name={t.icone} className="size-4 shrink-0 text-brand-300" />
                    {t.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {priceCard && (
            <div className="mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto">{priceCard}</div>
          )}
        </EditorialContainer>
      </header>
    );
  }

  // ── Mode CLAIR (défaut) ───────────────────────────────────────────────────
  return (
    <header className="relative isolate overflow-hidden border-b border-border bg-bg text-ink">
      <Sparkle className="eclat-twinkle pointer-events-none absolute -right-16 -top-10 size-[26rem] text-brand-500/[0.06]" />

      <EditorialContainer className="relative grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-28">
        <div className="min-w-0">
          {c.eyebrow && (
            <div className="flex items-center gap-2 text-brand-700">
              <Sparkle className="size-3.5" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">{c.eyebrow}</span>
            </div>
          )}
          <h1 className="mt-6 font-display text-[2.7rem] leading-[1.04] text-ink sm:text-6xl lg:text-[4.2rem]">
            {c.titre}
            {c.titreAccent && <span className="italic text-brand-600"> {c.titreAccent}</span>}
            {showVilleSuffix && <span className="italic text-brand-600"> à {ville}</span>}
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
                <Button href={withBase(basePath, secondary.href)} variant="ghost" size="lg">
                  {secondary.label}
                </Button>
              )}
            </div>
          )}

          {trust.length ? (
            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-soft">
              {trust.map((t) => (
                <li key={t.label} className="inline-flex items-center gap-2">
                  <Icon name={t.icone} className="size-4 shrink-0 text-brand-600" />
                  {t.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {priceCard ? (
          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto">{priceCard}</div>
        ) : (
          img?.url && (
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ms-auto">
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                width={640}
                height={520}
                priority
                className="aspect-[5/4] w-full rounded-2xl border border-border object-cover"
              />
            </div>
          )
        )}
      </EditorialContainer>
    </header>
  );
}
