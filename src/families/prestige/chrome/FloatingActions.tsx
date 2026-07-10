import { Phone, MessageCircle } from "lucide-react";
import { telHrefIntl, telIndicatif, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";

/**
 * Barre d'action flottante prestige (mobile/tablette) : le CTA d'un taxi, c'est
 * APPELER. Barre pleine largeur, sticky en bas, bouton OR massif avec le numéro
 * en tabular-nums + WhatsApp optionnel. Masquée en desktop (le header garde la
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
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--px-hairline)] bg-[var(--px-void)] lg:hidden">
      {whatsapp && (
        <a
          href={`${waHref(whatsapp)}?text=${encodeURIComponent(strings.whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${strings.whatsappAria} ${entreprise}`}
          className="flex shrink-0 items-center justify-center gap-2 border-e border-[var(--px-line)] px-5 py-4 text-sm font-semibold text-white"
        >
          <MessageCircle className="size-5 text-[var(--px-gold)]" />
          <span className="sr-only sm:not-sr-only">WhatsApp</span>
        </a>
      )}
      {telephone && (
        <a
          href={telHrefIntl(telephone)}
          aria-label={`${strings.callAria} ${entreprise}`}
          className="flex flex-1 items-center justify-center gap-3 bg-[var(--px-gold)] py-4 text-[var(--px-void)] transition-opacity hover:opacity-90"
        >
          <Phone className="size-5" strokeWidth={2.4} />
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em]">
            {strings.callAria}
          </span>
          <span className="text-lg font-bold tabular-nums tracking-tight">
            <span className="text-[0.72em] font-semibold opacity-55">{telIndicatif()}</span> {telephone}
          </span>
        </a>
      )}
    </div>
  );
}
