import Image from "next/image";
import { Check, Star } from "lucide-react";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";
import { CornerTicks } from "../ui/Heading";

/**
 * HERO signal — asymétrique et STRUCTURÉ, registre CLAIR dans les deux cas :
 *
 *  • SANS image : grille de fins filets de marque, texte + gages à GAUCHE, fiche
 *    technique à équerres à DROITE.
 *  • AVEC image : la photo passe en FOND plein cadre, cadrée à GAUCHE (le sujet
 *    reste visible), et le texte se cale à DROITE sur un voile BLANC dégradé —
 *    on garde l'encre foncée et la luminosité de la photo (visuels clairs du
 *    client), au lieu de l'assombrir. Mêmes primitives (étiquette d'index,
 *    cellules de gages givrées).
 *
 * Empilement SANS z-index négatif : décor/photo en `absolute` posés AVANT le
 * conteneur `relative` → le contenu peint au-dessus par ordre du DOM (un z négatif
 * s'échapperait derrière le fond blanc de la page). 100 % tokens, mobile-first, AA.
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
  const onImage = !!img?.url;

  const textBlock = (
    <div className={cn("min-w-0", onImage && "ms-auto w-full max-w-xl")}>
      {c.eyebrow && (
        <div
          className={cn(
            "inline-flex items-center gap-2.5 border border-border px-3 py-1.5",
            onImage ? "bg-white/85 backdrop-blur-sm" : "bg-surface",
          )}
        >
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
        <ul
          className={cn(
            "mt-12 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border",
            !onImage && "sm:grid-cols-4",
          )}
        >
          {trust.map((t) => (
            <li
              key={t.label}
              className={cn(
                "flex flex-col gap-2.5 p-4",
                onImage ? "bg-white/85 backdrop-blur-sm" : "bg-bg",
              )}
            >
              <span className="text-brand-600">
                <Icon name={t.icone} className="size-5" />
              </span>
              <span className="text-xs font-medium leading-snug text-ink-soft">{t.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  return (
    <header className="relative overflow-hidden border-b border-border bg-bg">
      {onImage ? (
        <>
          <Image
            src={img!.url}
            alt={img!.alt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover object-left"
          />
          {/* Voiles CLAIRS : on éclaircit le côté texte sans assombrir la photo. */}
          <div aria-hidden className="absolute inset-0 bg-white/70 lg:bg-transparent" />
          <div
            aria-hidden
            className="absolute inset-0 hidden bg-gradient-to-l from-white/95 via-white/65 to-transparent lg:block"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-48 hidden size-[40rem] rounded-full bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)] blur-3xl lg:block"
        />
      )}
      {/* Grille de filets de marque — signature de la famille, dans les deux modes. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--brand-500) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "3.5rem 100%",
        }}
      />

      <EditorialContainer
        className={cn(
          "relative",
          onImage
            ? "py-16 sm:py-20 lg:py-28"
            : "grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-24",
        )}
      >
        {textBlock}

        {!onImage && card && (
          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto">
            <CornerTicks className="-m-2.5" />
            <div className="relative border border-border bg-surface shadow-[var(--shadow-pop)]">
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
