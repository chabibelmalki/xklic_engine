import Link from "next/link";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { Halftone, InkBar, OffsetText } from "../ui/Riso";

/**
 * PAGE-HERO riso — le bandeau d'une page intérieure, imprimé sur l'encre la plus
 * profonde de la palette (brand-800) : chaque page s'ouvre donc sur un aplat, pas
 * sur du papier. Fil d'ariane en mono d'imprimeur séparé par des barres obliques
 * (une ligne de code de composition, pas des chevrons), titre en double passe.
 */
export function PageHero({ block, basePath = "" }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const crumbs = c.breadcrumb ?? [];

  return (
    <section className="relative isolate overflow-hidden bg-brand-800 text-white">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 size-[24rem] rounded-full bg-accent-500 opacity-70 mix-blend-multiply"
      />
      <Halftone className="text-white/20" />

      <EditorialContainer className="relative py-16 sm:py-20 lg:py-24">
        {crumbs.length > 0 && (
          <nav aria-label="Fil d'ariane" className="mb-7">
            <ol className="riso-mono flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/60">
              {crumbs.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-2">
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
                    <span aria-hidden className="text-accent-500">
                      /
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {c.eyebrow && (
          <span className="riso-mono inline-block bg-accent-500 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-accent-contrast">
            {c.eyebrow}
          </span>
        )}

        <h1 className="mt-6 max-w-3xl font-display text-[2.2rem] uppercase leading-[0.96] text-white sm:text-5xl">
          <OffsetText onDark>{c.titre}</OffsetText>
        </h1>

        {c.intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">{c.intro}</p>
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
                className="border-2 border-white/50 bg-transparent text-white hover:border-white hover:bg-white/10"
              >
                {c.ctaSecondaire.label}
              </Button>
            )}
          </div>
        )}
      </EditorialContainer>

      <InkBar className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
