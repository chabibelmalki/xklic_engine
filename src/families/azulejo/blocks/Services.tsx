import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { AzulejoHeading, TileMotif } from "../ui/Azulejo";

/**
 * SERVICES azulejo — un PAN DE CARREAUX émaillés. Chaque prestation est une
 * TOMETTE : carreau à coins arrondis doux, reflet d'émail en haut, joint fin
 * (bordure), motif quatre-feuilles en filigrane dans l'angle. Les carreaux sont
 * UNIFORMES (pas un damier deux-tons comme riso) : c'est la régularité d'un mur
 * de faïence, et l'émail + le motif + le serif les distinguent des cartes plates
 * de classic.
 *
 * Au survol, le carreau se soulève d'un cheveu (transform only, 60 fps) comme un
 * carreau qu'on décolle — inerte sous `prefers-reduced-motion`.
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
        <AzulejoHeading
          kicker={c.eyebrow}
          title={c.titre ?? strings.services.defaultTitle}
          lede={c.intro}
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s) => {
            const inner = (
              <>
                {/* Reflet d'émail + motif de carreau en filigrane. */}
                <span aria-hidden className="azulejo-glaze pointer-events-none absolute inset-0" />
                <TileMotif
                  className="pointer-events-none absolute -right-3 -top-3 size-20 text-brand-500/[0.07]"
                />

                <span className="relative grid size-12 shrink-0 place-items-center rounded-lg bg-brand-600 text-brand-contrast">
                  {s.emoji ? (
                    <span className="text-xl">{s.emoji}</span>
                  ) : (
                    <Icon name={s.icone} className="size-6" />
                  )}
                </span>

                <h3 className="relative mt-6 font-display text-xl leading-tight text-ink">
                  {s.nom}
                </h3>
                {s.badge && (
                  <span className="relative mt-3 inline-block self-start rounded bg-accent-500 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-accent-contrast">
                    {s.badge}
                  </span>
                )}
                {s.description && (
                  <p className="relative mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
                )}

                <div className="relative mt-auto flex items-center justify-between gap-3 pt-8">
                  {s.priceHint ? (
                    <span className="font-display text-lg text-brand-700">{s.priceHint}</span>
                  ) : (
                    <span />
                  )}
                  {s.href && (
                    <ArrowRight className="size-5 shrink-0 text-brand-600 transition-transform duration-200 group-hover:translate-x-1.5" />
                  )}
                </div>
              </>
            );

            const cellCls = cn(
              "group relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface p-7 shadow-[var(--shadow-card)] transition-transform duration-200 motion-safe:hover:-translate-y-1",
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
