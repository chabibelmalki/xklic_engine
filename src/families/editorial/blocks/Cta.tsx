import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../ui/Container";

/**
 * CTA éditorial : BANDE PLATE pleine largeur en couleur de marque (pas la carte
 * dégradée arrondie de la famille classic). Grand titre, sous-titre sobre, CTA.
 * Couleurs 100 % tokens (`brand-600` + `brand-contrast`) → suit la palette client.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  return (
    <section className="bg-brand-600 text-brand-contrast">
      <EditorialContainer className="py-20 sm:py-28">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-90">{c.sousTitre}</p>
          )}
          {(c.ctaPrimaire || c.ctaSecondaire) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
      </EditorialContainer>
    </section>
  );
}
