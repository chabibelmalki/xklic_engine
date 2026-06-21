import { Loader2 } from "lucide-react";
import type { UIStrings } from "@/i18n/ui";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";
import { cn } from "@/lib/utils";

const labelClass = "block text-sm font-medium text-ink-soft";
const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

interface QuoteFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  error: string | null;
  form: UIStrings["form"];
  confidentialiteHref: string;
  /** Libellé du bouton d'envoi. */
  submitLabel: React.ReactNode;
  /** Préfixe des id de champs, unique entre instances. */
  idPrefix: string;
  /** Clé publique Cloudflare Turnstile : affiche l'anti-robot si présente. */
  turnstileSiteKey?: string;
}

/**
 * Champs de demande de devis / commande (coordonnées + consentement + envoi).
 *
 * Partagé par Boutique et ServiceQuoteBuilder : c'est l'« étape 2 » du parcours,
 * affichée dans le même bloc une fois la sélection validée — plus de panier qui
 * grandit au-dessus, donc le bouton d'envoi reste accessible.
 */
export function QuoteForm({
  onSubmit,
  submitting,
  error,
  form,
  confidentialiteHref,
  submitLabel,
  idPrefix,
  turnstileSiteKey,
}: QuoteFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <div className="sr-only" aria-hidden>
        <input tabIndex={-1} autoComplete="off" name="company" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-name`} className={labelClass}>
          {form.nameLabel} *
        </label>
        <input id={`${idPrefix}-name`} name="name" className={inputClass} placeholder={form.namePlaceholder} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-phone`} className={labelClass}>
          {form.phoneLabel} *
        </label>
        <input id={`${idPrefix}-phone`} name="phone" type="tel" className={inputClass} placeholder={form.phonePlaceholder} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-email`} className={labelClass}>
          {form.emailLabel}
        </label>
        <input id={`${idPrefix}-email`} name="email" type="email" className={inputClass} placeholder={form.emailPlaceholder} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-address`} className={labelClass}>
          {form.addressLabel}
        </label>
        <input id={`${idPrefix}-address`} name="address" autoComplete="street-address" className={inputClass} placeholder={form.addressPlaceholder} />
      </div>
      <div className="grid grid-cols-[7.5rem_1fr] gap-3">
        <div>
          <label htmlFor={`${idPrefix}-postal`} className={labelClass}>
            {form.postalCodeLabel}
          </label>
          <input id={`${idPrefix}-postal`} name="postalCode" inputMode="numeric" autoComplete="postal-code" className={inputClass} placeholder={form.postalCodePlaceholder} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-city`} className={labelClass}>
            {form.cityLabel}
          </label>
          <input id={`${idPrefix}-city`} name="city" autoComplete="address-level2" className={inputClass} placeholder={form.communePlaceholder} />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-message`} className={labelClass}>
          {form.precisionsLabel}
        </label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          rows={3}
          className={cn(inputClass, "resize-y")}
          placeholder={form.precisionsPlaceholder}
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted">
        <input
          type="checkbox"
          name="consent"
          className="mt-0.5 size-4 rounded border-border text-brand-600 focus:ring-brand-500"
        />
        <span>
          {form.consentBefore}
          {form.consentMiddle}
          <a href={confidentialiteHref} className="font-medium text-brand-700 hover:underline">
            {form.consentLink}
          </a>
          . *
        </span>
      </label>

      {/* Anti-robot : le widget injecte un champ caché `cf-turnstile-response`
          dans ce <form>, lu via FormData par le handler du bloc parent. */}
      <Turnstile siteKey={turnstileSiteKey} className="pt-1" />

      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="h-auto min-h-14 w-full whitespace-normal py-3 text-center leading-tight"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" /> {form.sending}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
