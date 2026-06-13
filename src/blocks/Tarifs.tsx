import { Check, FileText } from "lucide-react";
import type { TarifsContent, TarifsMode, TarifItem } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { formatEUR, cn, withBase } from "@/lib/utils";

function priceLabel(prix?: number | string): string | null {
  if (prix === undefined) return null;
  return typeof prix === "number" ? formatEUR(prix) : prix;
}

function PriceCard({ item, mode }: { item: TarifItem; mode: TarifsMode }) {
  const price = priceLabel(item.prix);
  return (
    <article
      className={cn(
        // overflow-visible : la pastille flottante n'est jamais rognée.
        "relative flex h-full flex-col rounded-theme border bg-surface p-6 shadow-sm transition-shadow hover:shadow-lg",
        item.populaire ? "border-brand-500 pt-9 ring-1 ring-brand-500" : "border-border",
      )}
    >
      {item.populaire && (
        <span className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-contrast shadow-lg shadow-brand-600/30">
          Le plus demandé
        </span>
      )}
      <h3 className="font-display text-lg font-bold text-ink">{item.nom}</h3>
      {item.description && <p className="mt-1 text-sm text-muted">{item.description}</p>}
      {price && (
        <p className="mt-4 flex items-baseline gap-1.5">
          {mode === "a-partir-de" && <span className="text-sm text-muted">dès</span>}
          <span className="font-display text-3xl font-extrabold text-ink">{price}</span>
          {item.unite && <span className="text-sm text-muted">{item.unite}</span>}
        </p>
      )}
      {item.inclus?.length ? (
        <ul className="mt-5 space-y-2.5 text-sm text-ink-soft">
          {item.inclus.map((i) => (
            <li key={i} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-600" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

/**
 * Tarifs. mode : "grille" (cartes de prix) · "a-partir-de" (prix plancher) ·
 * "sur-devis" (panneau + CTA). La carte "populaire" porte une pastille solide,
 * centrée et surélevée — toujours parfaitement lisible.
 */
export function Tarifs({ block, index, basePath = "", strings }: BlockComponentProps<TarifsContent>) {
  const c = block.content;
  const mode = (block.mode as TarifsMode) ?? "grille";
  // variant "mise-en-avant" : la carte `populaire` est surélevée/agrandie.
  const emphasize = block.variant === "mise-en-avant";

  return (
    <Section id="tarifs" tone={toneForIndex(index)}>
      <Reveal>
        <SectionHeading eyebrow="Tarifs" title={c.titre ?? strings.tarifs.defaultTitle} intro={c.intro} />
      </Reveal>

      {mode === "sur-devis" ? (
        <Reveal>
          <div className="mx-auto mt-10 max-w-xl rounded-theme border border-border bg-surface p-8 text-center shadow-sm">
            <span className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FileText className="size-6" />
            </span>
            <p className="text-muted">
              Chaque prestation est unique : nous établissons un devis gratuit, clair et sans
              engagement, adapté à votre besoin.
            </p>
            {c.cta && (
              <div className="mt-6 flex justify-center">
                <Button href={withBase(basePath, c.cta.href)} size="lg">
                  {c.cta.label}
                </Button>
              </div>
            )}
          </div>
        </Reveal>
      ) : (
        <>
          <div
            className={cn(
              "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
              emphasize ? "items-center" : "items-stretch",
            )}
          >
            {(c.items ?? []).map((item, i) => (
              <Reveal
                key={item.nom}
                delay={(i % 3) * 0.05}
                className={emphasize && item.populaire ? "lg:scale-[1.05]" : undefined}
              >
                <PriceCard item={item} mode={mode} />
              </Reveal>
            ))}
          </div>
          {c.cta && (
            <Reveal>
              <div className="mt-10 text-center">
                <Button href={withBase(basePath, c.cta.href)} variant="outline" size="lg">
                  {c.cta.label}
                </Button>
              </div>
            </Reveal>
          )}
        </>
      )}

      {c.note && <p className="mt-6 text-center text-sm text-muted">{c.note}</p>}
    </Section>
  );
}
