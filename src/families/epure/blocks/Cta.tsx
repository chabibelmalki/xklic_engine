import { Star } from "lucide-react";
import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";

/**
 * CTA atelier — PANNEAU vert profond ENCADRÉ (bordure épaisse + ombre DURE
 * décalée), gros titre display, étoiles dorées, bouton OR à ombre dure. Jamais
 * une image ni une bande fade : un bloc de couleur qui « claque », cohérent avec
 * les stickers/cartes de la famille. 100 % tokens, contrastes AA.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  return (
    <section className="py-14 sm:py-20">
      <EditorialContainer>
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border-2 border-brand-800 bg-brand-gradient px-6 py-14 text-center text-brand-contrast shadow-[8px_8px_0_0_var(--brand-800)] sm:px-12">
          <span className="mb-6 inline-flex items-center gap-2 text-accent-400">
            <Star className="size-5 fill-current" />
            <Star className="size-5 fill-current" />
            <Star className="size-5 fill-current" />
          </span>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-contrast/85">
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
                  variant="white"
                  size="lg"
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
                className="text-sm font-bold uppercase tracking-wide text-brand-contrast/90 underline-offset-4 hover:underline"
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
