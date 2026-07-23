import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { CoupDeFouet, Ferronnerie, Ombelle } from "../ui/Verriere";

/**
 * CTA verrière — le PANNEAU PROFOND : un aplat de verre teinté nuit (brand-800)
 * cerné d'un filet de laiton et ferré aux quatre angles par les volutes de
 * garde-corps. C'est le seul endroit où la verrière s'assombrit : le contraste
 * fait office d'appel, sans crier.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;

  return (
    <section className="relative isolate overflow-hidden bg-brand-800 text-white">
      <Ombelle className="pointer-events-none absolute -left-10 -top-16 size-72 text-white/[0.05]" />
      <Ferronnerie corner="tl" className="pointer-events-none absolute left-4 top-4 size-24 text-accent-500/30" />
      <Ferronnerie corner="br" className="pointer-events-none absolute bottom-4 right-4 size-24 text-accent-500/30" />

      <EditorialContainer className="relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.5fr_auto] lg:items-center">
        <div>
          <h2 className="max-w-2xl font-display text-3xl leading-[1.12] sm:text-[2.4rem]">
            {c.titre}
          </h2>
          <CoupDeFouet className="mt-4 h-6 w-56 text-accent-500/80" />
          {c.sousTitre && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{c.sousTitre}</p>
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
                className="border-white/50 bg-transparent text-white hover:border-white hover:bg-white/10"
              >
                {c.ctaSecondaire.label}
              </Button>
            )}
            {c.lien && (
              <a
                href={withBase(basePath, c.lien.href)}
                className="text-center text-sm font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline"
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
