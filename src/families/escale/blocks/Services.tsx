import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { withBase, cn } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { EditorialSection } from "../../editorial/ui/Section";
import { EscaleHeading } from "../ui/Escale";

/**
 * SERVICES escale — un chevalet d'ORDRES DE MISSION. Chaque prestation est une
 * carte façon carte d'embarquement : un talon à gauche (code mono + icône) séparé
 * par une COUTURE PERFORÉE (`.escale-perf`) du corps qui porte le nom en display.
 * Le talon est en marque profonde, le corps clair — deux zones comme sur un
 * billet. Au survol, la flèche « embarque » (transform only, 60 fps).
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
        <EscaleHeading
          kicker={c.eyebrow}
          title={c.titre ?? strings.services.defaultTitle}
          lede={c.intro}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {c.items.map((s, i) => {
            const inner = (
              <>
                {/* TALON — code mission + icône, en marque profonde. */}
                <div className="relative flex shrink-0 flex-col items-center justify-between gap-3 bg-brand-800 px-4 py-6 text-white">
                  <span className="escale-mono text-[0.6rem] font-medium text-white/55">REF</span>
                  <span className="escale-mono font-display text-3xl leading-none text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="grid size-9 place-items-center rounded-[var(--radius-btn)] bg-white/10 text-accent-500">
                    {s.emoji ? <span className="text-lg">{s.emoji}</span> : <Icon name={s.icone} className="size-5" />}
                  </span>
                </div>

                {/* COUTURE PERFORÉE (verticale) entre talon et corps. */}
                <span aria-hidden className="escale-perf relative w-px shrink-0 self-stretch" />

                {/* CORPS — nom + description + pied. */}
                <div className="relative flex min-w-0 flex-1 flex-col p-6">
                  {s.badge && (
                    <span className="escale-mono mb-3 inline-flex w-fit items-center bg-accent-500/12 px-2 py-1 text-[0.6rem] font-bold text-accent-600">
                      {s.badge}
                    </span>
                  )}
                  <h3 className="font-display text-2xl leading-tight text-ink">{s.nom}</h3>
                  {s.description && (
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    {s.priceHint ? (
                      <span className="escale-mono text-sm font-bold text-brand-700">{s.priceHint}</span>
                    ) : (
                      <span className="escale-mono text-[0.66rem] font-medium text-muted-2">
                        {String(i + 1).padStart(2, "0")} / {String(c.items.length).padStart(2, "0")}
                      </span>
                    )}
                    {s.href && (
                      <ArrowRight className="size-5 shrink-0 text-brand-700 transition-transform duration-200 group-hover:translate-x-1.5" />
                    )}
                  </div>
                </div>
              </>
            );

            const cellCls = cn(
              "group relative isolate flex overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)] transition-transform duration-200 motion-safe:hover:-translate-y-1",
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
