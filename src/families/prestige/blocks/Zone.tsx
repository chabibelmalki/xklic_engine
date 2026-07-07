import type { ZoneContent, ZoneMode, ZoneRegion } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { allZoneVilles } from "@/lib/zone";
import { PrestigeSection } from "../ui/Section";
import { PrestigeContainer } from "../ui/Container";
import { PrestigeHeading } from "../ui/Heading";
import { PrestigeSecteurChecker } from "../ui/SecteurChecker";

const VISIBLE_PER_ZONE = 10;

/** Une zone rendue à plat, filet métallique : région + ville phare + communes. */
function ZoneRow({ zone }: { zone: ZoneRegion }) {
  const principale = zone.principale ?? zone.villes[0];
  const others = zone.villes.filter((v) => v !== principale);
  const shown = others.slice(0, VISIBLE_PER_ZONE);
  const hidden = others.slice(VISIBLE_PER_ZONE);
  return (
    <div className="border-b border-[var(--px-line)] py-7">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--px-gold)]">
        {zone.region}
      </p>
      <p className="mt-3 font-display text-2xl font-semibold text-white">{principale}</p>
      {others.length > 0 && (
        <p className="mt-3 leading-relaxed text-[var(--px-ink-soft)]">
          {shown.join(" · ")}
          {hidden.length > 0 && (
            <>
              {" · "}
              <span className="font-medium text-[var(--px-muted)]">+{hidden.length} communes</span>
              <span className="sr-only">{` : ${hidden.join(", ")}`}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * ZONE D'INTERVENTION prestige — soignée (point faible relevé ailleurs). Colonne
 * gauche : kicker or + grand titre + vérificateur de commune (sombre). Colonne
 * droite : les zones à PLAT sur filets métalliques (pas de cartes), + carte OSM
 * encadrée d'un filet doré et assombrie pour rester dans le registre nocturne.
 */
export function Zone({ block, config, basePath }: BlockComponentProps<ZoneContent>) {
  const c = block.content;
  const mode = (block.mode as ZoneMode) ?? "liste";
  if (mode === "aucune") return null;

  const zones = c.zones ?? [];
  const allVilles = allZoneVilles(c);
  const flatVilles = allVilles.length ? allVilles : [config.seo.ville];

  return (
    <PrestigeSection id="zone" surface="panel">
      <PrestigeContainer>
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <PrestigeHeading
              kicker="Zone d’intervention"
              title={c.titre ?? `Montpellier & tout l’Hérault`}
              lede={
                c.intro ??
                (c.rayonKm
                  ? `Nous nous déplaçons dans un rayon d’environ ${c.rayonKm} km. Vérifiez votre commune ou appelez-nous.`
                  : undefined)
              }
            />
            <PrestigeSecteurChecker villes={flatVilles} basePath={basePath} />
          </div>

          <div className="border-t border-[var(--px-line)]">
            {zones.length > 0 ? (
              zones.map((z) => <ZoneRow key={z.region} zone={z} />)
            ) : (
              <p className="py-7 leading-relaxed text-[var(--px-ink-soft)]">
                {flatVilles.join(" · ")}
              </p>
            )}
            {mode === "carte" && c.mapEmbedUrl && (
              <div className="mt-8 overflow-hidden border border-[var(--px-hairline)]">
                {/* Carte assombrie (invert + hue) pour rester dans le registre nocturne. */}
                <iframe
                  src={c.mapEmbedUrl}
                  title={`Zone d’intervention — ${config.entreprise.nom}`}
                  loading="lazy"
                  className="block w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.7)_brightness(0.95)]"
                  style={{ minHeight: 340, aspectRatio: "16 / 10" }}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      </PrestigeContainer>
    </PrestigeSection>
  );
}
