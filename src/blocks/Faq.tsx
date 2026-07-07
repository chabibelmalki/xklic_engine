"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * FAQ. variant : "accordeon" (replié animé, défaut) · "deux-colonnes" (Q/R
 * dépliées sur 2 colonnes) · "liste-ouverte" (Q/R dépliées empilées). Le JSON-LD
 * FAQPage est injecté séparément (SEO).
 */
export function Faq({ block, tone, strings }: BlockComponentProps<FaqContent>) {
  const c = block.content;
  const variant = block.variant ?? "accordeon";
  const [open, setOpen] = useState<number | null>(0);

  const header = (
    <Reveal>
      <SectionHeading
        eyebrow={c.titre ? strings.faq.eyebrow : strings.faq.defaultTitle}
        title={c.titre ?? strings.faq.defaultTitle}
      />
    </Reveal>
  );

  if (variant === "deux-colonnes") {
    return (
      <Section id="faq" tone={tone} containerClassName="max-w-5xl">
        {header}
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {c.items.map((q, i) => (
            <Reveal key={q.question} delay={(i % 2) * 0.05}>
              <h3 className="font-display text-lg font-bold text-ink">{q.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{q.reponse}</p>
            </Reveal>
          ))}
        </div>
      </Section>
    );
  }

  if (variant === "liste-ouverte") {
    return (
      <Section id="faq" tone={tone} containerClassName="max-w-3xl">
        {header}
        <div className="mt-10 divide-y divide-border border-y border-border">
          {c.items.map((q, i) => (
            <Reveal key={q.question} delay={(i % 4) * 0.04}>
              <div className="py-5">
                <h3 className="font-display text-lg font-bold text-ink">{q.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{q.reponse}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section id="faq" tone={tone} containerClassName="max-w-3xl">
      {header}
      <Reveal delay={0.05}>
        <div className="mt-10 divide-y divide-border overflow-hidden rounded-theme border border-border bg-surface">
          {c.items.map((q, i) => {
            const isOpen = open === i;
            const btnId = `faq-q-${i}`;
            const panelId = `faq-a-${i}`;
            return (
              <div key={q.question}>
                <button
                  id={btnId}
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="font-semibold text-ink">{q.question}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-brand-600 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  aria-hidden={!isOpen}
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{q.reponse}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}
