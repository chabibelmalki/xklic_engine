"use client";

import { useMemo, useState } from "react";
import { Calculator, MapPin, Route } from "lucide-react";
import type {
  SimulateurTaxiContent,
  SimulateurTaxiVarianteOption,
  SimulateurTaxiSupplement,
} from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { formatEUR, withBase } from "@/lib/utils";

/**
 * SIMULATEUR TAXI — estimateur de prix de course paramétrable. L'utilisateur
 * saisit une distance (km), choisit des variantes (moment, véhicule…) via des
 * sélecteurs exclusifs et coche des suppléments ; le prix approximatif est
 * calculé 100 % côté client, à titre indicatif.
 *
 * Formule : total = max( (priseEnCharge + Σmontants + distance·Σprix/km)
 *                        · (1 + Σmajorations% / 100), minimumCourse ).
 *
 * Toutes les valeurs viennent de la config (aucune règle métier en dur) :
 * réutilisable pour tout taxi / VTC. Fonds/encres via tokens → s'adapte au
 * thème (clair comme sombre, ex. pack prestige-nuit).
 */
export function SimulateurTaxi({
  block,
  tone,
  basePath = "",
}: BlockComponentProps<SimulateurTaxiContent>) {
  const c = block.content;

  const priseEnCharge = c.priseEnCharge ?? 0;
  const minimumCourse = c.minimumCourse ?? 0;
  const unite = c.unite ?? "km";
  const min = c.distanceMin ?? 1;
  const max = c.distanceMax ?? 200;
  const step = c.distanceStep ?? 1;
  const margePct = c.margePct ?? 10;
  const variantes = useMemo(() => c.variantes ?? [], [c.variantes]);
  const supplements = useMemo(() => c.supplements ?? [], [c.supplements]);

  const [distance, setDistance] = useState(c.distanceDefaut ?? Math.round((min + max) / 4));

  // Option sélectionnée par groupe (défaut : 1re option du groupe).
  const [choix, setChoix] = useState<Record<string, string>>(() =>
    Object.fromEntries(variantes.map((g) => [g.id, g.options[0]?.id]).filter(([, v]) => v)),
  );
  // Suppléments cochés.
  const [coches, setCoches] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(supplements.map((s) => [s.id, Boolean(s.defaut)])),
  );

  const { total, bas, haut } = useMemo(() => {
    const optionsChoisies: SimulateurTaxiVarianteOption[] = variantes
      .map((g) => g.options.find((o) => o.id === choix[g.id]))
      .filter((o): o is SimulateurTaxiVarianteOption => Boolean(o));
    const suppActifs: SimulateurTaxiSupplement[] = supplements.filter((s) => coches[s.id]);

    const prixKm = optionsChoisies.reduce((sum, o) => sum + (o.prixKm ?? 0), 0);
    const forfaits =
      priseEnCharge +
      optionsChoisies.reduce((sum, o) => sum + (o.montant ?? 0), 0) +
      suppActifs.reduce((sum, s) => sum + (s.montant ?? 0), 0);
    const majPct =
      optionsChoisies.reduce((sum, o) => sum + (o.majorationPct ?? 0), 0) +
      suppActifs.reduce((sum, s) => sum + (s.majorationPct ?? 0), 0);

    const brut = (forfaits + distance * prixKm) * (1 + majPct / 100);
    const t = Math.max(brut, minimumCourse);
    const m = margePct / 100;
    return { total: t, bas: t * (1 - m), haut: t * (1 + m) };
  }, [variantes, supplements, choix, coches, distance, priseEnCharge, minimumCourse, margePct]);

  const showRange = margePct > 0;

  return (
    <Section id="simulateur-taxi" tone={tone}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Argumentaire */}
        <Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow={c.eyebrow ?? "Estimateur de prix"}
              title={
                <>
                  {c.argumentaireTitre ?? c.titre ?? "Estimez le prix de votre course"}
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
                      <Route className="size-3" />
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
                <Calculator className="size-5" />
                <h3 className="font-display text-lg font-bold">
                  {c.cardTitre ?? "Simulateur de course"}
                </h3>
              </div>
              {c.cardIntro && <p className="mt-1 text-sm text-brand-contrast/85">{c.cardIntro}</p>}
            </div>

            <div className="p-7">
              {/* Distance */}
              <label
                htmlFor="taxi-distance"
                className="flex items-end justify-between text-sm font-medium text-ink-soft"
              >
                {c.distanceLabel ?? "Distance du trajet"}
                <span className="font-display text-2xl font-bold text-brand-700">
                  {distance} {unite}
                </span>
              </label>
              <input
                id="taxi-distance"
                type="range"
                min={min}
                max={max}
                step={step}
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="mt-3 w-full"
                aria-valuetext={`${distance} ${unite}`}
              />
              <div className="mt-1 flex justify-between text-xs text-muted-2">
                <span>
                  {min} {unite}
                </span>
                <span>
                  {max} {unite}
                </span>
              </div>

              {/* Variantes (sélecteurs exclusifs) */}
              {variantes.map((g) => (
                <fieldset key={g.id} className="mt-6">
                  <legend className="text-sm font-medium text-ink-soft">{g.label}</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {g.options.map((o) => {
                      const active = choix[g.id] === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setChoix((prev) => ({ ...prev, [g.id]: o.id }))}
                          title={o.description}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "border-brand-600 bg-brand-600 text-brand-contrast shadow-sm"
                              : "border-border bg-surface-2 text-ink-soft hover:border-brand-300"
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              {/* Suppléments (cases à cocher) */}
              {supplements.length > 0 && (
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium text-ink-soft">Suppléments</legend>
                  <div className="mt-2 space-y-2">
                    {supplements.map((s) => (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface-2 px-4 py-2.5 text-sm text-ink-soft"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(coches[s.id])}
                          onChange={(e) =>
                            setCoches((prev) => ({ ...prev, [s.id]: e.target.checked }))
                          }
                          className="size-4 accent-[var(--color-brand-600)]"
                        />
                        <span className="flex-1">{s.label}</span>
                        <span className="tabular-nums text-muted">
                          {s.montant ? `+ ${formatEUR(s.montant)}` : ""}
                          {s.majorationPct ? ` + ${s.majorationPct} %` : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Résultat */}
              <div className="mt-6 rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-100">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-600">
                  <MapPin className="size-3.5" />
                  {c.resultatLabel ?? "Estimation de votre course"}
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-brand-700">
                  {formatEUR(Math.round(total))}
                </p>
                {showRange && (
                  <p className="mt-1 text-sm text-brand-600/80">
                    soit environ {formatEUR(Math.round(bas))} à {formatEUR(Math.round(haut))} · prix
                    indicatif
                  </p>
                )}
              </div>

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
