import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { CascadeContainer } from "../ui/Container";
import { CascadeSeal } from "../ui/Seal";
import { Aura, BubbleField, WaveEdge } from "../ui/Decor";

/**
 * CTA cascade — BANDE IMMERSIVE plein-bord : dégradé bleu→vert, VAGUE en tête (la
 * page se déverse dans la bande), halos d'eau, gouttelettes et SCEAU en filigrane.
 * Grand titre, sous-titre, CTA en pilules. Signature de la famille, cohérente avec
 * le hero. 100 % tokens (dégradé dérivé de branding.colors).
 */
const GRADIENT =
  "linear-gradient(145deg, var(--brand-800) 0%, var(--brand-600) 46%, color-mix(in srgb, var(--accent-600) 80%, var(--brand-700)) 100%)";

export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  return (
    <section className="relative isolate overflow-hidden text-white" style={{ background: GRADIENT }}>
      <WaveEdge position="top" fill="var(--bg)" />
      <Aura />
      <BubbleField />

      <CascadeSeal
        label="Protéger · Préserver"
        seed="cta"
        tone="light"
        className="absolute -right-10 top-1/2 z-0 hidden size-64 -translate-y-1/2 opacity-25 lg:block"
      />

      <CascadeContainer className="relative z-20 py-24 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <h2 className="font-display text-[2.2rem] font-extrabold leading-[1.02] tracking-[-0.02em] sm:text-5xl">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">{c.sousTitre}</p>
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
                  size="lg"
                  className="border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
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
                className="text-sm font-medium text-white underline underline-offset-4 opacity-90 hover:opacity-100"
              >
                {c.lien.label}
              </a>
            </div>
          )}
        </div>
      </CascadeContainer>
    </section>
  );
}
