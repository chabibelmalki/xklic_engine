import { MapPin } from "lucide-react";
import type { ZoneContent, ZoneMode, ZoneRegion } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SecteurChecker } from "@/components/SecteurChecker";
import { allZoneVilles } from "@/lib/zone";

/** Nombre de communes affichées par carte avant le « +N communes ». */
const VISIBLE_PER_ZONE = 6;

/** Une carte de zone : région, ville principale en avant, communes condensées. */
function ZoneCard({ zone }: { zone: ZoneRegion }) {
  const principale = zone.principale ?? zone.villes[0];
  const others = zone.villes.filter((v) => v !== principale);
  const shown = others.slice(0, VISIBLE_PER_ZONE);
  const hidden = others.slice(VISIBLE_PER_ZONE);

  return (
    <div className="rounded-theme border border-border bg-surface p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{zone.region}</p>
      <p className="mt-1.5 inline-flex items-center gap-1.5 text-lg font-bold text-ink">
        <MapPin className="size-4 text-brand-500" />
        {principale}
      </p>
      {others.length > 0 && (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {shown.join(" · ")}
          {hidden.length > 0 && (
            <>
              {" · "}
              <span className="font-medium text-muted">+{hidden.length} communes</span>
              {/* communes restantes gardées dans le HTML pour le SEO local */}
              <span className="sr-only">{` : ${hidden.join(", ")}`}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * Zone d'intervention. mode : "carte" (zones + iframe) · "liste" (zones en
 * cartes, sinon communes en pastilles) · "aucune" (le bloc ne s'affiche pas).
 */
export function Zone({ block, config, index, basePath }: BlockComponentProps<ZoneContent>) {
  const c = block.content;
  const mode = (block.mode as ZoneMode) ?? "liste";
  if (mode === "aucune") return null;

  const zones = c.zones ?? [];
  const allVilles = allZoneVilles(c);
  const flatVilles = allVilles.length ? allVilles : [config.seo.ville];

  // Pastilles à plat — fallback quand aucune zone groupée n'est définie.
  const chips = (
    <ul className="flex flex-wrap gap-2.5">
      {flatVilles.map((v) => (
        <li
          key={v}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-soft shadow-sm"
        >
          <MapPin className="size-3.5 text-brand-500" />
          {v}
        </li>
      ))}
    </ul>
  );

  return (
    <Section id="zone" tone={toneForIndex(index)}>
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Zone d'intervention"
              title={c.titre ?? `À ${config.seo.ville} et alentours`}
              intro={
                c.intro ??
                (c.rayonKm
                  ? `Nous nous déplaçons dans un rayon d'environ ${c.rayonKm} km. Vérifiez votre secteur ou contactez-nous.`
                  : undefined)
              }
            />
            <SecteurChecker villes={flatVilles} basePath={basePath} />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-4">
            {zones.length > 0 ? (
              zones.map((z) => <ZoneCard key={z.region} zone={z} />)
            ) : (
              chips
            )}
            {mode === "carte" && c.mapEmbedUrl && (
              <div className="overflow-hidden rounded-theme border border-border shadow-sm">
                <iframe
                  src={c.mapEmbedUrl}
                  title={`Zone d'intervention — ${config.entreprise.nom}`}
                  loading="lazy"
                  className="block w-full border-0"
                  style={{ minHeight: 360, aspectRatio: "16 / 10" }}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
