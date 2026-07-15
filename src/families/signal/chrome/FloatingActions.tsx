import { Phone, MessageCircle } from "lucide-react";
import { telHref, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";

/**
 * Boutons flottants signal (mobile/tablette) : barre inférieure PLATE à filet,
 * coiffée d'un liseré de marque, bouton d'appel plein en marque. Carrés, nets —
 * cohérents avec la grammaire structurée de la famille. Masqués en desktop.
 * Props identiques à `FloatingActions`.
 */
export function SignalFloatingActions({
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
    // `data-floating-actions` : crochet commun à toutes les familles — la boutique
    // masque ces boutons pendant l'étape paiement (voir globals.css [data-checkout]).
    <div data-floating-actions className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div aria-hidden className="h-0.5 w-full bg-brand-gradient" />
      <div className="flex bg-bg">
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
            className="flex flex-1 items-center justify-center gap-2 border-s border-white/20 bg-brand-600 py-3.5 text-sm font-semibold text-brand-contrast transition-opacity hover:opacity-90"
          >
            <Phone className="size-5" />
            {strings.callAria}
          </a>
        )}
      </div>
    </div>
  );
}
