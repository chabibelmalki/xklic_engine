import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { EditorialHeading } from "../../editorial/ui/Heading";

/**
 * SERVICES épure — CARTES soignées, indépendantes (rayon, filet, ombre douce),
 * chip d'icône teinté marque qui s'inverse au survol, indice de prix en
 * étiquette, flèche d'accès. Grille tolérante à un nombre impair d'items (aucune
 * cellule vide). Registre net et chaleureux, distinct des cartes classic. Tokens.
 */
export function Services({ block, basePath = "", tone, strings }: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  return (
    <EditorialSection id="services" tone={tone}>
      <EditorialContainer>
        <EditorialHeading kicker={c.eyebrow} title={c.titre ?? strings.services.defaultTitle} lede={c.intro} />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s) => {
            const inner = (
              <>
                <span className="mb-5 inline-grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl text-brand-600 transition-colors duration-200 group-hover:bg-brand-600 group-hover:text-brand-contrast">
                  {s.emoji ? s.emoji : <Icon name={s.icone} className="size-6" />}
                </span>
                <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-lg font-bold text-ink">
                  {s.nom}
                  {s.badge && (
                    <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-600 ring-1 ring-inset ring-accent-500/30">
                      {s.badge}
                    </span>
                  )}
                </h3>
                {s.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  {s.priceHint ? (
                    <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                      {s.priceHint}
                    </span>
                  ) : (
                    <span />
                  )}
                  {s.href && (
                    <span className="inline-grid size-9 place-items-center rounded-full border border-border text-muted-2 transition-all duration-200 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-700">
                      <ArrowUpRight className="size-4" />
                    </span>
                  )}
                </div>
              </>
            );
            const cellCls = cn(
              "group flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-surface p-6 transition-all duration-200 sm:p-7",
              s.href && "hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-card)]",
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
          <div className="mt-10">
            <Button href={withBase(basePath, c.cta.href)} variant="outline" size="lg">
              {c.cta.label}
            </Button>
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
