import type { ZoneContent, ZoneMode, ZoneRegion } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { SecteurChecker } from "@/components/SecteurChecker";
import { allZoneVilles } from "@/lib/zone";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";

const VISIBLE_PER_ZONE = 8;

/** Une zone rendue à plat (pas de carte) : région + ville phare + communes. */
function ZoneRow({ zone }: { zone: ZoneRegion }) {
  const principale = zone.principale ?? zone.villes[0];
  const others = zone.villes.filter((v) => v !== principale);
  const shown = others.slice(0, VISIBLE_PER_ZONE);
  const hidden = others.slice(VISIBLE_PER_ZONE);
  return (
    <div className="border-b border-border py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{zone.region}</p>
      <p className="mt-2 font-display text-xl font-semibold text-ink">{principale}</p>
      {others.length > 0 && (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {shown.join(" · ")}
          {hidden.length > 0 && (
            <>
              {" · "}
              <span className="font-medium text-muted">+{hidden.length} communes</span>
              <span className="sr-only">{` : ${hidden.join(", ")}`}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * Zone d'intervention — éditorial : colonne texte (kicker + grand titre +
 * vérificateur de secteur) et colonne de zones à PLAT (filets, pas de cartes).
 */
export function Zone({ block, config, tone, basePath }: BlockComponentProps<ZoneContent>) {
  const c = block.content;
  const mode = (block.mode as ZoneMode) ?? "liste";
  if (mode === "aucune") return null;

  const zones = c.zones ?? [];
  const allVilles = allZoneVilles(c);
  const flatVilles = allVilles.length ? allVilles : [config.seo.ville];

  return (
    <EditorialSection id="zone" tone={tone}>
      <EditorialContainer>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <EditorialHeading
              kicker="Zone d'intervention"
              title={c.titre ?? `À ${config.seo.ville} et alentours`}
              lede={
                c.intro ??
                (c.rayonKm
                  ? `Nous nous déplaçons dans un rayon d'environ ${c.rayonKm} km. Vérifiez votre secteur ou contactez-nous.`
                  : undefined)
              }
            />
            <div className="mt-8">
              <SecteurChecker villes={flatVilles} basePath={basePath} />
            </div>
          </div>

          <div className="border-t border-border">
            {zones.length > 0 ? (
              zones.map((z) => <ZoneRow key={z.region} zone={z} />)
            ) : (
              <p className="py-6 text-ink-soft leading-relaxed">{flatVilles.join(" · ")}</p>
            )}
            {mode === "carte" && c.mapEmbedUrl && (
              <div className="mt-6 overflow-hidden border border-border">
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
        </div>
      </EditorialContainer>
    </EditorialSection>
  );
}
