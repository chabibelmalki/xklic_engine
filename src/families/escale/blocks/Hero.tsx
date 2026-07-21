import Image from "next/image";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";
import { FlapChip, LiveDot, MeridianField, StatusStrip } from "../ui/Escale";

/**
 * HERO escale — le TABLEAU DES OPÉRATIONS. Un panneau de nuit (brand-800)
 * parcouru du graticule de méridiens : le poste de coordination d'une équipe
 * mobile 24/7. Titre display en capitales (Bebas), destinations en VOLETS
 * (split-flap), et un FLUX vidéo encadré comme un moniteur de supervision qui
 * porte la vraie photo du client. Aucune carte-prix : la promesse est la
 * disponibilité, pas un tarif.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const ville = config.seo.ville;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const badges = c.badges ?? [];
  const trust = (c.trust ?? []).map((t) => t.label);
  const img = c.image;
  // Code « station » : les 3 premières lettres de la ville, en capitales — une
  // donnée universelle (pas de prose à traduire), façon code d'aéroport.
  const stationCode = ville ? ville.slice(0, 3).toUpperCase() : "OPS";

  return (
    <header className="relative isolate overflow-hidden bg-brand-800 text-white">
      <MeridianField className="text-white/[0.09]" />
      {/* Halo froid en haut à droite, cohérent avec la palette (pas de hex). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--brand-600), transparent)" }}
      />

      <EditorialContainer className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
        <div className="min-w-0">
          {c.eyebrow && <FlapChip onDark live>{c.eyebrow}</FlapChip>}

          <h1 className="mt-7 font-display text-[2.9rem] leading-[0.92] text-white sm:text-6xl lg:text-[4.6rem]">
            {c.titre}
            {c.titreAccent && <span className="text-accent-500"> {c.titreAccent}</span>}
          </h1>

          {c.accroche && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{c.accroche}</p>
          )}

          {/* Destinations en volets — la ligne de départs du tableau. */}
          {badges.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {badges.map((b) => (
                <li key={b}>
                  <FlapChip onDark>{b}</FlapChip>
                </li>
              ))}
            </ul>
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
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10"
                >
                  {secondary.label}
                </Button>
              )}
            </div>
          )}

          {trust.length > 0 && <StatusStrip items={trust} onDark className="mt-10" />}
        </div>

        {/* MONITEUR DE SUPERVISION — la vraie photo, encadrée comme un flux. */}
        {img?.url && (
          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:ms-auto">
            <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/15 bg-white/[0.04] shadow-[var(--shadow-pop)] backdrop-blur-sm">
              {/* Barre de flux : code station + voyant en service. */}
              <div className="escale-mono flex items-center justify-between gap-3 border-b border-white/12 px-4 py-2.5 text-[0.66rem] font-bold text-white/70">
                <span className="inline-flex items-center gap-2">
                  <LiveDot /> {stationCode}
                </span>
                <span aria-hidden>◍ ◍ ◍</span>
              </div>
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                width={720}
                height={560}
                priority
                className="aspect-[9/7] w-full object-cover"
              />
            </div>
            {/* Étiquette-volet flottante : le code station, donnée universelle. */}
            <div className="escale-flap escale-mono absolute -bottom-4 -left-4 hidden bg-brand-800 px-4 py-3 text-white ring-1 ring-white/15 sm:block">
              <span aria-hidden className="block text-[0.6rem] font-medium text-white/45">
                · · ·
              </span>
              <span className="text-2xl font-bold leading-none">{stationCode}</span>
            </div>
          </div>
        )}
      </EditorialContainer>
    </header>
  );
}
