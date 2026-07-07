import { Plus } from "lucide-react";
import type { FaqContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { PrestigeSection } from "../ui/Section";
import { PrestigeContainer } from "../ui/Container";
import { PrestigeHeading } from "../ui/Heading";

/**
 * FAQ prestige — accordéon 100 % NATIF (`<details>/<summary>`), SSR, zéro JS.
 * Registre sombre : filets métalliques, grandes questions blanches, icône +/×
 * en or via CSS `[open]`. Le JSON-LD FAQPage est injecté séparément (SEO).
 */
export function Faq({ block, strings }: BlockComponentProps<FaqContent>) {
  const c = block.content;
  return (
    <PrestigeSection id="faq" surface="void">
      <PrestigeContainer className="!max-w-3xl">
        <PrestigeHeading
          kicker={c.titre ? strings.faq.eyebrow : strings.faq.defaultTitle}
          title={c.titre ?? strings.faq.defaultTitle}
        />
        <div className="mt-12 border-t border-[var(--px-line)]">
          {c.items.map((q) => (
            <details key={q.question} className="group border-b border-[var(--px-line)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-lg font-semibold text-white sm:text-xl">
                  {q.question}
                </span>
                <Plus className="size-5 shrink-0 text-[var(--px-gold)] transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-[var(--px-ink-soft)]">{q.reponse}</p>
            </details>
          ))}
        </div>
      </PrestigeContainer>
    </PrestigeSection>
  );
}
