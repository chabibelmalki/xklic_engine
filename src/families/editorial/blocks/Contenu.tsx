import type { ContenuContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialImage } from "../ui/Image";

/**
 * Récit éditorial : kicker + grand titre + paragraphes, avec image NETTE
 * (plein cadre, sans radius ni ombre) côte à côte. Sans image → prose seule.
 */
export function Contenu({ block, tone, basePath }: BlockComponentProps<ContenuContent>) {
  const c = block.content;
  const paragraphes = c.paragraphes ?? [];
  const imageLeft = c.imagePosition === "left";

  const texte = (
    <div>
      {c.eyebrow && (
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-10 bg-brand-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
            {c.eyebrow}
          </span>
        </div>
      )}
      {c.titre && (
        <h2 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl">
          {c.titre}
          {c.titreAccent && <span className="text-brand-600"> {c.titreAccent}</span>}
        </h2>
      )}
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
        {paragraphes.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {(c.ctaPrimaire || c.ctaSecondaire) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {c.ctaPrimaire && (
            <Button href={withBase(basePath, c.ctaPrimaire.href)}>{c.ctaPrimaire.label}</Button>
          )}
          {c.ctaSecondaire && (
            <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="outline">
              {c.ctaSecondaire.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (!c.image) {
    return (
      <EditorialSection tone={tone}>
        <EditorialContainer>{texte}</EditorialContainer>
      </EditorialSection>
    );
  }

  const visuel = (
    <EditorialImage
      src={c.image.url}
      alt={c.image.alt ?? c.titre ?? ""}
      ratio={c.imageRatio ?? "4/5"}
      sizes="(max-width: 1024px) 100vw, 48vw"
    />
  );

  return (
    <EditorialSection tone={tone}>
      <EditorialContainer>
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
      </EditorialContainer>
    </EditorialSection>
  );
}
