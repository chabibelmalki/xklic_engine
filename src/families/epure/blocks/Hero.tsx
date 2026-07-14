import Image from "next/image";
import { Check, Star } from "lucide-react";
import type { HeroContent, ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { findBlock } from "@/lib/pages";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * HERO atelier — AUDACIEUX. Deux registres selon `content.image` :
 *  - SANS image : fond lavis de marque, texte encre.
 *  - AVEC image : photo PLEIN CADRE sous un voile de marque dégradé (plus dense à
 *    gauche, sous le texte) → texte BLANC à contraste AA garanti, l'image respire
 *    à droite derrière la carte-sticker.
 * Dans les deux cas : eyebrow en TAG, carte de prix en « sticker » (bordure
 * épaisse + ombre DURE décalée), badges en pastilles, puis un BANDEAU MARQUEE
 * pleine largeur. Parti pris fort, distinct des cartes lisses de classic.
 */
// Voile de lisibilité (vert-noir de marque). Plus dense à gauche (texte), l'image
// reste visible à droite. Garantit l'AA du texte blanc quelle que soit la photo.
const SCRIM =
  "linear-gradient(108deg, rgba(9,28,22,0.86) 0%, rgba(9,28,22,0.66) 42%, rgba(9,28,22,0.50) 72%, rgba(9,28,22,0.42) 100%)";

export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const card = c.card;
  const img = c.image;
  const onImg = !!img;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);

  // Mots du marquee = noms des prestations (traduits), repli sobre sinon.
  const services = findBlock<ServicesContent>(config, "services")?.content;
  const words = (services?.items ?? []).map((s) => s.nom).slice(0, 6);
  const marquee = words.length ? words : [config.seo.ville, config.entreprise.nom];

  const accentText = onImg ? "text-accent-400" : "text-brand-600";

  return (
    <header
      className={cn(
        "relative isolate overflow-hidden border-b-2 border-brand-800",
        !onImg && "bg-[color-mix(in_srgb,var(--brand-500)_7%,var(--bg))]",
      )}
    >
      {onImg && (
        <div className="absolute inset-0 -z-10">
          <Image src={img.url} alt={img.alt ?? c.titre} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0" style={{ backgroundImage: SCRIM }} />
        </div>
      )}

      <EditorialContainer className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24">
        <div className="min-w-0">
          {c.eyebrow && (
            <span
              className={cn(
                "mb-6 inline-flex items-center gap-2 rounded-[var(--radius-btn)] border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]",
                onImg
                  ? "border-white/40 bg-white/10 text-white backdrop-blur-sm"
                  : "border-brand-800 bg-surface text-brand-800",
              )}
            >
              <Star className="size-3.5 fill-accent-500 text-accent-500" />
              {c.eyebrow}
            </span>
          )}
          <h1
            className={cn(
              "font-display text-[2.6rem] font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[4.4rem]",
              onImg ? "text-white [text-wrap:balance]" : "text-ink",
            )}
          >
            {c.titre}
            {c.titreAccent && <span className={accentText}> {c.titreAccent}</span>}
            {showVilleSuffix && <span className={accentText}> à {ville}</span>}
          </h1>
          {c.accroche && (
            <p
              className={cn(
                "mt-6 max-w-xl text-lg leading-relaxed",
                onImg ? "text-white/90" : "text-ink-soft",
              )}
            >
              {c.accroche}
            </p>
          )}
          {(c.ctaPrimaire || secondary) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {c.ctaPrimaire && (
                <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="accent" size="lg">
                  {c.ctaPrimaire.label}
                </Button>
              )}
              {secondary && (
                <Button
                  href={withBase(basePath, secondary.href)}
                  variant={onImg ? "white" : "outline"}
                  size="lg"
                >
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
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold",
                    onImg
                      ? "border-white/30 bg-white/10 text-white backdrop-blur-sm"
                      : "border-brand-200 bg-surface text-brand-800",
                  )}
                >
                  <Icon name={t.icone} className={cn("size-4", onImg ? "text-accent-400" : "text-brand-600")} />
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
      <div className="relative flex overflow-hidden border-t-2 border-brand-800 bg-brand-800 text-brand-contrast">
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
