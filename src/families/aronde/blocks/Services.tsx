import Link from "next/link";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { ArondeSection } from "../ui/Section";
import { ArondeContainer } from "../ui/Container";
import { ArondeHeading } from "../ui/Heading";
import { ArondeImage } from "../ui/Image";
import { miterTR } from "../ui/miter";

/**
 * SERVICES aronde. Trois grammaires d'assemblage :
 *  - photos majoritaires → GRILLE de cadres à coupe d'onglet, filet caramel au
 *    dessus du titre.
 *  - items avec `href` → PANNEAUX À ONGLET (coin haut-droit taillé), gros numéro
 *    slab au fil de coupe, icône en mortaise carrée, prix + lien en pied.
 *  - sinon → ÉTABLI numéroté à filets, grands numéros slab caramel.
 * Aucune couleur en dur : tokens brand/accent (palette client).
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
    <ArondeSection id="services" tone={tone}>
      <ArondeContainer wide>
        <ArondeHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        {withImages ? (
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => {
              const body = (
                <>
                  {s.image?.url && (
                    <ArondeImage
                      src={s.image.url}
                      alt={s.image.alt ?? s.nom}
                      ratio="4/3"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  )}
                  <div className="mt-5">
                    <div className="mb-3 h-[3px] w-10 bg-accent-500" />
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-xl font-bold text-ink">{s.nom}</h3>
                      {s.priceHint && (
                        <span className="shrink-0 text-sm font-semibold text-brand-700">
                          {s.priceHint}
                        </span>
                      )}
                    </div>
                    {s.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                    )}
                    {s.href && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800">
                        {strings.services.details}
                        <span aria-hidden className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    )}
                  </div>
                </>
              );
              return s.href ? (
                <Link key={s.nom} href={withBase(basePath, s.href)} className="group block">
                  {body}
                </Link>
              ) : (
                <article key={s.nom} className="group">
                  {body}
                </article>
              );
            })}
          </div>
        ) : withLinks ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s, i) => (
              <article
                key={s.nom}
                style={miterTR(20)}
                className="flex h-full flex-col border border-brand-100 border-t-[3px] border-t-accent-500 bg-surface p-7 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-3xl font-bold tabular-nums text-accent-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.badge && (
                    <span className="shrink-0 rounded-[2px] bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-600">
                      {s.badge}
                    </span>
                  )}
                </div>
                {s.icone && (
                  <span className="mt-4 grid size-11 place-items-center rounded-[3px] bg-brand-800 text-white">
                    <Icon name={s.icone} className="size-5" />
                  </span>
                )}
                <h3 className="mt-4 font-display text-xl font-bold text-ink">{s.nom}</h3>
                {s.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                )}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-brand-100 pt-5">
                  {s.priceHint && (
                    <span className="text-sm font-semibold text-brand-700">{s.priceHint}</span>
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
          <div className="mt-14 border-t border-brand-100">
            {items.map((s, i) => (
              <article
                key={s.nom}
                className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-b border-brand-100 py-9 sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-x-10"
              >
                <div className="font-display text-3xl font-bold tabular-nums text-accent-600 sm:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">{s.nom}</h3>
                    {s.icone && (
                      <span className="text-brand-700">
                        <Icon name={s.icone} className="size-5" />
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="mt-2 max-w-xl leading-relaxed text-muted">{s.description}</p>
                  )}
                </div>
                {s.priceHint && (
                  <div className="col-start-2 text-sm font-semibold text-brand-700 sm:col-start-3 sm:text-right">
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
              className="h-auto min-h-14 w-full whitespace-normal py-3 text-center leading-snug sm:w-auto"
            >
              {c.cta.label}
            </Button>
          </div>
        )}
      </ArondeContainer>
    </ArondeSection>
  );
}
