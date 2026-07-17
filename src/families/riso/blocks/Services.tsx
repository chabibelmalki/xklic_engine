import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { Halftone, RisoHeading, inkLetter } from "../ui/Riso";

/**
 * SERVICES riso — une PLANCHE D'IMPRESSION : les prestations ne sont pas des
 * cartes posées sur un fond, ce sont des cases d'encre et de papier qui se
 * touchent, en DAMIER. Une case sur deux est imprimée (aplat de marque + trame),
 * l'autre est laissée en réserve (papier).
 *
 * L'alternance pair/impair produit un vrai damier en grille 3 colonnes (aucune
 * case de même couleur adjacente), des colonnes franches en 2 colonnes, et une
 * alternance nette en mobile — les trois lectures tiennent.
 *
 * Chaque case porte sa LETTRE de planche (A, B, C…) en filigrane : l'indexation
 * d'un imprimeur, pas les « 01 / 02 » déjà partout dans le parc. Zéro carte,
 * zéro ombre, zéro arrondi.
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
        <RisoHeading
          kicker={c.eyebrow}
          title={c.titre ?? strings.services.defaultTitle}
          lede={c.intro}
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s, i) => {
            const inked = i % 2 === 0;
            const inner = (
              <>
                {inked && <Halftone className="text-white/20" />}
                {/* Lettre de planche, en réserve dans l'angle. */}
                <span
                  aria-hidden
                  className={cn(
                    "riso-mono pointer-events-none absolute right-4 top-2 font-bold leading-none transition-opacity duration-200 group-hover:opacity-100",
                    "text-[3.5rem]",
                    inked ? "text-white/25" : "text-accent-500/40",
                  )}
                >
                  {inkLetter(i)}
                </span>

                <span
                  className={cn(
                    "relative grid size-12 shrink-0 place-items-center",
                    inked ? "bg-white/15 text-white" : "bg-accent-500 text-accent-contrast",
                  )}
                >
                  {s.emoji ? (
                    <span className="text-xl">{s.emoji}</span>
                  ) : (
                    <Icon name={s.icone} className="size-6" />
                  )}
                </span>

                <h3
                  className={cn(
                    "relative mt-6 font-display text-xl uppercase leading-[1.05]",
                    inked ? "text-white" : "text-ink",
                  )}
                >
                  {s.nom}
                </h3>
                {s.badge && (
                  <span
                    className={cn(
                      "riso-mono relative mt-3 inline-block self-start px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em]",
                      inked ? "bg-white text-brand-700" : "bg-ink text-bg",
                    )}
                  >
                    {s.badge}
                  </span>
                )}
                {s.description && (
                  <p
                    className={cn(
                      "relative mt-3 text-sm leading-relaxed",
                      inked ? "text-white/85" : "text-muted",
                    )}
                  >
                    {s.description}
                  </p>
                )}

                <div className="relative mt-auto flex items-center justify-between gap-3 pt-8">
                  {s.priceHint ? (
                    <span
                      className={cn(
                        "riso-mono text-sm font-bold",
                        inked ? "text-white" : "text-brand-700",
                      )}
                    >
                      {s.priceHint}
                    </span>
                  ) : (
                    <span />
                  )}
                  {s.href && (
                    <ArrowRight
                      className={cn(
                        "size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1.5",
                        inked ? "text-white" : "text-brand-600",
                      )}
                    />
                  )}
                </div>
              </>
            );

            const cellCls = cn(
              "group relative isolate flex h-full flex-col overflow-hidden p-7 sm:p-8",
              inked ? "bg-brand-600" : "bg-bg",
              s.href && (inked ? "hover:bg-brand-700" : "hover:bg-alt"),
              "transition-colors duration-200",
            );

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
          <div className="mt-12">
            <Button
              href={withBase(basePath, c.cta.href)}
              variant="outline"
              size="lg"
              className="h-auto max-w-full whitespace-normal border-2 py-4 text-center"
            >
              {c.cta.label}
            </Button>
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
