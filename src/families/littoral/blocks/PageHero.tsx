import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { localeDir } from "@/lib/i18n";
import { LittoralContainer } from "../ui/Container";
import { LittoralWave } from "../ui/Wave";
import { LittoralSunburst } from "../ui/Sunburst";

/**
 * En-tête de page intérieure — littoral : bandeau NUIT MARINE compact (navy
 * `brand-800` + soleil doré), fil d'ariane clair, kicker à point doré, grand H1
 * blanc, et la VAGUE signature en pied qui rejoint la première section claire.
 * Cohérent avec le hero d'accueil (bookend immersif sur chaque page).
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
    <section className="relative isolate overflow-hidden bg-brand-800">
      <LittoralSunburst />
      <LittoralContainer wide className="relative z-10 pb-28 pt-32 sm:pb-32 lg:pt-36">
        <nav aria-label={strings.pageHero.breadcrumbAria} className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-white/60">
            {crumbs.map((b, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <Sep className="size-3 text-white/40" aria-hidden />}
                  {b.href && !last ? (
                    <Link href={withBase(basePath, b.href)} className="hover:text-accent-50">
                      {b.label}
                    </Link>
                  ) : (
                    <span
                      className={last ? "text-white/90" : undefined}
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
          <div className="mb-6 flex items-center gap-3">
            <span className="size-2 shrink-0 rounded-full bg-accent-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-50">
              {c.eyebrow}
            </span>
          </div>
        )}
        <h1 className="max-w-3xl font-display text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl">
          {c.titre}
        </h1>
        {c.intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{c.intro}</p>
        )}

        {(c.ctaPrimaire || secondary) && (
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="accent" size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {secondary && (
              <Button href={withBase(basePath, secondary.href)} variant="white" size="lg">
                {secondary.label}
              </Button>
            )}
          </div>
        )}
      </LittoralContainer>

      <LittoralWave />
    </section>
  );
}
