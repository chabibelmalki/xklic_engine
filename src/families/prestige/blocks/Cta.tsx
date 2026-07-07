import Image from "next/image";
import { Phone } from "lucide-react";
import type { CtaContent, ContactContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { telHref, withBase } from "@/lib/utils";
import { findBlock } from "@/lib/pages";
import { PrestigeContainer } from "../ui/Container";

/**
 * CTA prestige — BANDE IMMERSIVE pleine largeur : image nocturne « mouvement »
 * plein cadre sous un voile sombre (contraste AA), grand titre display et, si un
 * numéro existe, le NUMÉRO DE RÉSERVATION géant en or (l'action première du
 * taxi). Sans image, la bande retombe sur le fond `raised` — jamais de carte.
 */
export function Cta({ block, config, basePath = "" }: BlockComponentProps<CtaContent>) {
  const c = block.content;
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const tel = contact?.telephone;

  return (
    <section className="relative isolate overflow-hidden bg-[var(--px-raised)] text-white">
      {c.image && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={c.image.url}
            alt={c.image.alt ?? ""}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(4,5,7,0.94)_0%,rgba(4,5,7,0.80)_55%,rgba(4,5,7,0.55)_100%)]" />
        </div>
      )}

      <PrestigeContainer className="py-24 sm:py-28">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl">
            {c.titre}
          </h2>
          {c.sousTitre && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{c.sousTitre}</p>
          )}

          {tel && (
            <a
              href={telHref(tel)}
              className="group mt-10 inline-flex flex-col focus-visible:outline-none"
            >
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/60">
                Réservez votre chauffeur
              </span>
              <span className="mt-2 inline-flex items-center gap-4 font-sans text-4xl font-bold tabular-nums leading-none tracking-tight text-white transition-colors group-hover:text-[var(--px-gold)] sm:text-6xl">
                <Phone className="size-8 shrink-0 text-[var(--px-gold)] sm:size-10" strokeWidth={2.2} />
                {tel}
              </span>
            </a>
          )}

          {(c.ctaPrimaire || c.ctaSecondaire) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {c.ctaPrimaire && (
                <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
                  {c.ctaPrimaire.label}
                </Button>
              )}
              {c.ctaSecondaire && (
                <a
                  href={withBase(basePath, c.ctaSecondaire.href)}
                  className="inline-flex h-14 items-center justify-center border border-[var(--px-line)] px-8 text-base font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-[var(--px-gold)] hover:text-[var(--px-gold)]"
                >
                  {c.ctaSecondaire.label}
                </a>
              )}
            </div>
          )}

          {c.lien && (
            <div className="mt-6">
              <a
                href={withBase(basePath, c.lien.href)}
                className="text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white"
              >
                {c.lien.label}
              </a>
            </div>
          )}
        </div>
      </PrestigeContainer>
    </section>
  );
}
