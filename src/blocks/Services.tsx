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
import { withBase } from "@/lib/utils";
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
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {c.items.map((s, i) => (
          <Reveal key={s.nom} delay={(i % 3) * 0.05}>
            <Card s={s} variant={variant} basePath={basePath} locale={locale} strings={strings} />
          </Reveal>
        ))}
      </div>
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
