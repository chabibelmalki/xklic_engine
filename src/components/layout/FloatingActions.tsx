import { Phone } from "lucide-react";
import { telHref, waHref } from "@/lib/utils";
import type { UIStrings } from "@/i18n/ui";

/**
 * Boutons flottants WhatsApp + appel (mobile/tablette). Config-driven : n'affiche
 * que ce qui est renseigné. En desktop (lg+) ces raccourcis sont inutiles — le
 * header porte déjà tél. + CTA — donc le conteneur est masqué (`lg:hidden`).
 */
export function FloatingActions({
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
  const waMessage = strings.whatsappText;

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col gap-3 sm:bottom-6 sm:end-6 lg:hidden">
      {whatsapp && (
        <a
          href={`${waHref(whatsapp)}?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${strings.whatsappAria} ${entreprise}`}
          className="group relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-700/30 transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span className="pointer-events-none absolute end-16 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {strings.discussWhatsapp}
          </span>
        </a>
      )}
      {telephone && (
        <a
          href={telHref(telephone)}
          aria-label={`${strings.callAria} ${entreprise}`}
          className="grid size-14 place-items-center rounded-full bg-brand-600 text-brand-contrast shadow-lg shadow-brand-700/30 transition-transform hover:scale-110 sm:hidden"
        >
          <Phone className="size-6" />
        </a>
      )}
    </div>
  );
}
