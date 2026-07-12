import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";
import { EditorialImage } from "../ui/Image";

/**
 * SERVICES éditorial. Trois grammaires, JAMAIS de cartes à ombre douce :
 * - si la plupart des items ont une photo → GRILLE PHOTO plein-bord (images
 *   nettes, titre + texte dessous, filet fin), style magazine.
 * - si des items portent un `href` (fiches détaillées) → GRILLE DE CARTES à
 *   filet (bordure fine, sans ombre) : numéro, icône/badge, texte, prix et
 *   CTA « voir détail » ancrés en pied de carte pour éviter le vide.
 * - sinon → LISTE numérotée à filets (grands numéros, grande typo, beaucoup d'air).
 */
export function Services({
  block,
  tone,
  basePath = "",
  strings,
}: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  const items = c.items ?? [];
  const withImages = items.filter((s) => s.image?.url).length >= Math.ceil(items.length / 2);
  const withLinks = !withImages && items.some((s) => s.href);

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
        ) : withLinks ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s, i) => (
              <article key={s.nom} className="flex h-full flex-col border border-border p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-3xl font-semibold tabular-nums text-brand-200">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.badge && (
                    <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-600">
                      {s.badge}
                    </span>
                  )}
                </div>
                {s.icone && (
                  <span className="mt-4 grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={s.icone} className="size-5" />
                  </span>
                )}
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{s.nom}</h3>
                {s.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                )}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                  {s.priceHint && (
                    <span className="text-sm font-medium text-muted">{s.priceHint}</span>
                  )}
                  {s.href && (
                    <Button
                      href={withBase(basePath, s.href)}
                      variant="outline"
                      size="sm"
                      className="ms-auto"
                    >
                      {strings.services.details}
                    </Button>
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
            <Button
              href={withBase(basePath, c.cta.href)}
              variant="outline"
              size="lg"
              className="max-w-full whitespace-normal text-center"
            >
              {c.cta.label}
            </Button>
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
