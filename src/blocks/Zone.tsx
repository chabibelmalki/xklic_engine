import { MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import type { ZoneContent, ZoneMode } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { localeDir } from "@/lib/i18n";

/**
 * Zone d'intervention. mode : "carte" (communes + iframe) · "liste" (communes en
 * pastilles) · "aucune" (le bloc ne s'affiche pas).
 */
export function Zone({ block, config, index, locale }: BlockComponentProps<ZoneContent>) {
  const c = block.content;
  const mode = (block.mode as ZoneMode) ?? "liste";
  if (mode === "aucune") return null;

  const Fwd = localeDir(locale) === "rtl" ? ArrowLeft : ArrowRight;

  const villes = c.villes ?? [config.seo.ville];

  const chips = (
    <ul className="flex flex-wrap gap-2.5">
      {villes.map((v) => (
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
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
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
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-1.5 font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              Vérifier mon secteur <Fwd className="size-4" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-6">
            {chips}
            {mode === "carte" && c.mapEmbedUrl && (
              <div className="overflow-hidden rounded-theme border border-border shadow-sm">
                <iframe
                  src={c.mapEmbedUrl}
                  title={`Zone d'intervention — ${config.entreprise.nom}`}
                  loading="lazy"
                  className="aspect-[16/10] w-full"
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
