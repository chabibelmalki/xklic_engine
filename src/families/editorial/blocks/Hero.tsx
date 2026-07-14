import Image from "next/image";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../ui/Container";

/**
 * HERO éditorial — grande image PLEIN CADRE, titre en surimpression aligné bas.
 * Overlay assombri NEUTRE (noir dégradé, infrastructure de lisibilité — pas une
 * couleur de marque) → texte blanc à contraste AA garanti quelle que soit la
 * palette du client. La marque s'exprime par le kicker, les CTA et l'accent.
 *
 * Ce hero IGNORE `block.variant` (la famille impose le plein cadre, à l'opposé
 * des variants carte/split de la famille classic).
 */
/** Voiles de lisibilité (noir dégradé, non-marque). `fort` = rendu historique. */
const OVERLAYS: Record<"fort" | "moyen" | "leger", string> = {
  fort: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.84) 88%, rgba(0,0,0,0.50) 100%)",
  moyen: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.60) 80%, rgba(0,0,0,0.30) 100%)",
  leger: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.14) 100%)",
};

export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);

  return (
    <header className="relative isolate flex min-h-[34svh] items-end overflow-hidden sm:min-h-[92svh]">
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
          {/* Scrim de LISIBILITÉ (noir, non-marque). `fort` (défaut) garantit le
              contraste AA du texte blanc même au pire cas (image ≈ blanche) ;
              `moyen`/`leger` laissent davantage voir l'image. Réglable par site
              via `content.imageOverlay`. */}
          <div className="absolute inset-0" style={{ backgroundImage: OVERLAYS[c.imageOverlay ?? "fort"] }} />
        </div>
      )}

      <EditorialContainer className="pb-14 pt-8 sm:pb-24 sm:pt-40">
        <div className="max-w-3xl">
          {c.eyebrow && (
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-white/60" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                {c.eyebrow}
              </span>
            </div>
          )}
          <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {c.titre}
            {c.titreAccent && <span className="text-white/80"> {c.titreAccent}</span>}
            {showVilleSuffix && <span className="text-white/80"> à {ville}</span>}
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
                <Button href={withBase(basePath, secondary.href)} variant="white" size="lg">
                  {secondary.label}
                </Button>
              )}
            </div>
          )}
          {c.trust?.length ? (
            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-6">
              {c.trust.map((t) => (
                <li key={t.label} className="flex items-center gap-2.5 text-sm font-medium text-white/85">
                  <Icon name={t.icone} className="size-[18px] text-white" />
                  {t.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </EditorialContainer>
    </header>
  );
}
