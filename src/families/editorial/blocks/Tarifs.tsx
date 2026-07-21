import { Check } from "lucide-react";
import type { TarifsContent, TarifsMode, TarifItem } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { cn, formatEUR, withBase } from "@/lib/utils";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";

function priceLabel(prix?: number | string): string | null {
  if (prix === undefined) return null;
  return typeof prix === "number" ? formatEUR(prix) : prix;
}

/** Ligne de tarif à plat (mode "a-partir-de") : nom + inclus à gauche, prix à droite. */
function TarifRow({ item, mode, popularLabel }: { item: TarifItem; mode: TarifsMode; popularLabel: string }) {
  const price = priceLabel(item.prix);
  return (
    <div className="grid gap-x-8 gap-y-3 border-b border-border py-8 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="font-display text-xl font-semibold text-ink">{item.nom}</h3>
          {item.populaire && (
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">{popularLabel}</span>
          )}
        </div>
        {item.description && <p className="mt-1.5 max-w-xl text-muted">{item.description}</p>}
        {item.inclus?.length ? (
          <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm text-ink-soft sm:grid-cols-2">
            {item.inclus.map((i) => (
              <li key={i} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {price && (
        <p className="flex items-baseline gap-1.5 sm:justify-end sm:text-right">
          {mode === "a-partir-de" && <span className="text-sm text-muted">dès</span>}
          <span className="font-display text-3xl font-semibold text-ink">{price}</span>
          {item.unite && <span className="text-sm text-muted">{item.unite}</span>}
        </p>
      )}
    </div>
  );
}

/**
 * Carte de prix (mode "grille") — cartes façon « pricing ». La carte `populaire`
 * est MISE EN AVANT : fond encre, texte clair, léger relief et pastille de marque.
 */
function TarifCard({ item, popularLabel }: { item: TarifItem; popularLabel: string }) {
  const price = priceLabel(item.prix);
  const hot = !!item.populaire;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-8",
        hot
          ? "border-transparent bg-ink text-white shadow-2xl lg:-translate-y-3"
          : "border-border bg-surface shadow-sm",
      )}
    >
      {hot && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-3.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
          {popularLabel}
        </span>
      )}
      {price && (
        <p className={cn("font-display text-4xl font-semibold", hot ? "text-brand-300" : "text-brand-600")}>
          {price}
          {item.unite && <span className="ml-1 text-base font-normal text-muted">{item.unite}</span>}
        </p>
      )}
      <p className={cn("mt-1.5 text-xs font-semibold uppercase tracking-[0.14em]", hot ? "text-white/55" : "text-muted")}>
        {item.nom}
      </p>
      {item.description && (
        <p className={cn("mt-3 text-sm leading-relaxed", hot ? "text-white/75" : "text-muted")}>{item.description}</p>
      )}
      {item.inclus?.length ? (
        <ul className={cn("mt-6 space-y-3 border-t pt-5 text-sm", hot ? "border-white/15" : "border-border")}>
          {item.inclus.map((i) => (
            <li key={i} className="flex gap-2.5">
              <Check className={cn("mt-0.5 size-4 shrink-0", hot ? "text-brand-300" : "text-brand-600")} />
              <span className={hot ? "text-white/90" : "text-ink-soft"}>{i}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Tarifs — éditorial. mode "grille" → cartes (carte populaire mise en avant) ·
 * "a-partir-de" → liste/table à filets fins · "sur-devis" → énoncé plat + CTA.
 */
export function Tarifs({ block, tone, basePath = "", strings }: BlockComponentProps<TarifsContent>) {
  const c = block.content;
  const mode = (block.mode as TarifsMode) ?? "grille";
  const popularLabel = strings.tarifs.popular;
  const hasHeading = Boolean(c.titre || c.intro);

  return (
    <EditorialSection id="tarifs" tone={tone}>
      <EditorialContainer>
        {hasHeading && (
          <EditorialHeading kicker="Tarifs" title={c.titre ?? strings.tarifs.defaultTitle} lede={c.intro} />
        )}

        {mode === "sur-devis" ? (
          <div className={cn("max-w-2xl border-t border-border pt-8", hasHeading && "mt-10")}>
            <p className="text-lg leading-relaxed text-ink-soft">
              Chaque prestation est unique : nous établissons un devis gratuit, clair et sans
              engagement, adapté à votre besoin.
            </p>
            {c.cta && (
              <div className="mt-7">
                <Button href={withBase(basePath, c.cta.href)} size="lg">
                  {c.cta.label}
                </Button>
              </div>
            )}
          </div>
        ) : mode === "grille" ? (
          <>
            <div className={cn("grid gap-6 sm:gap-7 lg:grid-cols-3 lg:items-stretch", hasHeading ? "mt-12" : "mt-2")}>
              {(c.items ?? []).map((item) => (
                <TarifCard key={item.nom} item={item} popularLabel={popularLabel} />
              ))}
            </div>
            {c.cta && (
              <div className="mt-10 text-center">
                <Button href={withBase(basePath, c.cta.href)} variant="outline" size="lg">
                  {c.cta.label}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={cn("border-t border-border", hasHeading ? "mt-12" : "mt-2")}>
              {(c.items ?? []).map((item) => (
                <TarifRow key={item.nom} item={item} mode={mode} popularLabel={popularLabel} />
              ))}
            </div>
            {c.cta && (
              <div className="mt-10">
                <Button href={withBase(basePath, c.cta.href)} variant="outline" size="lg">
                  {c.cta.label}
                </Button>
              </div>
            )}
          </>
        )}

        {c.note && <p className="mt-6 text-sm text-muted">{c.note}</p>}
      </EditorialContainer>
    </EditorialSection>
  );
}
