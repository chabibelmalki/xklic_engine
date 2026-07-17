import Link from "next/link";
import { ChevronRight, ChevronLeft, Droplet } from "lucide-react";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { resolveHeroSecondary } from "@/lib/hero-cta";
import { localeDir } from "@/lib/i18n";
import { CascadeContainer } from "../ui/Container";
import { Aura, WaveEdge } from "../ui/Decor";

/**
 * En-tête de page intérieure — cascade : bandeau dégradé bleu→vert (plus compact
 * que le hero d'accueil), fil d'ariane clair, kicker en pilule à goutte, grand
 * H1 blanc, puis une VAGUE vers la page. Cohérent avec le hero, sans la carte.
 */
export function PageHero({ block, config, basePath = "", locale, strings }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  const secondary = resolveHeroSecondary(config, c.ctaSecondaire);
  const crumbs = c.breadcrumb ?? [{ label: strings.pageHero.home, href: "/" }, { label: c.titre }];
  const Sep = localeDir(locale) === "rtl" ? ChevronLeft : ChevronRight;
  const GRADIENT =
    "linear-gradient(140deg, var(--brand-800) 0%, var(--brand-600) 52%, color-mix(in srgb, var(--accent-600) 72%, var(--brand-700)) 100%)";

  return (
    <section className="relative isolate overflow-hidden text-white" style={{ background: GRADIENT }}>
      <Aura />
      <CascadeContainer className="relative z-20 pb-24 pt-12 sm:pb-28 sm:pt-16 lg:pt-20">
        <nav aria-label={strings.pageHero.breadcrumbAria} className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-white/70">
            {crumbs.map((b, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <Sep className="size-3 text-white/50" aria-hidden />}
                  {b.href && !last ? (
                    <Link href={withBase(basePath, b.href)} className="hover:text-white">
                      {b.label}
                    </Link>
                  ) : (
                    <span className={last ? "text-white" : undefined} aria-current={last ? "page" : undefined}>
                      {b.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {c.eyebrow && (
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            <Droplet className="size-3.5 fill-white/80 text-white/80" />
            {c.eyebrow}
          </span>
        )}
        <h1 className="max-w-3xl font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
          {c.titre}
        </h1>
        {c.intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">{c.intro}</p>}

        {(c.ctaPrimaire || secondary) && (
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="white" size="lg">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {secondary && (
              <Button
                href={withBase(basePath, secondary.href)}
                size="lg"
                className="border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                {secondary.label}
              </Button>
            )}
          </div>
        )}
      </CascadeContainer>

      <WaveEdge position="bottom" fill="var(--bg)" />
    </section>
  );
}
