import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { FilContainer } from "../ui/Container";

/**
 * CTA fil — BANDE D'ENCRE cousue au corps : pan `brand-800` ouvert et refermé
 * par un fil pointillé, titre serif avec accent italique sable, boutons
 * accent/blanc. Un petit fil décoratif se coud derrière le titre. Couleurs
 * 100 % tokens, contrastes AA.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  const primary = c.ctaPrimaire ?? c.lien;
  return (
    <section className="relative isolate overflow-hidden bg-brand-800 text-white">
      <span aria-hidden className="fil-seam absolute inset-x-0 top-0 h-px text-accent-500/70" />
      <div aria-hidden className="fil-grain absolute inset-0 text-white/60" />
      {/* Fil décoratif traversant la bande. */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full overflow-visible opacity-70"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
      >
        <path
          d="M-20,210 C240,110 480,250 760,170 S1200,80 1460,140"
          fill="none"
          stroke="color-mix(in srgb, var(--accent-500) 45%, transparent)"
          strokeWidth="1.4"
          strokeDasharray="6 9"
        />
      </svg>
      <FilContainer className="relative py-20 text-center sm:py-24">
        <h2 className="mx-auto max-w-2xl font-display text-3xl leading-[1.1] tracking-[-0.015em] sm:text-[2.6rem]">
          {c.titre}
        </h2>
        {c.sousTitre && (
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80">{c.sousTitre}</p>
        )}
        {(primary || c.ctaSecondaire) && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            {primary && (
              <Button href={withBase(basePath, primary.href)} variant="accent" size="lg">
                {primary.label}
              </Button>
            )}
            {c.ctaSecondaire && (
              <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="white" size="lg">
                {c.ctaSecondaire.label}
              </Button>
            )}
          </div>
        )}
      </FilContainer>
    </section>
  );
}
