import type { CtaContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn, withBase } from "@/lib/utils";

/**
 * Appel à l'action. variant : "bande" (carte dégradée arrondie, défaut) ·
 * "encadre" (carte claire bordée, sobre) · "plein" (section dégradée pleine
 * largeur, edge-to-edge). Forte conversion.
 */
export function Cta({ block, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  const variant = block.variant ?? "bande";
  const onLight = variant === "encadre";

  const content = (
    <div className="relative z-10 mx-auto max-w-2xl">
      <h2 className={cn("font-display text-3xl font-bold sm:text-4xl", onLight ? "text-ink" : "text-brand-contrast")}>
        {c.titre}
      </h2>
      {c.sousTitre && (
        <p className={cn("mt-4 text-lg", onLight ? "text-muted" : "text-brand-contrast/85")}>{c.sousTitre}</p>
      )}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {c.ctaPrimaire && (
          <Button
            href={withBase(basePath, c.ctaPrimaire.href)}
            variant={onLight ? "primary" : "white"}
            size="lg"
          >
            {c.ctaPrimaire.label}
          </Button>
        )}
        {c.ctaSecondaire && (
          <Button
            href={withBase(basePath, c.ctaSecondaire.href)}
            variant={onLight ? "outline" : "primary"}
            size="lg"
            className={onLight ? undefined : "bg-white/15 text-white hover:bg-white/25"}
          >
            {c.ctaSecondaire.label}
          </Button>
        )}
      </div>
      {c.lien && (
        <a
          href={withBase(basePath, c.lien.href)}
          {...(c.lien.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={cn(
            "mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline",
            onLight ? "text-brand-700" : "text-brand-contrast/85",
          )}
        >
          {c.lien.label}
        </a>
      )}
    </div>
  );

  if (variant === "plein") {
    return (
      <section className="relative overflow-hidden bg-brand-gradient py-20 text-center sm:py-24">
        <div className="hero-mesh pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <Container>
          <Reveal>{content}</Reveal>
        </Container>
      </section>
    );
  }

  if (variant === "encadre") {
    return (
      <section className="py-20">
        <Container>
          <Reveal>
            <div className="rounded-[2rem] border border-border bg-surface px-7 py-14 text-center shadow-sm sm:px-14">
              {content}
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  // bande (défaut)
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-7 py-14 text-center shadow-2xl shadow-brand-700/20 sm:px-14">
            <div className="hero-mesh pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            {content}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
