import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * CTA épure — PANNEAU de marque ENCADRÉ (rayon, dégradé vert, lavis lumineux),
 * jamais une bande pleine largeur ni une image. Accent OR en tête, titre display
 * clair, boutons contrastés, lien optionnel. Moment de couleur fort et net,
 * cohérent avec la carte du hero. 100 % tokens, contrastes AA.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  return (
    <section className="py-14 sm:py-16">
      <EditorialContainer>
        <div className="relative isolate overflow-hidden rounded-[calc(var(--radius-card)+0.4rem)] bg-brand-gradient px-6 py-14 text-center text-brand-contrast shadow-[var(--shadow-pop)] sm:px-12">
          {/* Accent OR + lavis lumineux (décor). */}
          <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-accent-400 to-accent-600" />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-white/10 blur-3xl"
          />
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brand-contrast/85">
              {c.sousTitre}
            </p>
          )}
          {(c.ctaPrimaire || c.ctaSecondaire) && (
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
            </div>
          )}
          {c.lien && (
            <p className="mt-5">
              <a
                href={withBase(basePath, c.lien.href)}
                className="text-sm font-semibold text-brand-contrast/90 underline-offset-4 hover:underline"
              >
                {c.lien.label}
              </a>
            </p>
          )}
        </div>
      </EditorialContainer>
    </section>
  );
}
