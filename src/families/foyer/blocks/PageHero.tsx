import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { localeDir } from "@/lib/i18n";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * En-tête de page intérieure — foyer : fond crème teinté marque, fil d'ariane en
 * petites pastilles, kicker MANUSCRIT (script) + petit trait miel, grand H1
 * serif chaleureux, terminé par un liseré COUTURE pointillé en pied. Chaleureux
 * et personnel, cohérent avec le hero d'accueil. Couleurs 100 % tokens.
 */
export function PageHero({ block, config, basePath = "", locale, strings }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const crumbs = c.breadcrumb ?? [{ label: strings.pageHero.home, href: "/" }, { label: c.titre }];
  const Sep = localeDir(locale) === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <section className="relative border-b border-dashed border-brand-200 bg-[color-mix(in_srgb,var(--brand-500)_5%,var(--bg))]">
      <EditorialContainer className="py-14 sm:py-18 lg:py-20">
        <nav aria-label={strings.pageHero.breadcrumbAria} className="mb-7">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
            {crumbs.map((b, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <Sep className="size-3 text-muted-2" aria-hidden />}
                  {b.href && !last ? (
                    <Link
                      href={withBase(basePath, b.href)}
                      className="rounded-full bg-surface px-2.5 py-1 font-medium text-ink-soft transition-colors hover:text-brand-700"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span
                      className={last ? "rounded-full bg-brand-100 px-2.5 py-1 font-medium text-brand-800" : undefined}
                      aria-current={last ? "page" : undefined}
                    >
                      {b.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {c.eyebrow && (
          <p className="foyer-script mb-1 text-[1.7rem] leading-none text-brand-600 sm:text-3xl">
            {c.eyebrow}
          </p>
        )}
        <h1 className="pack-heading max-w-3xl font-display text-[2.4rem] font-semibold leading-[1.05] text-ink sm:text-5xl lg:text-[3.5rem]">
          {c.titre}
        </h1>
        {c.intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{c.intro}</p>}

        {(c.ctaPrimaire || secondary) && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
