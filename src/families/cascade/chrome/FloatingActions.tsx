import { Phone, MessageCircle } from "lucide-react";
import { telHref, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";

/**
 * Boutons flottants cascade (mobile/tablette) : une PILULE flottante détachée du
 * bas d'écran, ombre douce, appel en dégradé bleu→vert. Masqués en desktop.
 * Props identiques à `FloatingActions`.
 */
export function CascadeFloatingActions({
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
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="flex items-stretch gap-1 overflow-hidden rounded-full border border-white/50 bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] p-1 shadow-[0_18px_40px_-14px_rgba(3,20,40,0.5)] backdrop-blur-md">
        {whatsapp && (
          <a
            href={`${waHref(whatsapp)}?text=${encodeURIComponent(strings.whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${strings.whatsappAria} ${entreprise}`}
            className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-brand-50"
          >
            <MessageCircle className="size-5 text-brand-600" />
            WhatsApp
          </a>
        )}
        {telephone && (
          <a
            href={telHref(telephone)}
            aria-label={`${strings.callAria} ${entreprise}`}
            className="flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(120deg, var(--brand-600), var(--accent-600))" }}
          >
            <Phone className="size-5" />
            {strings.callAria}
          </a>
        )}
      </div>
    </div>
  );
}
