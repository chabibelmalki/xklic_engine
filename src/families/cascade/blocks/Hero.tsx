import Image from "next/image";
import { Check, Droplet, Star, Phone } from "lucide-react";
import type { HeroContent, ContactContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, telHref, cn } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { findBlock } from "@/lib/pages";
import { CascadeContainer } from "../ui/Container";
import { CascadeSeal } from "../ui/Seal";
import { Aura, BubbleField, WaveEdge, BANNER_SCRIM } from "../ui/Decor";

/**
 * HERO cascade — IMMERSIF & LUMINEUX. Deux modes selon `content` :
 *  - DÉFAUT : grand dégradé bleu→vert (jour), halos d'eau, gouttelettes, titre
 *    display blanc, et — signature — un SCEAU + une CARTE DE VERRE GIVRÉ à droite
 *    (ou une image encadrée si `image` sans `imageMode`).
 *  - `imageMode: "bandeau"` : la photo occupe le FOND plein-cadre, sous un VOILE
 *    de marque (dense à gauche pour l'AA du texte blanc, transparent à droite où
 *    respire la photo). Texte + CTA à gauche, pas de carte.
 * Le bloc se termine toujours par une VAGUE. 100 % tokens.
 */
const GRADIENT =
  "linear-gradient(145deg, var(--brand-800) 0%, var(--brand-600) 44%, color-mix(in srgb, var(--accent-600) 78%, var(--brand-700)) 100%)";

export function Hero({ block, config, basePath = "" }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const card = c.card;
  const img = c.image;
  const banner = !!img && c.imageMode === "bandeau";
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const phone = c.showPhone ? findBlock<ContactContent>(config, "contact")?.content?.telephone : undefined;

  const textCol = (
    <div className={cn("min-w-0", banner && "max-w-2xl")}>
      {c.eyebrow && (
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
          <Droplet className="size-3.5 fill-white/80 text-white/80" />
          {c.eyebrow}
        </span>
      )}
      <h1 className="font-display text-[2.7rem] font-extrabold leading-[0.98] tracking-[-0.03em] [text-wrap:balance] sm:text-6xl lg:text-[4.3rem]">
        {c.titre}
        {c.titreAccent && (
          <span className="text-[color-mix(in_srgb,var(--accent-500)_45%,white)]">
            {" "}
            {c.titreAccent}
          </span>
        )}
        {showVilleSuffix && <span className="text-white/70"> à {ville}</span>}
      </h1>
      {c.accroche && (
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">{c.accroche}</p>
      )}

      {phone && (
        <a
          href={telHref(phone)}
          className="mt-8 inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <span className="grid size-9 place-items-center rounded-full bg-white/15 ring-1 ring-inset ring-white/25">
            <Phone className="size-4" />
          </span>
          {phone}
        </a>
      )}

      {(c.ctaPrimaire || secondary) && (
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          {c.ctaPrimaire && (
            <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="white" size="lg">
              {c.ctaPrimaire.label}
            </Button>
          )}
          {secondary && (
            <Button
              href={withBase(basePath, secondary.href)}
              size="lg"
              className="border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
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
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm"
            >
              <Icon name={t.icone} className="size-4 text-white" />
              {t.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  return (
    <header
      className="relative isolate overflow-hidden text-white"
      style={banner ? undefined : { background: GRADIENT }}
    >
      {banner ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src={img.url}
            alt={img.alt ?? c.titre}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
          <div className="absolute inset-0" style={{ background: BANNER_SCRIM }} />
        </div>
      ) : (
        <>
          <Aura />
          <BubbleField />
        </>
      )}

      {banner ? (
        <CascadeContainer className="relative z-20 pb-24 pt-16 sm:pt-24 lg:pb-32 lg:pt-28">
          {textCol}
        </CascadeContainer>
      ) : (
        <CascadeContainer className="relative z-20 grid items-center gap-12 pb-24 pt-16 sm:pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pb-32 lg:pt-24">
          {textCol}

          {/* Colonne droite : carte de verre givré + sceau (signature). */}
          <div className="relative mx-auto w-full max-w-[23rem] lg:mx-0 lg:ms-auto">
            <CascadeSeal
              label={config.branding.tagline ?? config.entreprise.nom}
              seed="hero"
              tone="light"
              className="absolute -left-8 -top-10 z-30 hidden size-28 sm:block"
            />
            {img ? (
              <div className="relative overflow-hidden rounded-[var(--radius-card)] ring-1 ring-white/25 shadow-[0_40px_80px_-30px_rgba(3,20,40,0.65)]">
                <div className="relative aspect-[4/5]">
                  <Image src={img.url} alt={img.alt ?? c.titre} fill priority sizes="(max-width:1024px) 90vw, 40vw" className="object-cover" />
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-white/12 p-6 ring-1 ring-inset ring-white/25 backdrop-blur-md shadow-[0_40px_80px_-30px_rgba(3,20,40,0.6)]">
                {card && (
                  <>
                    {card.label && (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                        {card.label}
                      </p>
                    )}
                    <p className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-5xl font-extrabold leading-none text-white">
                        {card.prix}
                      </span>
                      {card.unite && <span className="text-xl font-semibold text-white/85">{card.unite}</span>}
                    </p>
                    {(card.mention || card.prixBarre) && (
                      <p className="mt-2 text-sm text-white/80">
                        {card.mention}
                        {card.prixBarre && <span className="ms-1.5 line-through opacity-70">{card.prixBarre}</span>}
                      </p>
                    )}
                    {card.points?.length ? (
                      <ul className="mt-6 space-y-3 border-t border-white/20 pt-6">
                        {card.points.map((p) => (
                          <li key={p} className="flex gap-3 text-sm font-medium text-white/90">
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/20">
                              <Check className="size-3.5" strokeWidth={3} />
                            </span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {card.rating && (
                      <div className="mt-6 flex items-center gap-2 border-t border-white/20 pt-5">
                        <span className="inline-flex items-center gap-0.5 text-white">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="size-4 fill-current" />
                          ))}
                        </span>
                        {card.rating.label && <span className="text-sm text-white/85">{card.rating.label}</span>}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </CascadeContainer>
      )}

      {/* Vague de sortie : le dégradé/la photo se déverse dans la page. */}
      <WaveEdge position="bottom" fill="var(--bg)" />
    </header>
  );
}
