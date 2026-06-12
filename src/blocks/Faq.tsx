"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * FAQ — accordéon animé (grid-rows transition), accessible (aria-expanded).
 * Le JSON-LD FAQPage est injecté séparément (SEO). Première entrée ouverte.
 */
export function Faq({ block, index, strings }: BlockComponentProps<FaqContent>) {
  const c = block.content;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" tone={toneForIndex(index)} containerClassName="max-w-3xl">
      <Reveal>
        <SectionHeading
          eyebrow={c.titre ? strings.faq.eyebrow : strings.faq.defaultTitle}
          title={c.titre ?? strings.faq.defaultTitle}
        />
      </Reveal>
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
