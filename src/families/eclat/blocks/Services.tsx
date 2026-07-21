import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { EclatHeading, Sparkle } from "../ui/Eclat";

/**
 * SERVICES éclat — des PANNEAUX À FILET, aérés. Chaque prestation est une case
 * blanche à bord fin, généreusement respirée, menée par une étincelle et un titre
 * en serif éditoriale. Pas d'aplat, pas d'ombre lourde : la lisibilité vient du
 * blanc et du trait. Au survol, le filet se teinte de marque et la case se lève
 * d'un cheveu (transform only, débrayable).
 */
export function Services({
  block,
  basePath = "",
  tone,
  strings,
}: BlockComponentProps<ServicesContent>) {
  const c = block.content;

  return (
    <EditorialSection id="services" tone={tone}>
      <EditorialContainer>
        <EclatHeading
          kicker={c.eyebrow}
          title={c.titre ?? strings.services.defaultTitle}
          lede={c.intro}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s) => {
            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl border border-border text-brand-600 transition-colors group-hover:border-brand-300 group-hover:bg-brand-50">
                    {s.emoji ? (
                      <span className="text-xl">{s.emoji}</span>
                    ) : (
                      <Icon name={s.icone} className="size-5" />
                    )}
                  </span>
                  {s.href && (
                    <ArrowUpRight className="size-5 shrink-0 text-muted-2 transition-colors group-hover:text-brand-600" />
                  )}
                </div>

                <h3 className="mt-6 flex items-start gap-2 font-display text-xl leading-tight text-ink">
                  <Sparkle className="mt-1.5 size-3.5 shrink-0 text-brand-500" />
                  {s.nom}
                </h3>
                {s.badge && (
                  <span className="mt-3 inline-block self-start rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-brand-700">
                    {s.badge}
                  </span>
                )}
                {s.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
                )}
                {s.priceHint && (
                  <p className="mt-auto pt-8 font-display text-lg text-ink">{s.priceHint}</p>
                )}
              </>
            );

            const cellCls = cn(
              "group flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-all duration-200 motion-safe:hover:-translate-y-1 hover:border-brand-300",
            );

            return s.href ? (
              <Link key={s.nom} href={withBase(basePath, s.href)} className={cellCls}>
                {inner}
              </Link>
            ) : (
              <div key={s.nom} className={cellCls}>
                {inner}
              </div>
            );
          })}
        </div>

        {c.cta && (
          <div className="mt-12">
            <Button
              href={withBase(basePath, c.cta.href)}
              variant="outline"
              size="lg"
              className="h-auto max-w-full whitespace-normal py-4 text-center"
            >
              {c.cta.label}
            </Button>
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
