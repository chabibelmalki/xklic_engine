import Image from "next/image";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { ArondeContainer } from "../ui/Container";
import { ArondeDovetail } from "../ui/Dovetail";
import { miterTR } from "../ui/miter";

/**
 * HERO aronde — ÉTABLI D'ÉBÉNISTE : grand pan de bois ESPRESSO (`brand-800`),
 * texte clair AA garanti, titre slab (Zilla Slab) avec mot-accent CARAMEL, grain
 * de bois discret, et la QUEUE D'ARONDE signature en pied. Deux colonnes en
 * desktop : le discours à gauche, une PLAQUE D'ATELIER à coupe d'onglet à droite
 * (les gages de confiance + la marque) — la moitié droite ne reste jamais vide,
 * même sans photo de chantier. Ignore `block.variant`. Image de fond OPTIONNELLE
 * (scrim espresso pour le contraste).
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const trust = c.trust ?? [];

  return (
    <header className="relative isolate flex min-h-[88svh] items-center overflow-hidden bg-brand-800 text-white">
      {c.image && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={c.image.url}
            alt={c.image.alt ?? c.titre}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--brand-800) 0%, color-mix(in srgb, var(--brand-800) 88%, transparent) 44%, color-mix(in srgb, var(--brand-800) 52%, transparent) 78%, color-mix(in srgb, var(--brand-800) 20%, transparent) 100%)",
            }}
          />
        </div>
      )}
      {/* Grain de bois vertical, très discret (utilitaire scopé au pack). */}
      <div aria-hidden className="aronde-grain absolute inset-0 -z-0 text-white/70" />

      <ArondeContainer wide className="relative z-10 py-28 sm:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          {/* Colonne discours */}
          <div className="min-w-0 max-w-2xl">
            {c.eyebrow && (
              <div className="mb-6 flex items-center gap-3">
                <span className="size-2.5 shrink-0 rounded-[1px] bg-accent-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-50">
                  {c.eyebrow}
                </span>
              </div>
            )}
            <h1 className="font-display text-[2.35rem] font-bold leading-[1.05] tracking-[-0.01em] text-white break-words sm:text-6xl lg:text-[4rem]">
              {c.titre}
              {c.titreAccent && <span className="text-accent-500"> {c.titreAccent}</span>}
              {showVilleSuffix && <span className="text-accent-500"> à {ville}</span>}
            </h1>
            {c.accroche && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{c.accroche}</p>
            )}
            {(c.ctaPrimaire || secondary) && (
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {c.ctaPrimaire && (
                  <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="accent" size="lg">
                    {c.ctaPrimaire.label}
                  </Button>
                )}
                {secondary && (
                  <Button href={withBase(basePath, secondary.href)} variant="white" size="lg">
                    {secondary.label}
                  </Button>
                )}
              </div>
            )}
            {/* STICKER d'expérience — tampon caramel incliné (badges[0]). */}
            {c.badges?.[0] && (
              <div className="mt-10 inline-flex -rotate-3 items-center gap-2.5 rounded-[3px] bg-accent-500 px-5 py-3 shadow-[var(--shadow-pop)]">
                <Icon name="Award" className="size-5 text-accent-contrast" />
                <span className="font-display text-base font-bold uppercase tracking-[0.08em] text-accent-contrast">
                  {c.badges[0]}
                </span>
              </div>
            )}
          </div>

          {/* Plaque d'atelier — cartouche crème à coupe d'onglet posé sur le bois.
              Remplit la moitié droite en desktop ; passe sous le discours en mobile. */}
          <aside
            style={miterTR(30)}
            className="relative min-w-0 border border-white/15 bg-[color-mix(in_srgb,var(--brand-50)_94%,#ffffff)] p-7 shadow-[var(--shadow-pop)] sm:p-9"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-brand-100 pb-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-[3px] bg-brand-800 text-white">
                <Icon name="Hammer" className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold leading-tight text-ink">
                  {config.entreprise.nom}
                </p>
                {config.branding.tagline && (
                  <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.16em] text-muted-2">
                    {config.branding.tagline}
                  </p>
                )}
              </div>
            </div>
            {trust.length > 0 ? (
              <ul className="space-y-4">
                {trust.map((t) => (
                  <li key={t.label} className="flex items-start gap-3 text-sm font-medium text-ink">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[2px] bg-accent-50 text-accent-600">
                      <Icon name={t.icone} className="size-4" />
                    </span>
                    {t.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                {c.accroche ?? config.meta.description}
              </p>
            )}
            {/* Petit rappel du motif d'assemblage en pied de plaque. */}
            <div aria-hidden className="mt-7 flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="h-2 flex-1 rounded-[1px]"
                  style={{
                    background:
                      i % 2 === 0 ? "var(--brand-800)" : "color-mix(in srgb, var(--accent-500) 70%, transparent)",
                  }}
                />
              ))}
            </div>
          </aside>
        </div>
      </ArondeContainer>

      <ArondeDovetail variant="hero" />
    </header>
  );
}
