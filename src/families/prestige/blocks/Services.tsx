import type { ServicesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { withBase } from "@/lib/utils";
import { PrestigeSection } from "../ui/Section";
import { PrestigeContainer } from "../ui/Container";
import { PrestigeHeading } from "../ui/Heading";

/**
 * SERVICES prestige — LISTE immersive pleine largeur, JAMAIS de cartes à ombre.
 * Chaque prestation = une ligne à filet métallique fin, gros numéro doré, grand
 * titre display et texte posé. Registre sombre, beaucoup de contraste et d'air —
 * la grammaire opposée aux grilles de cartes (classic) et à la grille photo
 * magazine (editorial).
 */
export function Services({ block, basePath = "" }: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  const items = c.items ?? [];

  return (
    <PrestigeSection id="services" surface="void">
      <PrestigeContainer>
        <PrestigeHeading kicker={c.eyebrow} title={c.titre ?? ""} lede={c.intro} />

        <div className="mt-16 border-t border-[var(--px-line)]">
          {items.map((s, i) => {
            const Row = (
              <>
                <div className="font-display text-3xl font-semibold tabular-nums leading-none text-[var(--px-gold)] sm:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                    {s.nom}
                  </h3>
                  {s.description && (
                    <p className="mt-3 max-w-2xl leading-relaxed text-[var(--px-ink-soft)]">
                      {s.description}
                    </p>
                  )}
                </div>
                {s.priceHint && (
                  <div className="col-start-2 text-sm font-medium uppercase tracking-[0.12em] text-[var(--px-muted)] sm:col-start-3 sm:pt-1 sm:text-right">
                    {s.priceHint}
                  </div>
                )}
              </>
            );

            const rowClass =
              "group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3 border-b border-[var(--px-line)] py-10 transition-colors sm:grid-cols-[auto_1fr_auto] sm:gap-x-12";

            return s.href ? (
              <a
                key={s.nom}
                href={withBase(basePath, s.href)}
                className={`${rowClass} hover:bg-white/[0.03]`}
              >
                {Row}
              </a>
            ) : (
              <div key={s.nom} className={rowClass}>
                {Row}
              </div>
            );
          })}
        </div>

        {c.cta && (
          <div className="mt-12">
            <a
              href={withBase(basePath, c.cta.href)}
              className="inline-flex h-14 items-center justify-center border border-[var(--px-gold)] px-9 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--px-gold)] transition-colors hover:bg-[var(--px-gold)] hover:text-[var(--px-void)]"
            >
              {c.cta.label}
            </a>
          </div>
        )}
      </PrestigeContainer>
    </PrestigeSection>
  );
}
