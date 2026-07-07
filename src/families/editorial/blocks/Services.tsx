import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";
import { EditorialImage } from "../ui/Image";

/**
 * SERVICES éditorial. Deux grammaires, JAMAIS de cartes à ombre douce :
 * - si la plupart des items ont une photo → GRILLE PHOTO plein-bord (images
 *   nettes, titre + texte dessous, filet fin), style magazine.
 * - sinon → LISTE numérotée à filets (grands numéros, grande typo, beaucoup d'air).
 */
export function Services({
  block,
  tone,
  basePath = "",
}: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  const items = c.items ?? [];
  const withImages = items.filter((s) => s.image?.url).length >= Math.ceil(items.length / 2);

  return (
    <EditorialSection id="services" tone={tone}>
      <EditorialContainer>
        <EditorialHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        {withImages ? (
          <div className="mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-2">
            {items.map((s) => (
              <article key={s.nom} className="group">
                {s.image?.url && (
                  <EditorialImage
                    src={s.image.url}
                    alt={s.image.alt ?? s.nom}
                    ratio="4/3"
                    sizes="(max-width: 640px) 100vw, 45vw"
                  />
                )}
                <div className="mt-5 border-t border-border pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-semibold text-ink">{s.nom}</h3>
                    {s.priceHint && (
                      <span className="shrink-0 text-sm font-medium text-muted">{s.priceHint}</span>
                    )}
                  </div>
                  {s.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-14 border-t border-border">
            {items.map((s, i) => (
              <article
                key={s.nom}
                className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-b border-border py-9 sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-x-10"
              >
                <div className="font-display text-2xl font-semibold tabular-nums text-brand-600 sm:text-3xl">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">{s.nom}</h3>
                  {s.description && (
                    <p className="mt-2 max-w-xl leading-relaxed text-muted">{s.description}</p>
                  )}
                </div>
                {s.priceHint && (
                  <div className="col-start-2 text-sm font-medium text-muted sm:col-start-3 sm:text-right">
                    {s.priceHint}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {c.cta && (
          <div className="mt-12">
            <Button href={withBase(basePath, c.cta.href)} variant="outline" size="lg">
              {c.cta.label}
            </Button>
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
