import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { ServicesContent, ServiceItem } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn, withBase } from "@/lib/utils";
import { localeDir } from "@/lib/i18n";

/**
 * Services. variant : "cartes" (icône/emoji + badge + indice de prix, défaut) ·
 * "images" (vignette photo). Survol soigné, CTA optionnel sous la grille.
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
  index,
  basePath = "",
  locale,
  strings,
}: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  const variant = block.variant ?? "cartes";

  return (
    <Section id="services" tone={toneForIndex(index)}>
      <Reveal>
        <SectionHeading
          eyebrow={c.eyebrow ?? strings.services.defaultTitle}
          title={c.titre ?? strings.services.defaultTitle}
          intro={c.intro}
        />
      </Reveal>
      {variant === "grille-icones" ? (
        <div className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {c.items.map((s, i) => (
            <Reveal key={s.nom} delay={(i % 2) * 0.05}>
              <div className="flex gap-4 border-s-2 border-brand-200 ps-5">
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
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : variant === "mosaique" ? (
        <div className="mt-12 grid auto-rows-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s, i) => {
            // 1re tuile mise en avant (large + colorée), les autres en surface.
            const feature = i === 0;
            return (
              <Reveal key={s.nom} delay={(i % 3) * 0.05} className={feature ? "lg:col-span-2 lg:row-span-2" : ""}>
                <article
                  className={cn(
                    "flex h-full flex-col justify-between gap-6 rounded-theme border p-6 transition-transform duration-300 hover:-translate-y-1",
                    feature
                      ? "border-transparent bg-brand-gradient text-brand-contrast lg:p-9"
                      : "border-border bg-surface text-ink shadow-sm",
                  )}
                >
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
                  </div>
                </article>
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
