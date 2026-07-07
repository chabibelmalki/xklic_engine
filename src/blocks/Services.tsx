import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { ServicesContent, ServiceItem } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn, withBase } from "@/lib/utils";
import { localeDir } from "@/lib/i18n";

/**
 * Services. variant : "cartes" (icône/emoji + badge + indice de prix, défaut) ·
 * "images" (vignette photo) · "grille-icones" (liste à filet) · "mosaique"
 * (1re tuile XXL colorée) · "index" (liste éditoriale numérotée : grand numéro +
 * nom + prix, filets fins — façon sommaire de magazine). Survol soigné, CTA optionnel.
 */
function Card({
  s,
  variant,
  basePath,
  locale,
  strings,
}: {
  s: ServiceItem;
  variant: string;
  basePath: string;
  locale: string;
  strings: UIStrings;
}) {
  const Fwd = localeDir(locale) === "rtl" ? ArrowLeft : ArrowRight;
  const inner = (
    <>
      {variant === "images" && s.image ? (
        <div className="relative aspect-[16/10]">
          <Image
            src={s.image.url}
            alt={s.image.alt ?? s.nom}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3 p-6 pb-0">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-600 transition-colors group-hover:bg-brand-100">
            {s.emoji ? s.emoji : <Icon name={s.icone} className="size-6" />}
          </span>
          {s.badge && (
            <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-600 ring-1 ring-inset ring-accent-500/30">
              {s.badge}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold text-ink">{s.nom}</h3>
        {s.description && (
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
        )}
        {(s.priceHint || s.href) && (
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            {s.priceHint ? (
              <span className="text-sm font-semibold text-brand-700">{s.priceHint}</span>
            ) : (
              <span />
            )}
            {s.href && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition-colors group-hover:text-brand-700">
                {strings.services.see} <Fwd className="size-4" />
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  const cls =
    "group flex h-full flex-col overflow-hidden rounded-theme border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/5";

  return s.href ? (
    <Link href={withBase(basePath, s.href)} className={cls}>
      {inner}
    </Link>
  ) : (
    <article className={cls}>{inner}</article>
  );
}

export function Services({
  block,
  tone,
  basePath = "",
  locale,
  strings,
}: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  const variant = block.variant ?? "cartes";
  const Fwd = localeDir(locale) === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <Section id="services" tone={tone}>
      <Reveal>
        <SectionHeading
          eyebrow={c.eyebrow ?? strings.services.defaultTitle}
          title={c.titre ?? strings.services.defaultTitle}
          intro={c.intro}
        />
      </Reveal>
      {variant === "grille-icones" ? (
        <div className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {c.items.map((s, i) => {
            const row = (
              <div
                className={cn(
                  "group flex gap-4 border-s-2 border-brand-200 ps-5",
                  s.href && "transition-colors hover:border-brand-400",
                )}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-theme bg-brand-50 text-2xl text-brand-600">
                  {s.emoji ? s.emoji : <Icon name={s.icone} className="size-6" />}
                </span>
                <div>
                  <h3 className="flex flex-wrap items-center gap-x-2 font-display text-lg font-bold text-ink">
                    {s.nom}
                    {s.badge && (
                      <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-600 ring-1 ring-inset ring-accent-500/30">
                        {s.badge}
                      </span>
                    )}
                  </h3>
                  {s.description && (
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.description}</p>
                  )}
                  {s.priceHint && (
                    <p className="mt-1.5 text-sm font-semibold text-brand-700">{s.priceHint}</p>
                  )}
                  {s.href && (
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-muted transition-colors group-hover:text-brand-700">
                      {strings.services.see} <Fwd className="size-4" />
                    </span>
                  )}
                </div>
              </div>
            );
            return (
              <Reveal key={s.nom} delay={(i % 2) * 0.05}>
                {s.href ? (
                  <Link href={withBase(basePath, s.href)} className="block">
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </Reveal>
            );
          })}
        </div>
      ) : variant === "index" ? (
        <div className="mt-12 border-t border-border">
          {c.items.map((s, i) => {
            const row = (
              <div className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b border-border py-7 transition-colors hover:bg-alt/50 sm:gap-x-10 sm:py-9">
                <span className="font-display text-4xl font-bold leading-none text-brand-400 tabular-nums sm:text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                  <div className="sm:max-w-2xl">
                    <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-2xl font-bold text-ink sm:text-3xl">
                      {s.nom}
                      {s.badge && (
                        <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-600 ring-1 ring-inset ring-accent-500/30">
                          {s.badge}
                        </span>
                      )}
                    </h3>
                    {s.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{s.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-5">
                    {s.priceHint && (
                      <span className="whitespace-nowrap text-sm font-semibold text-brand-700 sm:text-base">
                        {s.priceHint}
                      </span>
                    )}
                    {s.href && (
                      <span className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted transition-all group-hover:border-brand-400 group-hover:bg-brand-50 group-hover:text-brand-700">
                        <Fwd className="size-4" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
            return (
              <Reveal key={s.nom} delay={(i % 4) * 0.05}>
                {s.href ? (
                  <Link href={withBase(basePath, s.href)} className="block">
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </Reveal>
            );
          })}
        </div>
      ) : variant === "mosaique" ? (
        <div className="mt-12 grid auto-rows-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s, i) => {
            // 1re tuile mise en avant (large + colorée), les autres en surface.
            const feature = i === 0;
            const tileCls = cn(
              "group flex h-full flex-col justify-between gap-6 rounded-theme border p-6 transition-transform duration-300 hover:-translate-y-1",
              feature
                ? "border-transparent bg-brand-gradient text-brand-contrast lg:p-9"
                : "border-border bg-surface text-ink shadow-sm",
            );
            const tileInner = (
              <>
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-theme text-2xl",
                    feature ? "bg-white/15 text-brand-contrast" : "bg-brand-50 text-brand-600",
                  )}
                >
                  {s.emoji ? s.emoji : <Icon name={s.icone} className="size-6" />}
                </span>
                <div>
                  <h3 className={cn("font-display font-bold", feature ? "text-2xl lg:text-3xl" : "text-lg")}>
                    {s.nom}
                  </h3>
                  {s.description && (
                    <p className={cn("mt-2 text-sm leading-relaxed", feature ? "text-brand-contrast/85" : "text-muted")}>
                      {s.description}
                    </p>
                  )}
                  {s.priceHint && (
                    <p className={cn("mt-3 text-sm font-semibold", feature ? "text-brand-contrast" : "text-brand-700")}>
                      {s.priceHint}
                    </p>
                  )}
                  {s.href && (
                    <span
                      className={cn(
                        "mt-3 inline-flex items-center gap-1 text-sm font-semibold transition-opacity",
                        feature ? "text-brand-contrast/90" : "text-muted group-hover:text-brand-700",
                      )}
                    >
                      {strings.services.see} <Fwd className="size-4" />
                    </span>
                  )}
                </div>
              </>
            );
            return (
              <Reveal key={s.nom} delay={(i % 3) * 0.05} className={feature ? "lg:col-span-2 lg:row-span-2" : ""}>
                {s.href ? (
                  <Link href={withBase(basePath, s.href)} className={tileCls}>
                    {tileInner}
                  </Link>
                ) : (
                  <article className={tileCls}>{tileInner}</article>
                )}
              </Reveal>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s, i) => (
            <Reveal key={s.nom} delay={(i % 3) * 0.05}>
              <Card s={s} variant={variant} basePath={basePath} locale={locale} strings={strings} />
            </Reveal>
          ))}
        </div>
      )}
      {c.cta && (
        <Reveal>
          <div className="mt-10 text-center">
            <Button href={withBase(basePath, c.cta.href)} size="lg">
              {c.cta.label}
            </Button>
          </div>
        </Reveal>
      )}
    </Section>
  );
}
