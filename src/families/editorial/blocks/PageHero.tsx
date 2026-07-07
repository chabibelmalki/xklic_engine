import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { localeDir } from "@/lib/i18n";
import { EditorialContainer } from "../ui/Container";

/**
 * En-tête de page intérieure — éditorial : filet-bas, kicker à filet MAJUSCULE,
 * grand H1 aligné à gauche, fil d'ariane sobre. Pas de fond mesh, pas de carte.
 */
export function PageHero({
  block,
  config,
  basePath = "",
  locale,
  strings,
}: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const crumbs = c.breadcrumb ?? [{ label: strings.pageHero.home, href: "/" }, { label: c.titre }];
  const Sep = localeDir(locale) === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <section className="border-b border-border bg-bg">
      <EditorialContainer className="py-16 sm:py-20 lg:py-24">
        <nav aria-label={strings.pageHero.breadcrumbAria} className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted">
            {crumbs.map((b, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <Sep className="size-3 text-muted-2" aria-hidden />}
                  {b.href && !last ? (
                    <Link href={withBase(basePath, b.href)} className="hover:text-ink">
                      {b.label}
                    </Link>
                  ) : (
                    <span className={last ? "text-ink" : undefined} aria-current={last ? "page" : undefined}>
                      {b.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {c.eyebrow && (
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
              {c.eyebrow}
            </span>
          </div>
        )}
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {c.titre}
        </h1>
        {c.intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{c.intro}</p>
        )}

        {(c.ctaPrimaire || secondary) && (
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {secondary && (
              <Button href={withBase(basePath, secondary.href)} variant="outline" size="lg">
                {secondary.label}
              </Button>
            )}
          </div>
        )}
      </EditorialContainer>
    </section>
  );
}
