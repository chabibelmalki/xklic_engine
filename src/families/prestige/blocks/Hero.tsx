import Image from "next/image";
import { Phone } from "lucide-react";
import type { HeroContent, ContactContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { telHrefIntl, telIndicatif, telNeedsIndicatif, withBase } from "@/lib/utils";
import { findBlock } from "@/lib/pages";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { PaymentMarks } from "@/components/ui/PaymentMarks";
import { PrestigeContainer } from "../ui/Container";

/**
 * HERO prestige — plein écran NOCTURNE. Image sombre plein cadre + scrim noir
 * (infrastructure de lisibilité, contraste AA garanti), titre display ÉNORME en
 * surimpression, et surtout le NUMÉRO DE RÉSERVATION géant : le CTA d'un taxi,
 * c'est appeler. Sous le pli, une bande de CHIFFRES-CLÉS (dérivée de `trust`,
 * chaque libellé « Valeur · Légende ») en gros caractères, filet métallique doré.
 *
 * Ignore `block.variant` : la famille impose le plein cadre immersif.
 */
export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const tel = contact?.telephone;

  const figures = (c.trust ?? []).map((t) => {
    const [value, ...rest] = t.label.split(" · ");
    return { value, caption: rest.join(" · ") };
  });

  return (
    <header className="relative isolate flex min-h-[94svh] flex-col justify-end overflow-hidden bg-[var(--px-void)]">
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
          {/* Scrim nocturne : noir dégradé (non-marque). Assez dense sur toute la
              zone de texte pour un contraste AA quelle que soit l'image. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,5,7,0.94)_0%,rgba(4,5,7,0.72)_52%,rgba(4,5,7,0.45)_100%)]" />
        </div>
      )}

      <PrestigeContainer className="max-w-[84rem] pb-14 pt-40 sm:pb-20">
        {c.eyebrow && (
          <div className="mb-7 flex items-center gap-4">
            <span className="h-px w-14 bg-[var(--px-gold)]" />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--px-gold)]">
              {c.eyebrow}
            </span>
          </div>
        )}

        <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-8xl">
          {c.titre}
          {c.titreAccent && <span className="text-[var(--px-gold)]"> {c.titreAccent}</span>}
          {showVilleSuffix && <span className="text-[var(--px-gold)]"> à {ville}</span>}
        </h1>

        {c.accroche && (
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            {c.accroche}
          </p>
        )}

        {/* Bloc RÉSERVATION : le numéro en énorme, l'action première du taxi. */}
        {tel && (
          <div className="mt-10 flex flex-col gap-x-10 gap-y-6 sm:flex-row sm:items-end">
            <a
              href={telHrefIntl(tel)}
              className="group inline-flex flex-col focus-visible:outline-none"
            >
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/60">
                Réservation 24h/24 · 7j/7
              </span>
              <span className="mt-2 inline-flex items-center gap-4 font-sans text-4xl font-bold tabular-nums leading-none tracking-tight text-white transition-colors group-hover:text-[var(--px-gold)] sm:text-6xl">
                <Phone className="size-8 shrink-0 text-[var(--px-gold)] sm:size-10" strokeWidth={2.2} />
                <span className="inline-flex items-baseline gap-2.5">
                  {telNeedsIndicatif(tel) && (
                    <span className="text-[0.4em] font-medium text-white/45">{telIndicatif()}</span>
                  )}
                  {tel}
                </span>
              </span>
            </a>
            {(c.ctaPrimaire || secondary) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {c.ctaPrimaire && (
                  <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                    {c.ctaPrimaire.label}
                  </Button>
                )}
                {secondary && (
                  <a
                    href={withBase(basePath, secondary.href)}
                    className="inline-flex h-14 items-center justify-center border border-[var(--px-line)] px-8 text-base font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-[var(--px-gold)] hover:text-[var(--px-gold)]"
                  >
                    {secondary.label}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chiffres-clés : bande immersive, gros caractères, filet métallique. */}
        {figures.length > 0 && (
          <dl className="mt-14 grid grid-cols-2 gap-px border-t border-[var(--px-hairline)] pt-8 sm:flex sm:flex-wrap sm:gap-x-14 sm:gap-y-6">
            {figures.map((f) => (
              <div key={f.value + f.caption} className="flex flex-col">
                <dt className="font-display text-3xl font-semibold leading-none text-white sm:text-4xl">
                  {f.value}
                </dt>
                {f.caption && (
                  <dd className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                    {f.caption}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        )}

        {c.payments && c.payments.length > 0 && (
          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
            {c.paymentsLabel && (
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/50">
                {c.paymentsLabel}
              </span>
            )}
            <PaymentMarks ids={c.payments} />
          </div>
        )}
      </PrestigeContainer>
    </header>
  );
}
