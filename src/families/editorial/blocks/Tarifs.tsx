import { Check } from "lucide-react";
import type { TarifsContent, TarifsMode, TarifItem } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { formatEUR, withBase } from "@/lib/utils";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";

function priceLabel(prix?: number | string): string | null {
  if (prix === undefined) return null;
  return typeof prix === "number" ? formatEUR(prix) : prix;
}

/** Une ligne de tarif à plat (pas de carte) : nom + inclus à gauche, prix à droite. */
function TarifRow({ item, mode }: { item: TarifItem; mode: TarifsMode }) {
  const price = priceLabel(item.prix);
  return (
    <div className="grid gap-x-8 gap-y-3 border-b border-border py-8 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="font-display text-xl font-semibold text-ink">{item.nom}</h3>
          {item.populaire && (
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              Le plus demandé
            </span>
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
 * Tarifs — éditorial : liste/table à filets fins (pas de cartes à ombre).
 * mode "sur-devis" → énoncé plat + CTA.
 */
export function Tarifs({ block, tone, basePath = "", strings }: BlockComponentProps<TarifsContent>) {
  const c = block.content;
  const mode = (block.mode as TarifsMode) ?? "grille";

  return (
    <EditorialSection id="tarifs" tone={tone}>
      <EditorialContainer>
        <EditorialHeading kicker="Tarifs" title={c.titre ?? strings.tarifs.defaultTitle} lede={c.intro} />

        {mode === "sur-devis" ? (
          <div className="mt-10 max-w-2xl border-t border-border pt-8">
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
        ) : (
          <>
            <div className="mt-12 border-t border-border">
              {(c.items ?? []).map((item) => (
                <TarifRow key={item.nom} item={item} mode={mode} />
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
