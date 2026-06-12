import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { withBase } from "@/lib/utils";
import { localeDir } from "@/lib/i18n";

/**
 * En-tête de page intérieure : fil d'ariane + eyebrow + H1 + intro + CTA.
 * Pose le H1 unique de la page (les autres titres de page sont des H2).
 */
export function PageHero({ block, basePath = "", locale, strings }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const crumbs = c.breadcrumb ?? [{ label: strings.pageHero.home, href: "/" }, { label: c.titre }];
  const Sep = localeDir(locale) === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <section className="relative overflow-hidden border-b border-border bg-alt">
      <div className="hero-mesh pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        <Reveal>
          <nav aria-label={strings.pageHero.breadcrumbAria} className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              {crumbs.map((b, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <li key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                    {i > 0 && <Sep className="size-3.5 text-muted-2" aria-hidden />}
                    {b.href && !last ? (
                      <Link
                        href={withBase(basePath, b.href)}
                        className="transition-colors hover:text-brand-700"
                      >
                        {b.label}
                      </Link>
                    ) : (
                      <span className={last ? "font-medium text-ink" : undefined} aria-current={last ? "page" : undefined}>
                        {b.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {c.eyebrow && (
            <Badge className="mb-4">
              <span className="size-1.5 rounded-full bg-brand-500" />
              {c.eyebrow}
            </Badge>
          )}
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
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
                <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="outline" size="lg">
                  {c.ctaSecondaire.label}
                </Button>
              )}
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
