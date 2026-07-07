"use client";

import { useState } from "react";
import { Sparkles, TrendingDown, Check } from "lucide-react";
import type { SimulateurContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { formatEUR, withBase } from "@/lib/utils";

/**
 * Simulateur d'économie générique (crédit d'impôt, remise, etc.). Tout est
 * paramétré par la config : libellés, bornes du curseur, prix plein/net,
 * facteur mensuel, plafond. Calcul 100 % côté client, indicatif.
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
    <Section id="simulateur" tone={tone}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Argumentaire */}
        <Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow={c.eyebrow ?? "Estimez votre coût"}
              title={
                <>
                  {c.argumentaireTitre ?? c.titre ?? strings.simulateur.defaultTitle}
                  {c.argumentaireAccent && (
                    <>
                      {" "}
                      <span className="text-gradient">{c.argumentaireAccent}</span>
                    </>
                  )}
                </>
              }
              intro={c.argumentaire ?? c.intro}
            />
            {c.points?.length ? (
              <ul className="mt-6 space-y-3">
                {c.points.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-brand-contrast">
                      <Check className="size-3" />
                    </span>
                    <span className="text-ink-soft">{item}</span>
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
        </Reveal>

        {/* Carte simulateur */}
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-theme border border-border bg-surface shadow-xl shadow-brand-600/5">
            <div className="bg-brand-gradient px-7 py-5">
              <div className="flex items-center gap-2 text-brand-contrast">
                <Sparkles className="size-5" />
                <h3 className="font-display text-lg font-bold">
                  {c.cardTitre ?? "Simulateur d'économie"}
                </h3>
              </div>
              {c.cardIntro && <p className="mt-1 text-sm text-brand-contrast/85">{c.cardIntro}</p>}
            </div>

            <div className="p-7">
              <label
                htmlFor="sim-range"
                className="flex items-end justify-between text-sm font-medium text-ink-soft"
              >
                {c.curseurLabel}
                <span className="font-display text-2xl font-bold text-brand-700">
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
                <span>
                  {c.min} {c.unite}
                </span>
                <span>
                  {c.max} {c.unite}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-surface-2 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Prix plein / mois
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-muted-2 line-through">
                    {formatEUR(Math.round(billedMonthly))}
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                    Votre coût / mois
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-brand-700">
                    {formatEUR(Math.round(netMonthly))}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-accent-50 p-4 ring-1 ring-accent-500/20">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-500 text-accent-contrast">
                  <TrendingDown className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-accent-600">
                    Vous économisez{" "}
                    <span className="font-bold">{formatEUR(Math.round(savedYearly))}</span> par an
                  </p>
                  <p className="text-xs text-accent-600/80">estimation indicative</p>
                </div>
              </div>

              {overCeiling && c.plafondAnnuel && (
                <p className="mt-3 text-xs text-muted">
                  ⚠️ Au-delà de {formatEUR(c.plafondAnnuel)} de dépenses annuelles, l&apos;aide est
                  plafonnée.
                </p>
              )}

              {c.cta && (
                <div className="mt-6">
                  <Button href={withBase(basePath, c.cta.href)} size="lg" className="w-full">
                    {c.cta.label}
                  </Button>
                </div>
              )}

              {c.note && <p className="mt-4 text-center text-xs text-muted-2">{c.note}</p>}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
