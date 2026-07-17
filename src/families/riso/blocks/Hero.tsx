import Image from "next/image";
import { Check } from "lucide-react";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { EditorialContainer } from "../../editorial/ui/Container";
import { Halftone, InkBar, OffsetText, RegistrationMark } from "../ui/Riso";

/**
 * HERO riso — une AFFICHE SÉRIGRAPHIÉE plein format.
 *
 * Le fond n'est ni du papier blanc ni une photo assombrie : c'est un APLAT
 * D'ENCRE de marque saturé, couvert d'une trame de points, sur lequel une
 * seconde passe d'encre d'accent vient EN SURIMPRESSION (`multiply`) — deux
 * encres qui se chevauchent fabriquent la troisième couleur, exactement comme
 * en riso. Le titre est imprimé en double passe (décalage de repérage).
 *
 * Avec image : la photo passe en DUOTONE (désaturée + multipliée dans l'aplat)
 * — elle devient une couche d'encre parmi les autres au lieu d'être une photo
 * sous un voile. C'est le traitement inverse de tout le reste du parc.
 *
 * Le prix est un TICKET de papier à coins massicotés, seule surface claire de la
 * composition : tout l'œil y tombe.
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

  return (
    <header className="relative isolate overflow-hidden bg-brand-600 text-brand-contrast">
      {/* Passe 1 — la photo devient une ENCRE : désaturée puis multipliée dans
          l'aplat de marque (duotone). Pas de voile noir : l'image se teinte. */}
      {img?.url && (
        <Image
          src={img.url}
          alt={img.alt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70 grayscale mix-blend-multiply"
        />
      )}
      {/* Passe 2 — la surimpression d'accent : là où elle croise l'aplat de
          marque, une 3e couleur apparaît. Signature riso. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 size-[34rem] rounded-full bg-accent-500 opacity-90 mix-blend-multiply"
      />
      {/* Passe 3 — la trame d'impression, sur toute la feuille. */}
      <Halftone lg className="text-white/25" />

      {/* Mire de repérage : calage des passes, en marge comme sur une vraie feuille. */}
      <RegistrationMark className="absolute left-4 top-4 text-white/40 sm:left-6 sm:top-6" />

      {/* Rail vertical : la ville imprimée dans la marge, sens de lecture tourné. */}
      <span
        aria-hidden
        className="riso-mono absolute right-5 top-1/2 hidden -translate-y-1/2 text-[0.7rem] font-bold uppercase tracking-[0.5em] text-white/45 [writing-mode:vertical-rl] xl:block"
      >
        {ville} · {config.entreprise.nom}
      </span>

      <EditorialContainer className="relative grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-28">
        <div className="min-w-0">
          {c.eyebrow && (
            <span className="riso-mono inline-block bg-accent-500 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-accent-contrast">
              {c.eyebrow}
            </span>
          )}
          <h1 className="mt-7 font-display text-[2.6rem] uppercase leading-[0.92] text-white sm:text-6xl lg:text-[4.2rem]">
            <OffsetText onDark>
              {c.titre}
              {c.titreAccent && <> {c.titreAccent}</>}
              {showVilleSuffix && <> à {ville}</>}
            </OffsetText>
          </h1>
          {c.accroche && (
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/90">{c.accroche}</p>
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
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/60 bg-transparent text-white hover:border-white hover:bg-white/10"
                >
                  {secondary.label}
                </Button>
              )}
            </div>
          )}

          {trust.length ? (
            <ul className="mt-11 flex flex-wrap gap-2.5">
              {trust.map((t) => (
                <li
                  key={t.label}
                  className="riso-mono inline-flex items-center gap-2 border-2 border-white/40 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-white"
                >
                  <Icon name={t.icone} className="size-4 shrink-0" />
                  {t.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* TICKET — papier massicoté (coins coupés), la seule zone claire. */}
        {card && (
          <div
            className="relative mx-auto w-full max-w-sm bg-bg text-ink lg:mx-0 lg:ms-auto"
            style={{
              clipPath:
                "polygon(1.4rem 0, 100% 0, 100% calc(100% - 1.4rem), calc(100% - 1.4rem) 100%, 0 100%, 0 1.4rem)",
            }}
          >
            <div className="border-b-2 border-dashed border-ink/25 px-7 pb-6 pt-8">
              {card.label && (
                <p className="riso-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-muted">
                  {card.label}
                </p>
              )}
              <p className="riso-mono mt-3 flex items-baseline gap-2">
                <span className="text-[3.2rem] font-bold leading-none text-brand-700">
                  {card.prix}
                </span>
                {card.unite && (
                  <span className="text-lg font-semibold text-muted">{card.unite}</span>
                )}
              </p>
              {(card.mention || card.prixBarre) && (
                <p className="mt-3 text-sm text-ink-soft">
                  {card.mention}
                  {card.prixBarre && (
                    <span className="riso-mono ms-1.5 line-through opacity-60">
                      {card.prixBarre}
                    </span>
                  )}
                </p>
              )}
            </div>
            {card.points?.length ? (
              <ul className="space-y-3 px-7 py-6">
                {card.points.map((p) => (
                  <li key={p} className="flex gap-3 text-sm text-ink-soft">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center bg-accent-500 text-accent-contrast">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {card.rating?.label && (
              <p className="riso-mono border-t-2 border-dashed border-ink/25 px-7 py-4 text-xs uppercase tracking-[0.1em] text-muted">
                {card.rating.label}
              </p>
            )}
          </div>
        )}
      </EditorialContainer>

      {/* Bande de contrôle couleur : le bas de la feuille imprimée. */}
      <InkBar className="absolute inset-x-0 bottom-0" />
    </header>
  );
}
