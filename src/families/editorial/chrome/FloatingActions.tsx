import { Phone, MessageCircle } from "lucide-react";
import { telHref, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";

/**
 * Boutons flottants éditorial (mobile/tablette) : version SOBRE — carrés, plats,
 * filet fin, couleurs tokens (pas les pastilles rondes à ombre de la famille
 * classic). Masqués en desktop. Props identiques à `FloatingActions`.
 */
export function EditorialFloatingActions({
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
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-bg lg:hidden">
      {whatsapp && (
        <a
          href={`${waHref(whatsapp)}?text=${encodeURIComponent(strings.whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${strings.whatsappAria} ${entreprise}`}
          className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          <MessageCircle className="size-5 text-brand-600" />
          WhatsApp
        </a>
      )}
      {telephone && (
        <a
          href={telHref(telephone)}
          aria-label={`${strings.callAria} ${entreprise}`}
          className="flex flex-1 items-center justify-center gap-2 border-s border-border bg-brand-600 py-3.5 text-sm font-semibold text-brand-contrast transition-opacity hover:opacity-90"
        >
          <Phone className="size-5" />
          {strings.callAria}
        </a>
      )}
    </div>
  );
}
