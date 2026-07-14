import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * CTA foyer — une CARTE-INVITATION chaleureuse (pas une bande pleine largeur) :
 * panneau de marque arrondi, posé sur le fond clair, ceint d'un liseré COUTURE
 * pointillé intérieur, avec un mot manuscrit d'accroche, grand titre serif clair
 * et CTA. Registre « carton d'invitation », distinct de la bande plate
 * d'`editorial`. Couleurs 100 % tokens.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  return (
    <section className="bg-bg py-16 sm:py-20">
      <EditorialContainer>
        <div className="relative overflow-hidden rounded-[calc(var(--radius-card)+0.5rem)] bg-brand-gradient px-7 py-14 text-brand-contrast shadow-[var(--shadow-pop)] sm:px-14 sm:py-16">
          {/* Liseré couture intérieur (signature). */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-4 rounded-[var(--radius-card)] border border-dashed border-white/35"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="foyer-script mb-2 text-3xl leading-none text-accent-50 sm:text-4xl">
              à très vite chez vous
            </p>
            <h2 className="pack-heading font-display text-3xl font-semibold leading-[1.08] sm:text-[2.75rem]">
              {c.titre}
            </h2>
            {c.sousTitre && (
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/90">
                {c.sousTitre}
              </p>
            )}
            {(c.ctaPrimaire || c.ctaSecondaire) && (
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                {c.ctaPrimaire && (
                  <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="white" size="lg">
                    {c.ctaPrimaire.label}
                  </Button>
                )}
                {c.ctaSecondaire && (
                  <Button
                    href={withBase(basePath, c.ctaSecondaire.href)}
                    variant="outline"
                    size="lg"
                    className="border-white/50 bg-transparent text-brand-contrast hover:bg-white/10"
                  >
                    {c.ctaSecondaire.label}
                  </Button>
                )}
              </div>
            )}
            {c.lien && (
              <div className="mt-6">
                <a
                  href={withBase(basePath, c.lien.href)}
                  className="text-sm font-medium underline underline-offset-4 opacity-90 hover:opacity-100"
                >
                  {c.lien.label}
                </a>
              </div>
            )}
          </div>
        </div>
      </EditorialContainer>
    </section>
  );
}
