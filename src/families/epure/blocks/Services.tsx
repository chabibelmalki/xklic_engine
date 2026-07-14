import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { EpureHeading } from "../ui/Heading";

/**
 * SERVICES atelier — CARTES à parti pris FORT : bordure épaisse, ombre DURE
 * décalée (portée par la marque) qui s'accentue au survol (la carte « claque » et
 * se décale). Chip d'icône carré plein, étiquette de prix majuscule, flèche.
 * Tolérant à un nombre impair d'items. Distinct des cartes lisses de classic.
 */
export function Services({ block, basePath = "", tone, strings }: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  return (
    <EditorialSection id="services" tone={tone}>
      <EditorialContainer>
        <EpureHeading kicker={c.eyebrow} title={c.titre ?? strings.services.defaultTitle} lede={c.intro} />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s) => {
            const inner = (
              <>
                <span className="mb-5 inline-grid size-12 shrink-0 place-items-center rounded-[0.5rem] bg-brand-800 text-2xl text-brand-contrast">
                  {s.emoji ? s.emoji : <Icon name={s.icone} className="size-6" />}
                </span>
                <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-xl font-bold leading-tight text-ink">
                  {s.nom}
                  {s.badge && (
                    <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-bold uppercase text-accent-600 ring-1 ring-inset ring-accent-500/40">
                      {s.badge}
                    </span>
                  )}
                </h3>
                {s.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  {s.priceHint ? (
                    <span className="rounded-[0.3rem] border-2 border-brand-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">
                      {s.priceHint}
                    </span>
                  ) : (
                    <span />
                  )}
                  {s.href && (
                    <ArrowUpRight className="size-6 shrink-0 text-brand-700 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </div>
              </>
            );
            const cellCls = cn(
              "group flex h-full flex-col rounded-[var(--radius-card)] border-2 border-brand-800 bg-surface p-6 shadow-[4px_4px_0_0_var(--brand-800)] transition-all duration-200 sm:p-7",
              s.href &&
                "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--brand-600)]",
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
            <Button href={withBase(basePath, c.cta.href)} variant="outline" size="lg">
              {c.cta.label}
            </Button>
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
