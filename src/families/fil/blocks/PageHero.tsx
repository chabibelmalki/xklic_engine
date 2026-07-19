import Link from "next/link";
import type { PageHeroContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { withBase } from "@/lib/utils";
import { FilContainer } from "../ui/Container";

/**
 * PAGE HERO fil — bandeau d'ENCRE (`brand-800`) refermé par une COUTURE
 * pointillée : fil d'Ariane discret, kicker cousu, titre serif clair. Le pied
 * du bandeau porte la couture signature (fil pointillé + nœud central).
 * Couleurs 100 % tokens, contrastes AA.
 */
export function PageHero({ block, basePath = "" }: BlockComponentProps<PageHeroContent>) {
  const c = block.content;
  return (
    <header className="relative isolate overflow-hidden bg-brand-800 text-white">
      <div aria-hidden className="fil-grain absolute inset-0 text-white/60" />
      <FilContainer wide className="relative py-20 sm:py-24">
        {c.breadcrumb && c.breadcrumb.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="mb-7 text-xs text-white/65">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {c.breadcrumb.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>·</span>}
                  {b.href ? (
                    <Link href={withBase(basePath, b.href)} className="hover:text-white">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-white/85">{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {c.eyebrow && (
          <div className="mb-5 flex items-center gap-3">
            <span aria-hidden className="fil-seam h-px w-11 shrink-0 text-white/45" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-50">
              {c.eyebrow}
            </span>
          </div>
        )}
        <h1 className="max-w-3xl font-display text-4xl leading-[1.06] tracking-[-0.015em] sm:text-5xl">
          {c.titre}
        </h1>
        {c.intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{c.intro}</p>}
        {(c.ctaPrimaire || c.ctaSecondaire) && (
          <div className="mt-8 flex flex-wrap gap-3.5">
            {c.ctaPrimaire && (
              <Button href={withBase(basePath, c.ctaPrimaire.href)} variant="accent" size="md">
                {c.ctaPrimaire.label}
              </Button>
            )}
            {c.ctaSecondaire && (
              <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="white" size="md">
                {c.ctaSecondaire.label}
              </Button>
            )}
          </div>
        )}
      </FilContainer>
      {/* Couture de pied : fil pointillé + nœud central. */}
      <div aria-hidden className="relative">
        <span className="fil-seam absolute inset-x-0 bottom-0 h-px text-accent-500/70" />
        <span className="absolute bottom-[-4px] left-1/2 size-2.5 -translate-x-1/2 rounded-full border border-accent-500 bg-brand-800" />
      </div>
    </header>
  );
}
