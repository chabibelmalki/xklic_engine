import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { Medaillon, Ombelle, Resille, VerriereHeading } from "../ui/Verriere";

/**
 * SERVICES verrière — une ARCADE. Chaque prestation est un panneau de vitrail à
 * sommet cintré : la photo (ou le médaillon d'icône) est prise dans l'arc, le
 * texte se lit sur le verre en dessous, une ombelle veille en filigrane dans
 * l'angle. Les panneaux alignés forment la galerie vitrée d'un jardin d'hiver —
 * à l'opposé des cartes rectangulaires du reste du parc.
 *
 * Au survol le panneau s'élève d'un cheveu (transform seul, 60 fps) — inerte
 * sous `prefers-reduced-motion`.
 */
export function Services({
  block,
  basePath = "",
  tone,
  strings,
}: BlockComponentProps<ServicesContent>) {
  const c = block.content;

  return (
    <EditorialSection id="services" tone={tone}>
      <EditorialContainer>
        <VerriereHeading
          kicker={c.eyebrow}
          title={c.titre ?? strings.services.defaultTitle}
          lede={c.intro}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s) => {
            const img = s.image;
            const inner = (
              <>
                <Ombelle className="pointer-events-none absolute -right-6 top-24 size-32 text-brand-500/[0.06]" />

                {/* Le sommet de l'arc : la photo, sinon le médaillon d'icône. */}
                {img?.url ? (
                  <div className="relative">
                    <Image
                      src={img.url}
                      alt={img.alt ?? ""}
                      width={560}
                      height={420}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <Resille className="text-brand-700 opacity-35" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-800/25 to-transparent"
                    />
                  </div>
                ) : (
                  <div className="relative flex justify-center pt-12">
                    <Medaillon size="lg">
                      {s.emoji ? (
                        <span className="text-2xl">{s.emoji}</span>
                      ) : (
                        <Icon name={s.icone} className="size-8" />
                      )}
                    </Medaillon>
                  </div>
                )}

                <div
                  className={cn(
                    "relative flex flex-1 flex-col px-7 pb-7",
                    img?.url ? "pt-6" : "pt-6 text-center",
                  )}
                >
                  {s.badge && (
                    <span
                      className={cn(
                        "mb-3 inline-block rounded-full bg-accent-500 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-accent-contrast",
                        img?.url ? "self-start" : "self-center",
                      )}
                    >
                      {s.badge}
                    </span>
                  )}
                  <h3 className="font-display text-xl leading-tight text-ink">{s.nom}</h3>
                  {s.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
                  )}
                  <div
                    className={cn(
                      "mt-auto flex items-center gap-3 pt-7",
                      img?.url ? "justify-between" : "justify-center",
                    )}
                  >
                    {s.priceHint && (
                      <span className="font-display text-lg text-brand-700">{s.priceHint}</span>
                    )}
                    {s.href && (
                      <ArrowRight className="size-5 shrink-0 text-accent-600 transition-transform duration-200 group-hover:translate-x-1.5" />
                    )}
                  </div>
                </div>
              </>
            );

            const cellCls =
              "verriere-arc verriere-plomb verriere-verre group relative isolate flex h-full flex-col overflow-hidden shadow-[var(--shadow-card)] transition-transform duration-300 motion-safe:hover:-translate-y-1.5";

            return s.href ? (
              <Link key={s.nom} href={withBase(basePath, s.href)} className={cellCls}>
                {inner}
              </Link>
            ) : (
              <div key={s.nom} className={cellCls}>
                {inner}
              </div>
            );
          })}
        </div>

        {c.cta && (
          <div className="mt-14 flex justify-center">
            <Button
              href={withBase(basePath, c.cta.href)}
              variant="outline"
              size="lg"
              className="h-auto max-w-full whitespace-normal py-4 text-center"
            >
              {c.cta.label}
            </Button>
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
