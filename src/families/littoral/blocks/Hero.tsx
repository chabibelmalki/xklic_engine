import Image from "next/image";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { LittoralContainer } from "../ui/Container";
import { LittoralWave } from "../ui/Wave";
import { LittoralSunburst } from "../ui/Sunburst";

/**
 * HERO littoral — NUIT MARINE immersive (le logo mis en scène : la maison sur la
 * mer au soleil levant). Image plein cadre + scrim NAVY dérivé de `--brand-800`
 * (infrastructure de lisibilité teintée marque → texte blanc AA garanti quelle
 * que soit l'image), soleil doré (`Sunburst`) derrière le titre, grand titre
 * Cormorant avec mot-accent OR, et la VAGUE signature en pied qui remonte vers la
 * première section claire. Ignore `block.variant` : la famille impose le plein
 * cadre immersif.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);

  return (
    <header className="relative isolate flex min-h-[94svh] items-end overflow-hidden bg-brand-800">
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
          {/* Scrim marine : navy client (brand-800) fondu vers le bas, opaque sur
              la zone de texte → contraste AA garanti même au pire cas. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--brand-800) 0%, color-mix(in srgb, var(--brand-800) 90%, transparent) 42%, color-mix(in srgb, var(--brand-800) 55%, transparent) 76%, color-mix(in srgb, var(--brand-800) 18%, transparent) 100%)",
            }}
          />
        </div>
      )}
      <LittoralSunburst />

      <LittoralContainer wide className="relative z-10 pb-36 pt-40 sm:pb-44">
        <div className="max-w-3xl">
          {c.eyebrow && (
            <div className="mb-6 flex items-center gap-3">
              <span className="size-2 shrink-0 rounded-full bg-accent-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-50">
                {c.eyebrow}
              </span>
            </div>
          )}
          <h1 className="font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.01em] text-white sm:text-6xl lg:text-7xl">
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
          {c.trust?.length ? (
            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-6">
              {c.trust.map((t) => (
                <li
                  key={t.label}
                  className="flex items-center gap-2.5 text-sm font-medium text-white/85"
                >
                  <Icon name={t.icone} className="size-[18px] text-accent-500" />
                  {t.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </LittoralContainer>

      <LittoralWave />
    </header>
  );
}
