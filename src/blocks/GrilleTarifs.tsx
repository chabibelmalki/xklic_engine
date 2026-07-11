import { MapPin } from "lucide-react";
import type { GrilleTarifsContent, GrilleTarifsLigne } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { formatEUR, withBase } from "@/lib/utils";

function priceLabel(prix?: number | string): string {
  if (prix === undefined || prix === "") return "—";
  return typeof prix === "number" ? formatEUR(prix) : prix;
}

/**
 * GRILLE TARIFAIRE — tableau de prix indicatifs par destination (jour / nuit),
 * avec distance et temps de parcours estimés, au départ d'un point donné.
 * Pensé pour les taxis à forfaits fixes. Défilement horizontal sur mobile
 * (le tableau garde une largeur minimale lisible). Fonds/encres via tokens :
 * s'adapte au thème (clair comme sombre via `branding.colors.neutral`).
 */
export function GrilleTarifs({
  block,
  tone,
  basePath = "",
}: BlockComponentProps<GrilleTarifsContent>) {
  const c = block.content;
  const col = c.colonnes ?? {};
  const lignes = c.lignes ?? [];

  return (
    <Section id="tarifs" tone={tone}>
      <Reveal>
        <SectionHeading eyebrow={c.eyebrow ?? "Tarifs"} title={c.titre ?? "Grille tarifaire"} intro={c.intro} />
      </Reveal>

      {c.origine && (
        <Reveal>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-muted">
            <MapPin className="size-4 text-brand-600" />
            {c.origine}
          </p>
        </Reveal>
      )}

      <Reveal>
        <div className="mt-10 overflow-x-auto rounded-theme border border-border shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-surface-2 text-ink">
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  {col.destination ?? "Destination"}
                </th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                  {col.jour ?? "Tarif de jour"}
                </th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                  {col.nuit ?? "Tarif de nuit"}
                </th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                  {col.distance ?? "Distance"}
                </th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                  {col.duree ?? "Durée estimée"}
                </th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l: GrilleTarifsLigne, i) => (
                <tr key={l.destination + i} className={i % 2 === 1 ? "bg-alt" : "bg-surface"}>
                  <th scope="row" className="px-4 py-3 font-medium text-ink">
                    {l.destination}
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-ink">
                    {priceLabel(l.jour)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-brand-700">
                    {priceLabel(l.nuit)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">
                    {l.distance ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">
                    {l.duree ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {c.note && <p className="mt-5 text-sm text-muted-2">{c.note}</p>}

      {c.cta && (
        <Reveal>
          <div className="mt-8 text-center">
            <Button href={withBase(basePath, c.cta.href)} size="lg">
              {c.cta.label}
            </Button>
          </div>
        </Reveal>
      )}
    </Section>
  );
}
