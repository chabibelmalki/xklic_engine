import { Phone } from "lucide-react";
import { telHrefIntl, waHref } from "@/lib/utils";
import { SocialIcon } from "@/components/ui/SocialIcon";
import type { UIStrings } from "@/i18n/ui";

/**
 * Barre d'action flottante prestige (mobile/tablette) : le CTA d'un taxi, c'est
 * APPELER. Barre pleine largeur, sticky en bas — deux boutons ICÔNE SEULE
 * (WhatsApp + Appel), sans libellé ni numéro (l'intitulé reste porté par
 * `aria-label` pour l'accessibilité). Masquée en desktop (le header garde la
 * réservation visible). Props identiques à `FloatingActions`.
 */
export function PrestigeFloatingActions({
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
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--px-hairline)] bg-[var(--px-void)] lg:hidden"
    >
      {whatsapp && (
        <a
          href={`${waHref(whatsapp)}?text=${encodeURIComponent(strings.whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${strings.whatsappAria} ${entreprise}`}
          className="flex flex-1 items-center justify-center border-e border-[var(--px-line)] py-4 text-[var(--px-gold)]"
        >
          <SocialIcon platform="whatsapp" className="size-6" />
        </a>
      )}
      {telephone && (
        <a
          href={telHrefIntl(telephone)}
          aria-label={`${strings.callAria} ${entreprise}`}
          className="flex flex-1 items-center justify-center bg-[var(--px-gold)] py-4 text-[var(--px-void)] transition-opacity hover:opacity-90"
        >
          <Phone className="size-6" strokeWidth={2.4} />
        </a>
      )}
    </div>
  );
}
