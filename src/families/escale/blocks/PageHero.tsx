import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { FlapChip, MeridianField } from "../ui/Escale";

/**
 * PAGE-HERO escale — le bandeau d'une page intérieure : un panneau de nuit
 * (brand-800) au graticule de méridiens, fil d'ariane en mono (la « route »
 * suivie), volet-kicker et titre display en capitales. Cohérent avec le hero
 * d'accueil sans le moniteur.
 */
export function PageHero({ block, basePath = "" }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const crumbs = c.breadcrumb ?? [];

  return (
    <section className="relative isolate overflow-hidden bg-brand-800 text-white">
      <MeridianField className="text-white/[0.09]" />

      <EditorialContainer className="relative py-14 sm:py-16 lg:py-20">
        {crumbs.length > 0 && (
          <nav aria-label="Fil d'ariane" className="mb-6">
            <ol className="escale-mono flex flex-wrap items-center gap-1.5 text-[0.66rem] font-medium text-white/60">
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
                    <span className="text-white/90">{b.label}</span>
                  )}
                  {i < crumbs.length - 1 && (
                    <ChevronRight aria-hidden className="size-3.5 text-white/35" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {c.eyebrow && <FlapChip onDark live>{c.eyebrow}</FlapChip>}

        <h1 className="mt-6 max-w-3xl font-display text-[2.5rem] leading-[0.96] text-white sm:text-5xl lg:text-[3.6rem]">
          {c.titre}
        </h1>

        {c.intro && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{c.intro}</p>
        )}

        {(c.ctaPrimaire || c.ctaSecondaire) && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="accent" size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {c.ctaSecondaire && (
              <Button
                href={withBase(basePath, c.ctaSecondaire.href)}
                variant="outline"
                size="lg"
                className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10"
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
