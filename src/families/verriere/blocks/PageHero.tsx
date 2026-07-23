import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { CoupDeFouet, Ferronnerie, Resille, VerriereKicker } from "../ui/Verriere";

/**
 * PAGE-HERO verrière — l'IMPOSTE d'une page intérieure : un panneau de verre
 * teinté nuit, strié de la résille de cames et ferré d'une volute. Quand la page
 * fournit une photo, elle passe DERRIÈRE le verre (voile de marque) au lieu de
 * s'afficher en vignette : l'en-tête reste une vitre, jamais une bannière.
 */
export function PageHero({ block, basePath = "" }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const crumbs = c.breadcrumb ?? [];
  const img = c.image;

  return (
    <section className="relative isolate overflow-hidden bg-brand-800 text-white">
      {img?.url && (
        <>
          <Image
            src={img.url}
            alt=""
            fill
            sizes="100vw"
            aria-hidden
            className="pointer-events-none object-cover opacity-25"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-800 via-brand-800/85 to-brand-800/55"
          />
        </>
      )}
      <Resille className="text-white opacity-[0.14]" />
      <Ferronnerie
        corner="tr"
        className="pointer-events-none absolute right-4 top-4 size-24 text-accent-500/30"
      />

      <EditorialContainer className="relative py-14 sm:py-16 lg:py-20">
        {crumbs.length > 0 && (
          <nav aria-label="Fil d'ariane" className="mb-7">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-white/70">
              {crumbs.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                  {b.href ? (
                    <Link
                      href={withBase(basePath, b.href)}
                      className="underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-white">{b.label}</span>
                  )}
                  {i < crumbs.length - 1 && (
                    <ChevronRight aria-hidden className="size-3.5 text-white/50" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {c.eyebrow && <VerriereKicker onDark>{c.eyebrow}</VerriereKicker>}

        <h1 className="mt-6 max-w-3xl font-display text-[2rem] leading-[1.1] text-white sm:text-[2.9rem]">
          {c.titre}
        </h1>

        <CoupDeFouet className="mt-4 h-6 w-56 text-accent-500/75" />

        {c.intro && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{c.intro}</p>
        )}

        {(c.ctaPrimaire || c.ctaSecondaire) && (
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="white" size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {c.ctaSecondaire && (
              <Button
                href={withBase(basePath, c.ctaSecondaire.href)}
                variant="outline"
                size="lg"
                className="border-white/50 bg-transparent text-white hover:border-white hover:bg-white/10"
              >
                {c.ctaSecondaire.label}
              </Button>
            )}
          </div>
        )}
      </EditorialContainer>
    </section>
  );
}
