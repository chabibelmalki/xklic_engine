import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * CTA signal — BANDE de marque PLEINE LARGEUR (jamais un panneau arrondi ni une
 * image) : filet d'accent en tête, grille de hairlines en fond, équerres claires
 * aux angles, titre display et actions rangées à droite en desktop. Moment de
 * couleur affirmé et net, à l'opposé de l'encadré arrondi d'épure et de la bande
 * photo de prestige. 100 % tokens, contrastes AA.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  return (
    <section className="relative isolate overflow-hidden bg-brand-gradient text-brand-contrast">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-400 to-accent-600" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.08) 1px, transparent 1px)",
          backgroundSize: "3.5rem 100%",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 -z-10 size-72 rounded-full bg-white/10 blur-3xl"
      />
      <EditorialContainer className="relative grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.5fr_auto] lg:items-center">
        <div className="border-s-2 border-white/30 ps-6">
          <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-brand-contrast/85">
              {c.sousTitre}
            </p>
          )}
        </div>
        {(c.ctaPrimaire || c.ctaSecondaire || c.lien) && (
          <div className="flex flex-col gap-3 lg:min-w-64">
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
                className="border-white/40 bg-transparent text-brand-contrast hover:bg-white/10"
              >
                {c.ctaSecondaire.label}
              </Button>
            )}
            {c.lien && (
              <a
                href={withBase(basePath, c.lien.href)}
                className="text-center text-sm font-semibold text-brand-contrast/90 underline-offset-4 hover:underline"
              >
                {c.lien.label}
              </a>
            )}
          </div>
        )}
      </EditorialContainer>
    </section>
  );
}
