import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialContainer } from "../../editorial/ui/Container";
import { Halftone, InkBar, OffsetText, RegistrationMark } from "../ui/Riso";

/**
 * CTA riso — la bande la plus VIOLENTE de la page : un aplat d'ACCENT pur (pas
 * la couleur de marque, contrairement à toutes les autres familles), traversé
 * par une surimpression de marque en `multiply`. Le texte y est imprimé en encre
 * foncée (`accent-contrast`, choisi par contraste WCAG à la génération de
 * palette), jamais en blanc sur fluo.
 *
 * C'est le renversement de couleur du site : partout ailleurs l'accent n'est
 * qu'une étiquette, ici il prend toute la feuille.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;

  return (
    <section className="relative isolate overflow-hidden bg-accent-500 text-accent-contrast">
      {/* Surimpression de marque : l'encre de marque passe sur l'accent. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 size-[30rem] rounded-full bg-brand-600 opacity-80 mix-blend-multiply"
      />
      <Halftone lg className="text-ink/15" />
      <RegistrationMark className="absolute right-5 top-5 text-ink/30" />

      <EditorialContainer className="relative grid gap-9 py-16 sm:py-20 lg:grid-cols-[1.5fr_auto] lg:items-center">
        <div>
          <h2 className="max-w-2xl font-display text-3xl uppercase leading-[0.98] sm:text-[2.6rem]">
            <OffsetText>{c.titre}</OffsetText>
          </h2>
          {c.sousTitre && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-85">{c.sousTitre}</p>
          )}
        </div>

        {(c.ctaPrimaire || c.ctaSecondaire || c.lien) && (
          <div className="flex flex-col gap-3 lg:min-w-64">
            {c.ctaPrimaire && (
              <Button
                href={withBase(basePath, c.ctaPrimaire.href)}
                size="lg"
                className="bg-ink text-bg shadow-none hover:-translate-y-0 hover:bg-brand-800 hover:shadow-none"
              >
                {c.ctaPrimaire.label}
              </Button>
            )}
            {c.ctaSecondaire && (
              <Button
                href={withBase(basePath, c.ctaSecondaire.href)}
                variant="outline"
                size="lg"
                className="border-2 border-ink/40 bg-transparent text-ink hover:border-ink hover:bg-ink/5"
              >
                {c.ctaSecondaire.label}
              </Button>
            )}
            {c.lien && (
              <a
                href={withBase(basePath, c.lien.href)}
                className="riso-mono text-center text-xs font-bold uppercase tracking-[0.12em] underline-offset-4 hover:underline"
              >
                {c.lien.label}
              </a>
            )}
          </div>
        )}
      </EditorialContainer>

      <InkBar className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
