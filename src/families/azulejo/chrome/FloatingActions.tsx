import { Phone, MessageCircle } from "lucide-react";
import { telHref, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";
import { AzulejoFrieze } from "../ui/Azulejo";

/**
 * Boutons flottants azulejo (mobile/tablette) — deux tomettes jointives sous la
 * frise de faïence : WhatsApp en carreau clair, l'appel en carreau de marque
 * pleine. Coins doux, libellés lisibles. Props identiques à `FloatingActions`.
 */
export function AzulejoFloatingActions({
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
      <AzulejoFrieze />
      <div className="flex bg-bg">
        {whatsapp && (
          <a
            href={`${waHref(whatsapp)}?text=${encodeURIComponent(strings.whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${strings.whatsappAria} ${entreprise}`}
            className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-alt"
          >
            <MessageCircle className="size-5 text-brand-600" />
            WhatsApp
          </a>
        )}
        {telephone && (
          <a
            href={telHref(telephone)}
            aria-label={`${strings.callAria} ${entreprise}`}
            className="flex flex-1 items-center justify-center gap-2 bg-brand-600 py-3.5 text-sm font-semibold text-brand-contrast transition-colors hover:bg-brand-700"
          >
            <Phone className="size-5" />
            {strings.callAria}
          </a>
        )}
      </div>
    </div>
  );
}
