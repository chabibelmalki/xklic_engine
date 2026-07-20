import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { AzulejoFrieze, AzulejoWall } from "../ui/Azulejo";

/**
 * CTA azulejo — un PANNEAU DE FAÏENCE encadré : aplat de marque tramé de joints,
 * bordé en haut et en bas d'une frise de losanges, comme un cartouche de carreaux
 * scellé au mur. Titre en serif haute blanc, boutons clairs. Sobre et grave, sans
 * le renversement fluo de riso.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;

  return (
    <section className="relative isolate overflow-hidden bg-brand-700 text-white">
      <AzulejoWall className="text-white/10" />
      <AzulejoFrieze className="absolute inset-x-0 top-0" />

      <EditorialContainer className="relative grid gap-9 py-16 sm:py-20 lg:grid-cols-[1.5fr_auto] lg:items-center">
        <div>
          <h2 className="max-w-2xl font-display text-3xl leading-[1.08] sm:text-[2.5rem]">
            {c.titre}
          </h2>
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

      <AzulejoFrieze className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
