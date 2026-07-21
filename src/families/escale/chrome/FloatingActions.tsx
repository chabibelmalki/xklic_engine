import { Phone, MessageCircle } from "lucide-react";
import { telHref, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";

/**
 * Boutons flottants escale (mobile/tablette) — la BARRE DE DISPATCH collée en
 * bas : WhatsApp sur fond de nuit, l'appel en accent opérationnel. Coiffée d'un
 * filet d'accent qui rappelle le volet du header. Props identiques à
 * `FloatingActions`.
 */
export function EscaleFloatingActions({
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
      <div aria-hidden className="h-[3px] w-full bg-accent-500" />
      <div className="flex">
        {whatsapp && (
          <a
            href={`${waHref(whatsapp)}?text=${encodeURIComponent(strings.whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${strings.whatsappAria} ${entreprise}`}
            className="escale-mono flex flex-1 items-center justify-center gap-2 bg-brand-800 py-3.5 text-[0.72rem] font-bold text-white transition-colors hover:bg-brand-700"
          >
            <MessageCircle className="size-5 text-accent-500" />
            WhatsApp
          </a>
        )}
        {telephone && (
          <a
            href={telHref(telephone)}
            aria-label={`${strings.callAria} ${entreprise}`}
            className="escale-mono flex flex-1 items-center justify-center gap-2 bg-accent-500 py-3.5 text-[0.72rem] font-bold text-accent-contrast transition-colors hover:bg-accent-600"
          >
            <Phone className="size-5" />
            {strings.callAria}
          </a>
        )}
      </div>
    </div>
  );
}
