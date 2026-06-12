import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { withBase } from "@/lib/utils";

/** Bande d'appel à l'action en dégradé de marque (forte conversion). */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-7 py-14 text-center shadow-2xl shadow-brand-700/20 sm:px-14">
            <div className="hero-mesh pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-bold text-brand-contrast sm:text-4xl">
                {c.titre}
              </h2>
              {c.sousTitre && (
                <p className="mt-4 text-lg text-brand-contrast/85">{c.sousTitre}</p>
              )}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {c.ctaPrimaire && (
                  <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="white" size="lg">
                    {c.ctaPrimaire.label}
                  </Button>
                )}
                {c.ctaSecondaire && (
                  <Button
                    href={withBase(basePath, c.ctaSecondaire.href)}
                    size="lg"
                    className="bg-white/15 text-white hover:bg-white/25"
                  >
                    {c.ctaSecondaire.label}
                  </Button>
                )}
              </div>
              {c.lien && (
                <a
                  href={withBase(basePath, c.lien.href)}
                  {...(c.lien.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="mt-4 inline-block text-sm font-medium text-brand-contrast/85 underline-offset-4 hover:underline"
                >
                  {c.lien.label}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
