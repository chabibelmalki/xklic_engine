import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { Sparkle } from "../ui/Eclat";

/**
 * CTA éclat — un appel CENTRÉ et LUMINEUX sur un lavis de marque très pâle
 * (brand-50), encadré de deux étincelles. Titre en serif éditoriale, boutons
 * clairs. Aucune inversion sombre : la famille reste claire de bout en bout.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;

  return (
    <section className="border-y border-border bg-brand-50">
      <EditorialContainer className="py-16 text-center sm:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <div className="flex items-center gap-3 text-brand-500">
            <span className="h-px w-8 bg-brand-200" />
            <Sparkle className="size-4" />
            <span className="h-px w-8 bg-brand-200" />
          </div>
          <h2 className="mt-6 font-display text-3xl leading-[1.1] text-ink sm:text-[2.6rem]">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{c.sousTitre}</p>
          )}

          {(c.ctaPrimaire || c.ctaSecondaire || c.lien) && (
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              {c.ctaPrimaire && (
                <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                  {c.ctaPrimaire.label}
                </Button>
              )}
              {c.ctaSecondaire && (
                <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="outline" size="lg">
                  {c.ctaSecondaire.label}
                </Button>
              )}
              {c.lien && (
                <a
                  href={withBase(basePath, c.lien.href)}
                  className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
                >
                  {c.lien.label}
                </a>
              )}
            </div>
          )}
        </div>
      </EditorialContainer>
    </section>
  );
}
