import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { SignalHeading } from "../ui/Heading";

/**
 * SERVICES signal — GRILLE « bento » à filets : les cellules sont soudées par des
 * hairlines (gap-px sur fond de bordure), la PREMIÈRE occupe deux colonnes (tuile
 * vedette). Chaque cellule porte une ÉTIQUETTE d'index (« 01 »), une puce d'icône
 * carrée qui s'inverse au survol, et une flèche d'accès. Registre net et
 * modulaire, à l'opposé des cartes flottantes d'épure. Tokens.
 */
export function Services({ block, basePath = "", tone, strings }: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  return (
    <EditorialSection id="services" tone={tone}>
      <EditorialContainer>
        <SignalHeading kicker={c.eyebrow} title={c.titre ?? strings.services.defaultTitle} lede={c.intro} />

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s, i) => {
            const feature = i === 0;
            // Tuile vedette de FIN : on élargit la dernière cellule à 2 colonnes
            // UNIQUEMENT quand cela remplit exactement la grille lg (3 col) — la
            // vedette de tête compte pour 2, donc (n + 2) doit être multiple de 3.
            // Les grilles courtes (« prestations liées » à 3 items) restent uniformes.
            const wideLast = i > 0 && i === c.items.length - 1 && (c.items.length + 2) % 3 === 0;
            const big = feature || wideLast;
            const inner = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-grid size-11 shrink-0 place-items-center bg-brand-50 text-brand-600 transition-colors duration-200 group-hover:bg-brand-600 group-hover:text-brand-contrast">
                    {s.emoji ? (
                      <span className="text-xl">{s.emoji}</span>
                    ) : (
                      <Icon name={s.icone} className="size-5" />
                    )}
                  </span>
                  <span className="font-display text-xs font-bold tabular-nums tracking-[0.2em] text-muted-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3
                  className={cn(
                    "mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-display font-bold text-ink",
                    big ? "text-xl" : "text-lg",
                  )}
                >
                  {s.nom}
                  {s.badge && (
                    <span className="bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-600 ring-1 ring-inset ring-accent-500/30">
                      {s.badge}
                    </span>
                  )}
                </h3>
                {s.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  {s.priceHint ? (
                    <span className="bg-brand-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                      {s.priceHint}
                    </span>
                  ) : (
                    <span />
                  )}
                  {s.href && (
                    <span className="inline-grid size-9 place-items-center border border-border text-muted-2 transition-all duration-200 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-700">
                      <ArrowUpRight className="size-4" />
                    </span>
                  )}
                </div>
              </>
            );
            const cellCls = cn(
              "group relative flex h-full flex-col bg-surface p-6 transition-colors duration-200 sm:p-7",
              feature && "sm:col-span-2 lg:col-span-2",
              // Dernière tuile élargie : seulement en lg (3 col), pour ne pas créer
              // de trou en sm (2 col) où elle tomberait mal.
              wideLast && "lg:col-span-2",
              s.href && "hover:bg-alt",
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
            {/* Le `Button` partagé force `whitespace-nowrap` : un libellé de maillage
                long (fréquent ici) débordait de l'écran en mobile. On autorise le
                retour à la ligne + une hauteur libre, sans toucher au composant
                partagé (twMerge fait gagner ces classes). */}
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
