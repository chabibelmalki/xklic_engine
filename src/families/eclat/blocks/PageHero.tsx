import Link from "next/link";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { Sparkle } from "../ui/Eclat";

/**
 * PAGE-HERO éclat — un bandeau CLAIR (blanc cassé), pas un aplat sombre : chaque
 * page reste lumineuse. Fil d'ariane fin séparé par des étincelles, titre en serif
 * éditoriale, filet de clôture en bas.
 */
export function PageHero({ block, basePath = "" }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const crumbs = c.breadcrumb ?? [];

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-alt text-ink">
      <Sparkle className="eclat-twinkle pointer-events-none absolute -right-10 -top-8 size-56 text-brand-500/[0.06]" />

      <EditorialContainer className="relative py-14 sm:py-16 lg:py-20">
        {crumbs.length > 0 && (
          <nav aria-label="Fil d'ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
              {crumbs.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-2">
                  {b.href ? (
                    <Link
                      href={withBase(basePath, b.href)}
                      className="underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-ink">{b.label}</span>
                  )}
                  {i < crumbs.length - 1 && (
                    <Sparkle aria-hidden className="size-2.5 text-brand-400" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {c.eyebrow && (
          <div className="flex items-center gap-2 text-brand-700">
            <Sparkle className="size-3.5" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">{c.eyebrow}</span>
          </div>
        )}

        <h1 className="mt-5 max-w-3xl font-display text-[2.3rem] leading-[1.08] text-ink sm:text-5xl">
          {c.titre}
        </h1>

        {c.intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{c.intro}</p>}

        {(c.ctaPrimaire || c.ctaSecondaire) && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {c.ctaSecondaire && (
              <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="ghost" size="lg">
                {c.ctaSecondaire.label}
              </Button>
            )}
          </div>
        )}
      </EditorialContainer>
    </section>
  );
}
