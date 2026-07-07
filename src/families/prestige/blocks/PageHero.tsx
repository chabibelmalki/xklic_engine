import { Fragment } from "react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { PrestigeContainer } from "../ui/Container";

/**
 * PAGE HERO prestige — en-tête sombre des pages intérieures : fil d'ariane discret,
 * kicker à filet or, grand titre display. Ouvre chaque sous-page dans le même
 * registre nocturne que le chrome (pas de décrochage clair). 100 % serveur.
 */
export function PageHero({ block, basePath = "" }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const crumbs = c.breadcrumb ?? [];

  return (
    <section className="border-b border-[var(--px-hairline)] bg-[var(--px-void)] text-white">
      <PrestigeContainer className="pb-16 pt-28 sm:pt-32">
        {crumbs.length > 0 && (
          <nav aria-label="Fil d’ariane" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/55">
            {crumbs.map((b, i) => (
              <Fragment key={`${b.label}-${i}`}>
                {i > 0 && <span aria-hidden className="text-white/30">/</span>}
                {b.href ? (
                  <a href={withBase(basePath, b.href)} className="hover:text-white">
                    {b.label}
                  </a>
                ) : (
                  <span className="text-white/80">{b.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        )}

        {c.eyebrow && (
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-[var(--px-gold)]" />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--px-gold)]">
              {c.eyebrow}
            </span>
          </div>
        )}

        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl">
          {c.titre}
        </h1>

        {c.intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--px-ink-soft)]">{c.intro}</p>
        )}

        {(c.ctaPrimaire || c.ctaSecondaire) && (
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {c.ctaSecondaire && (
              <a
                href={withBase(basePath, c.ctaSecondaire.href)}
                className="inline-flex h-14 items-center justify-center border border-[var(--px-line)] px-8 text-base font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-[var(--px-gold)] hover:text-[var(--px-gold)]"
              >
                {c.ctaSecondaire.label}
              </a>
            )}
          </div>
        )}
      </PrestigeContainer>
    </section>
  );
}
