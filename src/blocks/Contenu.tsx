import Image from "next/image";
import type { ContenuContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { withBase } from "@/lib/utils";

/**
 * Bloc "contenu" : récit éditorial (titre + paragraphes) avec une image
 * optionnelle côte à côte. Multi-paragraphes (chaque entrée = un <p>), pensé
 * pour les pages « à propos / notre histoire ». Sans image -> prose centrée.
 */
export function Contenu({ block, index, basePath }: BlockComponentProps<ContenuContent>) {
  const c = block.content;
  const paragraphes = c.paragraphes ?? [];
  const imageLeft = c.imagePosition === "left";

  const titre = c.titre && (
    <h2 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
      {c.titre}
      {c.titreAccent && <span className="text-gradient"> {c.titreAccent}</span>}
    </h2>
  );

  const ctas = (c.ctaPrimaire || c.ctaSecondaire) && (
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
  );

  const texte = (
    <div>
      {c.eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{c.eyebrow}</p>
      )}
      {titre && <div className={c.eyebrow ? "mt-3" : undefined}>{titre}</div>}
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
        {paragraphes.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {ctas}
    </div>
  );

  // ---- sans image : prose centrée ----
  if (!c.image) {
    return (
      <Section tone={toneForIndex(index)} containerClassName="max-w-3xl">
        <Reveal>{texte}</Reveal>
      </Section>
    );
  }

  // ---- avec image : deux colonnes ----
  const visuel = (
    <Reveal delay={0.12}>
      <div className="relative mx-auto max-w-md lg:max-w-none">
        <div className="pack-halo absolute -inset-4 -z-10 rounded-[2.5rem] bg-brand-200/40 blur-2xl" />
        <div className="pack-image relative aspect-[4/5] overflow-hidden border border-white/60">
          <Image
            src={c.image.url}
            alt={c.image.alt ?? c.titre ?? ""}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      </div>
    </Reveal>
  );

  return (
    <Section tone={toneForIndex(index)}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {imageLeft ? (
          <>
            {visuel}
            <Reveal>{texte}</Reveal>
          </>
        ) : (
          <>
            <Reveal>{texte}</Reveal>
            {visuel}
          </>
        )}
      </div>
    </Section>
  );
}
