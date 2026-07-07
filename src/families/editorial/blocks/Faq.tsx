import { Plus } from "lucide-react";
import type { FaqContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";

/**
 * FAQ éditoriale — accordéon 100 % NATIF (`<details>/<summary>`), SSR, zéro JS.
 * Filets fins, grandes questions, icône +/× via CSS `[open]`. Le JSON-LD FAQPage
 * est injecté séparément (SEO), et les réponses sont dans le DOM.
 */
export function Faq({ block, tone, strings }: BlockComponentProps<FaqContent>) {
  const c = block.content;
  return (
    <EditorialSection id="faq" tone={tone}>
      <EditorialContainer className="!max-w-3xl">
        <EditorialHeading
          kicker={c.titre ? strings.faq.eyebrow : strings.faq.defaultTitle}
          title={c.titre ?? strings.faq.defaultTitle}
        />
        <div className="mt-12 border-t border-border">
          {c.items.map((q) => (
            <details key={q.question} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-lg font-semibold text-ink sm:text-xl">
                  {q.question}
                </span>
                <Plus className="size-5 shrink-0 text-brand-600 transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-muted">{q.reponse}</p>
            </details>
          ))}
        </div>
      </EditorialContainer>
    </EditorialSection>
  );
}
