"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { SimulateurContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { formatEUR, withBase } from "@/lib/utils";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";

/**
 * Simulateur d'économie — éditorial. Seule interactivité : le curseur (range),
 * client par nécessité (pas de motion lourd). Présentation PLATE : panneau à
 * filets, grands chiffres, pas de carte dégradée. Calcul indicatif côté client.
 */
export function Simulateur({ block, tone, basePath = "", strings }: BlockComponentProps<SimulateurContent>) {
  const c = block.content;
  const [value, setValue] = useState(c.defaut);

  const facteur = c.facteurMensuel ?? 4.33;
  const monthlyUnits = value * facteur;
  const billedMonthly = monthlyUnits * c.prixPlein;
  const netMonthly = monthlyUnits * c.prixNet;
  const savedYearly = (billedMonthly - netMonthly) * 12;
  const overCeiling = c.plafondAnnuel ? billedMonthly * 12 > c.plafondAnnuel : false;

  return (
    <EditorialSection id="simulateur" tone={tone}>
      <EditorialContainer>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <EditorialHeading
              kicker={c.eyebrow ?? "Estimez votre coût"}
              title={
                <>
                  {c.argumentaireTitre ?? c.titre ?? strings.simulateur.defaultTitle}
                  {c.argumentaireAccent && <span className="text-brand-600"> {c.argumentaireAccent}</span>}
                </>
              }
              lede={c.argumentaire ?? c.intro}
            />
            {c.points?.length ? (
              <ul className="mt-8 space-y-3">
                {c.points.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-ink-soft">
                    <Check className="mt-1 size-4 shrink-0 text-brand-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {c.ctaSecondaire && (
              <div className="mt-8">
                <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="outline">
                  {c.ctaSecondaire.label}
                </Button>
              </div>
            )}
          </div>

          {/* Panneau simulateur : plat, filets, grands chiffres. */}
          <div className="border-t-2 border-ink pt-8">
            {c.cardTitre && (
              <h3 className="font-display text-xl font-semibold text-ink">{c.cardTitre}</h3>
            )}
            {c.cardIntro && <p className="mt-1 text-sm text-muted">{c.cardIntro}</p>}

            <label htmlFor="sim-range" className="mt-6 flex items-end justify-between text-sm font-medium text-ink-soft">
              {c.curseurLabel}
              <span className="font-display text-2xl font-semibold text-brand-700">
                {value} {c.unite}
              </span>
            </label>
            <input
              id="sim-range"
              type="range"
              min={c.min}
              max={c.max}
              step={c.step ?? 1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="mt-3 w-full"
              aria-valuetext={`${value} ${c.unite ?? ""}`}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-2">
              <span>{c.min} {c.unite}</span>
              <span>{c.max} {c.unite}</span>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border">
              <div className="bg-bg p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Prix plein / mois</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-muted-2 line-through">
                  {formatEUR(Math.round(billedMonthly))}
                </dd>
              </div>
              <div className="bg-bg p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">Votre coût / mois</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-ink">
                  {formatEUR(Math.round(netMonthly))}
                </dd>
              </div>
            </dl>

            <p className="mt-6 font-display text-lg text-ink">
              Vous économisez{" "}
              <span className="font-semibold text-brand-700">{formatEUR(Math.round(savedYearly))}</span> / an
              <span className="ms-2 text-sm font-normal text-muted">(estimation indicative)</span>
            </p>

            {overCeiling && c.plafondAnnuel && (
              <p className="mt-3 text-xs text-muted">
                Au-delà de {formatEUR(c.plafondAnnuel)} de dépenses annuelles, l&apos;aide est plafonnée.
              </p>
            )}
            {c.cta && (
              <div className="mt-7">
                <Button href={withBase(basePath, c.cta.href)} size="lg">
                  {c.cta.label}
                </Button>
              </div>
            )}
            {c.note && <p className="mt-4 text-xs text-muted-2">{c.note}</p>}
          </div>
        </div>
      </EditorialContainer>
    </EditorialSection>
  );
}
