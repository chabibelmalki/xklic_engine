import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { LiveDot, MeridianField } from "../ui/Escale";

/**
 * CTA escale — la BANDE DE DISPATCH : un panneau de nuit pleine largeur, voyant
 * « en service » allumé, titre display en capitales et boutons clairs. La
 * dernière ligne du tableau : « prenez contact, on décolle ».
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;

  return (
    <section className="relative isolate overflow-hidden bg-brand-800 text-white">
      <MeridianField className="text-white/[0.08]" />

      <EditorialContainer className="relative grid gap-9 py-16 sm:py-20 lg:grid-cols-[1.5fr_auto] lg:items-center">
        <div>
          <span className="mb-5 inline-flex items-center gap-2.5">
            <LiveDot />
            <span className="escale-mono text-[0.66rem] font-bold text-white/60">24 / 7 · 365</span>
          </span>
          <h2 className="max-w-2xl font-display text-[2.2rem] leading-[0.98] sm:text-[3rem]">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">{c.sousTitre}</p>
          )}
        </div>

        {(c.ctaPrimaire || c.ctaSecondaire || c.lien) && (
          <div className="flex flex-col gap-3 lg:min-w-64">
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
            {c.lien && (
              <a
                href={withBase(basePath, c.lien.href)}
                className="escale-mono text-center text-[0.72rem] font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
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
