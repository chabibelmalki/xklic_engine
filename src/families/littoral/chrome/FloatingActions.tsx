import { Phone, MessageCircle } from "lucide-react";
import { telHref, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";

/**
 * Boutons flottants littoral (mobile/tablette) : barre basse pleine largeur,
 * appel en OR (accent), WhatsApp clair à filet. Couleurs tokens. Masqués en
 * desktop. Props identiques à `FloatingActions`.
 */
export function LittoralFloatingActions({
  telephone,
  whatsapp,
  entreprise,
  strings,
}: {
  telephone?: string;
  whatsapp?: string;
  entreprise: string;
  strings: UIStrings["floating"];
}) {
  if (!telephone && !whatsapp) return null;

  return (
    <div
      data-floating-actions
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-100 bg-bg lg:hidden"
    >
      {whatsapp && (
        <a
          href={`${waHref(whatsapp)}?text=${encodeURIComponent(strings.whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${strings.whatsappAria} ${entreprise}`}
          className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
        >
          <MessageCircle className="size-5 text-brand-600" />
          WhatsApp
        </a>
      )}
      {telephone && (
        <a
          href={telHref(telephone)}
          aria-label={`${strings.callAria} ${entreprise}`}
          className="flex flex-1 items-center justify-center gap-2 border-s border-brand-100 bg-accent-500 py-3.5 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Phone className="size-5" />
          {strings.callAria}
        </a>
      )}
    </div>
  );
}
