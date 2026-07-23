import type { ZoneContent, ZoneMode, ZoneRegion } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { SecteurChecker } from "@/components/SecteurChecker";
import { allZoneVilles } from "@/lib/zone";
import { CascadeSection } from "../ui/Section";
import { CascadeContainer } from "../ui/Container";
import { CascadeHeading } from "../ui/Heading";

/**
 * Une zone = un panneau arrondi : département en étiquette, ville phare mise en
 * avant, puis TOUTES les communes en pastilles. Contrairement au bloc emprunté à
 * `editorial` (qui n'en montre que 8 et résume le reste en « +N communes »), la
 * liste est ici INTÉGRALE : sur une page « zone d'intervention », chaque commune
 * desservie doit être lisible — c'est aussi ce qui porte le référencement local.
 */
function ZonePanel({ zone }: { zone: ZoneRegion }) {
  const principale = zone.principale ?? zone.villes[0];
  const others = zone.villes.filter((v) => v !== principale);
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          style={{ background: "linear-gradient(90deg, var(--brand-600), var(--accent-600))" }}
        >
          {zone.region}
        </span>
        <span className="text-xs font-medium text-muted">{zone.villes.length} communes</span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-ink">{principale}</p>
      {others.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((v) => (
            <li
              key={v}
              className="rounded-full border border-border bg-[color-mix(in_srgb,var(--brand-500)_5%,var(--bg))] px-3 py-1 text-sm text-ink-soft"
            >
              {v}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * ZONE cascade — colonne texte (kicker + titre + vérificateur de secteur) et
 * panneaux de communes arrondis, un par département. 100 % tokens.
 */
export function Zone({ block, config, tone, basePath }: BlockComponentProps<ZoneContent>) {
  const c = block.content;
  const mode = (block.mode as ZoneMode) ?? "liste";
  if (mode === "aucune") return null;

  const zones = c.zones ?? [];
  const allVilles = allZoneVilles(c);
  const flatVilles = allVilles.length ? allVilles : [config.seo.ville];

  return (
    <CascadeSection id="zone" tone={tone}>
      <CascadeContainer>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.35fr]">
          <div className="lg:sticky lg:top-28">
            <CascadeHeading
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

          <div className="space-y-5">
            {zones.length > 0 ? (
              zones.map((z) => <ZonePanel key={z.region} zone={z} />)
            ) : (
              <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
                <ul className="flex flex-wrap gap-2">
                  {flatVilles.map((v) => (
                    <li
                      key={v}
                      className="rounded-full border border-border bg-[color-mix(in_srgb,var(--brand-500)_5%,var(--bg))] px-3 py-1 text-sm text-ink-soft"
                    >
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mode === "carte" && c.mapEmbedUrl && (
              <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
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
      </CascadeContainer>
    </CascadeSection>
  );
}
