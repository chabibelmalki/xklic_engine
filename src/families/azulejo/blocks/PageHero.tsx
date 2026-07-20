import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { AzulejoFrieze, AzulejoWall, TileChip } from "../ui/Azulejo";

/**
 * PAGE-HERO azulejo — le bandeau d'une page intérieure : un pan de faïence
 * ÉMAILLÉE (aplat de marque tramé de joints), coiffé et fermé par une frise de
 * losanges. Fil d'ariane à chevrons discrets, titre en serif haute clair.
 */
export function PageHero({ block, basePath = "" }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const crumbs = c.breadcrumb ?? [];

  return (
    <section className="relative isolate overflow-hidden bg-brand-700 text-white">
      <AzulejoWall className="text-white/10" />
      <AzulejoFrieze className="absolute inset-x-0 top-0" />

      <EditorialContainer className="relative py-14 sm:py-16 lg:py-20">
        {crumbs.length > 0 && (
          <nav aria-label="Fil d'ariane" className="mb-6">
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

        {c.eyebrow && <TileChip onDark>{c.eyebrow}</TileChip>}

        <h1 className="mt-6 max-w-3xl font-display text-[2.1rem] leading-[1.06] text-white sm:text-5xl">
          {c.titre}
        </h1>

        {c.intro && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{c.intro}</p>
        )}

        {(c.ctaPrimaire || c.ctaSecondaire) && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

      <AzulejoFrieze className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
