import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * PAGE-HERO signal — en-tête de page intérieure sur LAVIS de marque, réglé par un
 * filet bas : fil d'ariane discret, ÉTIQUETTE d'index (carré d'accent), grand
 * titre adossé à l'arête de marque (spine), intro et actions. Même grammaire
 * structurée que le hero d'accueil ; distinct des page-heros immersifs.
 */
export function PageHero({ block, basePath = "" }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const crumbs = c.breadcrumb ?? [];
  return (
    <section className="relative overflow-hidden border-b border-border bg-[color-mix(in_srgb,var(--brand-500)_7%,var(--bg))]">
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-gradient" />
      <EditorialContainer className="py-14 sm:py-16 lg:py-20">
        {crumbs.length > 0 && (
          <nav aria-label="Fil d'ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted">
              {crumbs.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                  {b.href ? (
                    <Link href={withBase(basePath, b.href)} className="hover:text-brand-700">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-ink-soft">{b.label}</span>
                  )}
                  {i < crumbs.length - 1 && <ChevronRight className="size-3.5 text-muted-2" />}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {c.eyebrow && (
          <div className="mb-5 flex items-center gap-2.5">
            <span className="size-2.5 shrink-0 bg-accent-500" />
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-brand-700">
              {c.eyebrow}
            </span>
          </div>
        )}
        <h1 className="max-w-3xl border-s-[3px] border-brand-500 ps-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {c.titre}
        </h1>
        {c.intro && (
          <p className="mt-6 max-w-2xl ps-5 text-lg leading-relaxed text-muted">{c.intro}</p>
        )}
        {(c.ctaPrimaire || c.ctaSecondaire) && (
          <div className="mt-9 flex flex-col gap-3 ps-5 sm:flex-row">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {c.ctaSecondaire && (
              <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="outline" size="lg">
                {c.ctaSecondaire.label}
              </Button>
            )}
          </div>
        )}
      </EditorialContainer>
    </section>
  );
}
