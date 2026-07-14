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
 * HERO signal — asymétrique et STRUCTURÉ. Deux registres selon `content.image` :
 *
 *  • SANS image (défaut de la famille) : fond CLAIR, grille de fins filets de
 *    marque, étiquette encadrée, texte + gages à GAUCHE, fiche technique à
 *    équerres à DROITE.
 *  • AVEC image : la photo passe en FOND plein cadre (sujet cadré à GAUCHE, gardé
 *    visible), le texte se cale à DROITE sur un voile sombre dégradé (contraste AA),
 *    en clair. Mêmes primitives (étiquette d'index, cellules de gages « givrées »).
 *    L'image donne du caractère sans casser la grammaire de la famille.
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
  const onDark = !!img?.url;

  const textBlock = (
    <div className={cn("min-w-0", onDark && "ms-auto w-full max-w-xl")}>
      {c.eyebrow && (
        <div
          className={cn(
            "inline-flex items-center gap-2.5 border px-3 py-1.5",
            onDark
              ? "border-white/25 bg-white/10 text-white backdrop-blur-sm"
              : "border-border bg-surface text-brand-700",
          )}
        >
          <span className="size-2 shrink-0 bg-accent-500" />
          <span
            className={cn(
              "text-[0.72rem] font-bold uppercase tracking-[0.22em]",
              onDark ? "text-white" : "text-brand-700",
            )}
          >
            {c.eyebrow}
          </span>
        </div>
      )}
      <h1
        className={cn(
          "mt-6 font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.4rem]",
          onDark ? "text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.45)]" : "text-ink",
        )}
      >
        {c.titre}
        {c.titreAccent && (
          <span className={onDark ? "text-accent-500" : "text-brand-600"}> {c.titreAccent}</span>
        )}
        {showVilleSuffix && (
          <span className={onDark ? "text-accent-500" : "text-brand-600"}> à {ville}</span>
        )}
      </h1>
      {c.accroche && (
        <p
          className={cn(
            "mt-6 max-w-xl text-lg leading-relaxed",
            onDark ? "text-white/90" : "text-muted",
          )}
        >
          {c.accroche}
        </p>
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
              className={
                onDark ? "border-white/40 bg-transparent text-white hover:bg-white/10" : undefined
              }
            >
              {secondary.label}
            </Button>
          )}
        </div>
      )}
      {trust.length ? (
        <ul
          className={cn(
            "mt-12 grid grid-cols-2 gap-px overflow-hidden border",
            onDark ? "border-white/15 bg-white/15" : "border-border bg-border sm:grid-cols-4",
          )}
        >
          {trust.map((t) => (
            <li
              key={t.label}
              className={cn(
                "flex flex-col gap-2.5 p-4",
                onDark ? "bg-black/40 backdrop-blur-sm" : "bg-bg",
              )}
            >
              <span className={onDark ? "text-brand-200" : "text-brand-600"}>
                <Icon name={t.icone} className="size-5" />
              </span>
              <span
                className={cn(
                  "text-xs font-medium leading-snug",
                  onDark ? "text-white/90" : "text-ink-soft",
                )}
              >
                {t.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  return (
    <header
      className={cn(
        "relative overflow-hidden border-b",
        onDark ? "border-white/10" : "border-border bg-bg",
      )}
    >
      {onDark ? (
        <>
          <Image
            src={img!.url}
            alt={img!.alt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover object-left"
          />
          {/* Unification de marque + voiles de contraste (sujet à gauche préservé). */}
          <div aria-hidden className="absolute inset-0 bg-brand-800/20" />
          <div aria-hidden className="absolute inset-0 bg-black/45 lg:bg-transparent" />
          <div
            aria-hidden
            className="absolute inset-0 hidden bg-gradient-to-l from-black/85 via-black/40 to-transparent lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
              backgroundSize: "3.5rem 100%",
            }}
          />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in srgb, var(--brand-500) 7%, transparent) 1px, transparent 1px)",
              backgroundSize: "3.5rem 100%",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-48 hidden size-[40rem] rounded-full bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)] blur-3xl lg:block"
          />
        </>
      )}

      <EditorialContainer
        className={cn(
          "relative",
          onDark
            ? "py-16 sm:py-20 lg:py-28"
            : "grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-24",
        )}
      >
        {textBlock}

        {!onDark && card && (
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
