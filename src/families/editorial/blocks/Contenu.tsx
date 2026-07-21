import Image from "next/image";
import type { ContenuContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { MutedVideo } from "@/components/ui/MutedVideo";
import { withBase, cn } from "@/lib/utils";
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

  if (!c.image && !c.video) {
    return (
      <EditorialSection tone={tone}>
        <EditorialContainer>{texte}</EditorialContainer>
      </EditorialSection>
    );
  }

  // `imageRatio: "fill"` → l'image REMPLIT la hauteur de la colonne texte
  // (object-cover, ne rogne que le haut/bas d'une photo paysage) : rééquilibre un
  // texte long face à une image qui paraîtrait sinon petite. Sinon → ratio fixe.
  const fillImage = c.imageRatio === "fill";
  // `imageCard` : coins arrondis + ombre teintée marque (bleu clair du site) +
  // image légèrement agrandie (colonnes asymétriques). Opt-in par bloc.
  const imageCard = c.imageCard === true;
  const cardClass = "rounded-2xl shadow-2xl shadow-brand-400/40";
  const gridCols =
    !fillImage && imageCard
      ? imageLeft
        ? "lg:grid-cols-[1.08fr_0.92fr]"
        : "lg:grid-cols-[0.92fr_1.08fr]"
      : "lg:grid-cols-2";
  const visuel = c.video ? (
    <div className="mx-auto w-full max-w-sm">
      <div
        className={cn(
          "relative aspect-[9/16] overflow-hidden bg-ink/5",
          imageCard && cardClass,
        )}
      >
        <MutedVideo
          src={c.video.url}
          poster={c.video.poster}
          ariaLabel={c.video.alt ?? c.titre ?? ""}
          autoPlayInView={c.video.autoplay}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  ) : fillImage ? (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden bg-surface-2 lg:aspect-auto lg:h-full lg:min-h-[420px]",
        imageCard && cardClass,
      )}
    >
      <Image
        src={c.image?.url ?? ""}
        alt={c.image?.alt ?? c.titre ?? ""}
        fill
        sizes="(max-width: 1024px) 100vw, 48vw"
        className="object-cover"
      />
    </div>
  ) : (
    <EditorialImage
      src={c.image?.url ?? ""}
      alt={c.image?.alt ?? c.titre ?? ""}
      ratio={c.imageRatio ?? "4/5"}
      sizes="(max-width: 1024px) 100vw, 48vw"
      className={imageCard ? cardClass : undefined}
    />
  );

  return (
    <EditorialSection tone={tone}>
      <EditorialContainer>
        <div className={cn("grid gap-12", gridCols, fillImage ? "items-stretch" : "items-center")}>
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
