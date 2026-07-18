import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { ArondeContainer } from "../ui/Container";
import { ArondeDovetail } from "../ui/Dovetail";

/**
 * CTA aronde : BANDE espresso (`brand-800`) coiffée d'une QUEUE D'ARONDE en tête
 * (le corps clair vient s'emboîter dedans), grain de bois discret, filet caramel,
 * grand titre slab, CTA caramel. Grammaire volontairement OPPOSÉE aux sections
 * claires du corps → moment fort. Couleurs 100 % tokens (palette client).
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  return (
    <section className="relative isolate overflow-hidden bg-brand-800 text-white">
      <ArondeDovetail variant="cta" edge="top" />
      <div aria-hidden className="aronde-grain absolute inset-0 -z-0 text-white/70" />
      <ArondeContainer wide className="relative z-10 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-8 h-[3px] w-16 bg-accent-500" />
          <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-[-0.01em] sm:text-5xl">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              {c.sousTitre}
            </p>
          )}
          {(c.ctaPrimaire || c.ctaSecondaire) && (
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              {c.ctaPrimaire && (
                <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="accent" size="lg">
                  {c.ctaPrimaire.label}
                </Button>
              )}
              {c.ctaSecondaire && (
                <Button
                  href={withBase(basePath, c.ctaSecondaire.href)}
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10"
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
                className="text-sm font-medium text-accent-50 underline underline-offset-4 hover:text-white"
              >
                {c.lien.label}
              </a>
            </div>
          )}
        </div>
      </ArondeContainer>
    </section>
  );
}
