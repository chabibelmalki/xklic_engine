import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialSection } from "../../editorial/ui/Section";
import { EditorialContainer } from "../../editorial/ui/Container";
import { FoyerHeading } from "../ui/Heading";

/**
 * SERVICES foyer — grille de CARTES-RECETTE : coins arrondis, liseré chaud,
 * en-tête cartonné (pastille d'icône ronde + badge « étiquette »), liseré
 * COUTURE pointillé sous le titre, prix en étiquette de pied, lien « voir la
 * fiche » ancré en bas. Photo optionnelle cadrée en tête. Registre tactile et
 * domestique, distinct des cartes à filet d'`editorial` et du bento `signal`.
 */
export function Services({ block, tone, basePath = "", strings }: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  const items = c.items ?? [];

  return (
    <EditorialSection id="services" tone={tone}>
      <EditorialContainer>
        <FoyerHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <article
              key={s.nom}
              className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-brand-100 bg-surface shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-1"
            >
              {s.image?.url && (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
                  <Image
                    src={s.image.url}
                    alt={s.image.alt ?? s.nom}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  {s.icone && (
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                      <Icon name={s.icone} className="size-6" />
                    </span>
                  )}
                  {s.badge && (
                    <span className="shrink-0 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600">
                      {s.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{s.nom}</h3>
                <span className="mt-3 block h-px w-full border-t border-dashed border-brand-200" aria-hidden />
                {s.description && (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                )}
                <div className="mt-5 flex items-center justify-between gap-3">
                  {s.priceHint && (
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-800">
                      {s.priceHint}
                    </span>
                  )}
                  {s.href && (
                    <a
                      href={withBase(basePath, s.href)}
                      className="ms-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
                    >
                      {strings.services.details}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {c.cta && (
          <div className="mt-12 text-center">
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
