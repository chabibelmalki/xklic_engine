import { Phone, MessageCircle } from "lucide-react";
import { telHref, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";
import { InkBar } from "../ui/Riso";

/**
 * Boutons flottants riso (mobile/tablette) — deux aplats d'encre jointifs sous la
 * barre de contrôle couleur : WhatsApp en réserve (papier), l'appel en aplat de
 * marque pleine. Libellés en mono d'imprimeur, angles francs, aucune ombre.
 * Props identiques à `FloatingActions`.
 */
export function RisoFloatingActions({
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
      <InkBar />
      <div className="flex bg-bg">
        {whatsapp && (
          <a
            href={`${waHref(whatsapp)}?text=${encodeURIComponent(strings.whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${strings.whatsappAria} ${entreprise}`}
            className="riso-mono flex flex-1 items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-alt"
          >
            <MessageCircle className="size-5 text-accent-500" />
            WhatsApp
          </a>
        )}
        {telephone && (
          <a
            href={telHref(telephone)}
            aria-label={`${strings.callAria} ${entreprise}`}
            className="riso-mono flex flex-1 items-center justify-center gap-2 bg-brand-600 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-brand-contrast transition-colors hover:bg-brand-700"
          >
            <Phone className="size-5" />
            {strings.callAria}
          </a>
        )}
      </div>
    </div>
  );
}
