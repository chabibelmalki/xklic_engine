import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { CascadeSection } from "../ui/Section";
import { CascadeContainer } from "../ui/Container";
import { CascadeHeading } from "../ui/Heading";

/**
 * SERVICES cascade — cartes « CAPSULE » : coins très arrondis, liseré dégradé
 * bleu→vert en tête de carte, grande icône dans une pastille teintée, ombre douce
 * lumineuse, léger soulèvement au survol. Photo optionnelle en tête. Prix indicatif
 * et lien « détail » ancrés en pied. Grammaire tactile et fraîche, distincte des
 * cartes-filet éditoriales et des capsules-sticker d'epure. 100 % tokens.
 */
export function Services({ block, tone, basePath = "", strings }: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  const items = c.items ?? [];

  return (
    <CascadeSection id="services" tone={tone}>
      <CascadeContainer>
        <CascadeHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => {
            const inner = (
              <>
                {/* Liseré dégradé (signature capsule). */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: "linear-gradient(90deg, var(--brand-500), var(--accent-500))" }}
                />
                {s.image?.url && (
                  <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden">
                    <Image
                      src={s.image.url}
                      alt={s.image.alt ?? s.nom}
                      fill
                      sizes="(max-width:640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--brand-600)_60%,transparent)]"
                    style={{ background: "linear-gradient(140deg, var(--brand-500), var(--accent-600))" }}
                  >
                    <Icon name={s.icone} className="size-7" />
                  </span>
                  {s.badge && (
                    <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600">
                      {s.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink">{s.nom}</h3>
                {s.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                )}
                {(s.priceHint || s.href) && (
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                    {s.priceHint && <span className="text-sm font-semibold text-brand-700">{s.priceHint}</span>}
                    {s.href && (
                      <span className="ms-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-transform group-hover:translate-x-0.5">
                        {strings.services.details}
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </div>
                )}
              </>
            );
            const cardCls =
              "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-6 pt-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-pop)]";
            return s.href ? (
              <a key={s.nom} href={withBase(basePath, s.href)} className={cardCls}>
                {inner}
              </a>
            ) : (
              <article key={s.nom} className={cardCls}>
                {inner}
              </article>
            );
          })}
        </div>

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
      </CascadeContainer>
    </CascadeSection>
  );
}
