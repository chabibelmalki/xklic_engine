import Image from "next/image";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn, withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { FilContainer } from "../ui/Container";
import { FilNuancier } from "../ui/Nuancier";

/**
 * HERO fil — PLEIN CADRE COUSU : photo pleine page re-teintée aux couleurs de
 * la marque (calque `mix-blend-color` sur image désaturée → duotone dérivé de
 * `branding.colors`, quel que soit le cliché), titre ÉCLATÉ aux deux bouts du
 * fil (`titre` en haut-gauche, `titreAccent` en bas-droite) qu'une COUTURE SVG
 * relie en se traçant au chargement, aiguille comprise. Sans image : pan
 * d'encre `brand-800` + grain textile, même composition. Halos locaux derrière
 * les titres (jamais d'assombrissement global excessif : la photo reste
 * visible). Nuancier interactif OPT-IN (`content.nuancier`). Conçu pour
 * `headerOverlay: true`. Ignore `block.variant`. Contrastes AA.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const trust = c.trust ?? [];
  const split = Boolean(c.titreAccent);

  // Avec photo + `headerOverlay`, le hero remonte SOUS l'en-tête sticky (rendu
  // en overlay transparent par SiteHeader) — même mécanique que le hero `plein`
  // historique. Sans image, le header reste solide : pas de remontée.
  const immersive = Boolean(c.image && c.headerOverlay);

  return (
    <header
      className={cn(
        "relative isolate flex min-h-[92svh] flex-col overflow-hidden bg-brand-800 text-white",
        immersive && "-mt-16 lg:-mt-20",
      )}
    >
      {/* Fond : photo re-teintée, ou pan d'encre dégradé sans photo. */}
      {c.image ? (
        <div className="absolute inset-0 -z-10">
          <Image
            src={c.image.url}
            alt={c.image.alt ?? c.titre}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: "saturate(0.55) contrast(1.04)" }}
          />
          {/* Teinte de marque : la photo entière prend la couleur du client. */}
          <div aria-hidden className="absolute inset-0 bg-brand-600 opacity-85 mix-blend-color" />
          {/* Scrim léger : lisibilité sans éteindre l'image. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--brand-800) 85%, #000) 0%, color-mix(in srgb, var(--brand-800) 40%, transparent) 30%, color-mix(in srgb, var(--brand-800) 12%, transparent) 55%, color-mix(in srgb, var(--brand-800) 42%, transparent) 100%)",
            }}
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(155deg, var(--brand-800) 0%, color-mix(in srgb, var(--brand-600) 80%, var(--brand-800)) 55%, color-mix(in srgb, var(--accent-500) 22%, var(--brand-800)) 100%)",
          }}
        />
      )}
      {/* Grain textile discret (utilitaire scopé au pack). */}
      <div aria-hidden className="fil-grain absolute inset-0 -z-0 text-white/60" />

      {/* La couture : le fil relie « l'idée » (haut-gauche) au « produit fini »
          (bas-droite), aiguille en bout de course. Se trace au chargement. */}
      {split && (
        <svg
          aria-hidden
          className="absolute inset-0 z-0 h-full w-full overflow-visible"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
        >
          <path
            className="fil-couture"
            pathLength={1}
            d="M330,180 C520,290 640,130 800,250 C940,355 940,470 1058,540"
            fill="none"
            stroke="color-mix(in srgb, var(--accent-50) 92%, #fff)"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 5px rgba(255,250,238,.85)) drop-shadow(0 2px 5px rgba(0,0,0,.45))" }}
          />
          <g className="fil-aiguille" transform="translate(1046,528) rotate(32)">
            <path d="M0,0 L52,10 L0,20 Q10,10 0,0 Z" fill="color-mix(in srgb, var(--accent-50) 92%, #fff)" />
            <circle cx="42" cy="10" r="2.6" fill="var(--brand-800)" />
          </g>
        </svg>
      )}

      <FilContainer wide className="relative z-10 flex flex-1 flex-col pb-10 pt-32 sm:pb-12 sm:pt-40">
        <h1 className="flex flex-1 flex-col justify-between font-display font-light">
          <span className="fil-halo fil-descend relative self-start text-[clamp(2.9rem,7.4vw,6.5rem)] leading-[1.04] tracking-[-0.015em] text-white [text-shadow:0_2px_26px_rgba(0,0,0,.4)]">
            {c.titre}
          </span>
          {split && (
            <span className="fil-halo fil-monte relative mb-[4vh] self-end text-right text-[clamp(2.9rem,7.4vw,6.5rem)] italic leading-[1.04] tracking-[-0.015em] text-accent-50 [text-shadow:0_2px_26px_rgba(0,0,0,.4)]">
              {c.titreAccent}
            </span>
          )}
        </h1>

        {c.accroche && (
          <p className="fil-tarde mb-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {c.accroche}
          </p>
        )}

        <div className="fil-tarde flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3.5">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="white" size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {secondary && (
              <a
                href={withBase(basePath, secondary.href)}
                className="btn inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/55 px-8 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              >
                {secondary.label}
              </a>
            )}
          </div>
          {c.nuancier && c.nuancier.couleurs.length > 0 && (
            <FilNuancier
              couleurs={c.nuancier.couleurs}
              accent={config.branding.colors?.accent}
              label={c.nuancier.label}
            />
          )}
        </div>

        {trust.length > 0 && (
          <ul className="fil-tarde mt-7 flex flex-wrap gap-x-7 gap-y-2.5 border-t border-white/20 pt-5">
            {trust.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-sm font-medium text-white/85">
                {t.icone && <Icon name={t.icone} className="size-4 text-accent-50" />}
                {t.label}
              </li>
            ))}
          </ul>
        )}
      </FilContainer>
    </header>
  );
}
