import type { ContenuContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { withBase } from "@/lib/utils";
import { PrestigeSection } from "../ui/Section";
import { PrestigeContainer } from "../ui/Container";
import { PrestigeImage } from "../ui/Image";

/**
 * Récit prestige — kicker or à filet, grand titre display, paragraphes posés sur
 * fond sombre. Image optionnelle NETTE (bords carrés, filet métallique, voile
 * sombre) côte à côte ; sans image → prose seule pleine mesure.
 */
export function Contenu({ block, basePath }: BlockComponentProps<ContenuContent>) {
  const c = block.content;
  const paragraphes = c.paragraphes ?? [];
  const imageLeft = c.imagePosition === "left";

  const texte = (
    <div>
      {c.eyebrow && (
        <div className="mb-6 flex items-center gap-4">
          <span className="h-px w-12 bg-[var(--px-gold)]" />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--px-gold)]">
            {c.eyebrow}
          </span>
        </div>
      )}
      {c.titre && (
        <h2 className="font-display text-3xl font-semibold leading-[1.04] tracking-tight text-white sm:text-4xl">
          {c.titre}
          {c.titreAccent && <span className="text-[var(--px-gold)]"> {c.titreAccent}</span>}
        </h2>
      )}
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-[var(--px-ink-soft)]">
        {paragraphes.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {(c.ctaPrimaire || c.ctaSecondaire) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {c.ctaPrimaire && (
            <a
              href={withBase(basePath, c.ctaPrimaire.href)}
              className="inline-flex h-12 items-center justify-center bg-[var(--px-gold)] px-7 text-sm font-bold uppercase tracking-[0.14em] text-[var(--px-void)] transition-opacity hover:opacity-90"
            >
              {c.ctaPrimaire.label}
            </a>
          )}
          {c.ctaSecondaire && (
            <a
              href={withBase(basePath, c.ctaSecondaire.href)}
              className="inline-flex h-12 items-center justify-center border border-[var(--px-line)] px-7 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-[var(--px-gold)] hover:text-[var(--px-gold)]"
            >
              {c.ctaSecondaire.label}
            </a>
          )}
        </div>
      )}
    </div>
  );

  if (!c.image) {
    return (
      <PrestigeSection surface="void">
        <PrestigeContainer className="!max-w-3xl">{texte}</PrestigeContainer>
      </PrestigeSection>
    );
  }

  const visuel = (
    <PrestigeImage
      src={c.image.url}
      alt={c.image.alt ?? c.titre ?? ""}
      ratio={c.imageRatio ?? "4/5"}
      sizes="(max-width: 1024px) 100vw, 48vw"
      framed
      scrim
    />
  );

  return (
    <PrestigeSection surface="void">
      <PrestigeContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {imageLeft ? (
            <>
              {visuel}
              {texte}
            </>
          ) : (
            <>
              {texte}
              {visuel}
            </>
          )}
        </div>
      </PrestigeContainer>
    </PrestigeSection>
  );
}
