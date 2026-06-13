"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Phone, MessageCircle } from "lucide-react";
import { contactSchema, type ContactInput, type ContactMode } from "@/lib/contact-schema";
import type { UIStrings } from "@/i18n/ui";
import { cn, telHref, waHref } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const labelClass = "block text-sm font-medium text-ink-soft";
const inputClass =
  "mt-1.5 w-full min-w-0 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100";
const errorClass = "mt-1 text-xs font-medium text-red-500";

export interface ContactFormProps {
  mode?: ContactMode;
  /** Nom de l'entreprise (affiché côté lead). */
  site: string;
  /** Slug du site (routage destinataire/webhook côté serveur). */
  siteSlug?: string;
  services?: string[];
  villes?: string[];
  telephone?: string;
  whatsapp?: string;
  confidentialiteHref?: string;
  /** Clé publique Cloudflare Turnstile (active l'anti-robot si présente). */
  turnstileSiteKey?: string;
  submitLabel?: string;
  className?: string;
  /** Libellés d'UI de la langue active (résolus côté serveur). */
  strings: UIStrings["form"];
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export function ContactForm({
  mode = "simple",
  site,
  siteSlug,
  services,
  villes,
  telephone,
  whatsapp,
  confidentialiteHref,
  turnstileSiteKey,
  submitLabel,
  className,
  strings: s,
}: ContactFormProps) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const tsRef = useRef<HTMLDivElement>(null);

  const showEmail = mode === "simple" || mode === "contact" || mode === "devis";
  const showPhone = mode !== "simple";
  const showService = (mode === "demande-intervention" || mode === "devis") && !!services?.length;
  const showCity = mode === "devis" && !!villes?.length;
  const showZone = mode === "demande-intervention";
  const showDate = mode === "demande-intervention";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { mode, consent: false, site, siteSlug },
  });

  // Charge et monte le widget Turnstile si une clé publique est fournie.
  useEffect(() => {
    if (!turnstileSiteKey || !tsRef.current) return;
    const SCRIPT_ID = "cf-turnstile-script";
    function mount() {
      if (!window.turnstile || !tsRef.current || tsRef.current.childElementCount) return;
      window.turnstile.render(tsRef.current, {
        sitekey: turnstileSiteKey,
        callback: (t: string) => setTurnstileToken(t),
        "error-callback": () => setTurnstileToken(""),
        "expired-callback": () => setTurnstileToken(""),
      });
    }
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      s.onload = mount;
      document.head.appendChild(s);
    } else {
      mount();
    }
  }, [turnstileSiteKey]);

  async function onSubmit(values: ContactInput) {
    setServerError(null);
    if (turnstileSiteKey && !turnstileToken) {
      setServerError(s.antirobot);
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? s.genericError);
      }
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : s.genericError);
      window.turnstile?.reset();
      setTurnstileToken("");
    }
  }

  if (done) {
    return (
      <div className={cn("rounded-theme border border-brand-200 bg-brand-50/60 p-8 text-center sm:p-12", className)}>
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-brand-contrast">
          <CheckCircle2 className="size-8" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-ink">{s.successTitle}</h3>
        <p className="mx-auto mt-2 max-w-md text-muted">{s.successBody}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {telephone && (
            <Button href={telHref(telephone)} variant="outline">
              <Phone className="size-4" /> {telephone}
            </Button>
          )}
          {whatsapp && (
            <Button href={waHref(whatsapp)} variant="whatsapp">
              <MessageCircle className="size-4" /> {s.whatsapp}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const defaultSubmit =
    mode === "devis"
      ? s.submitDevis
      : mode === "demande-intervention"
        ? s.submitIntervention
        : s.submitMessage;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("rounded-theme border border-border bg-surface p-6 shadow-sm sm:p-8", className)}
    >
      <input type="hidden" {...register("mode")} value={mode} />
      <input type="hidden" {...register("site")} value={site} />
      {siteSlug && <input type="hidden" {...register("siteSlug")} value={siteSlug} />}

      {/* Honeypot anti-spam — `sr-only` : invisible aux humains, présent pour les
          bots, et SANS décalage négatif (un `left:-9999px` provoquait un
          débordement horizontal de la page sur mobile, poussant les boutons
          flottants hors écran). */}
      <div className="sr-only" aria-hidden>
        <label>
          {s.doNotFill}
          <input tabIndex={-1} autoComplete="off" {...register("company")} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 [&>div]:min-w-0 sm:grid-cols-2">
        <div className={showPhone ? "" : "sm:col-span-2"}>
          <label htmlFor="cf-name" className={labelClass}>
            {s.nameLabel} *
          </label>
          <input id="cf-name" className={inputClass} placeholder={s.namePlaceholder} {...register("name")} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        {showPhone && (
          <div>
            <label htmlFor="cf-phone" className={labelClass}>
              {s.phoneLabel} {mode === "demande-intervention" || mode === "devis" ? "*" : ""}
            </label>
            <input
              id="cf-phone"
              type="tel"
              className={inputClass}
              placeholder={s.phonePlaceholder}
              {...register("phone")}
            />
            {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
          </div>
        )}

        {showEmail && (
          <div className={showPhone ? "" : "sm:col-span-2"}>
            <label htmlFor="cf-email" className={labelClass}>
              {s.emailLabel} {mode === "simple" || mode === "contact" ? "*" : ""}
            </label>
            <input
              id="cf-email"
              type="email"
              className={inputClass}
              placeholder={s.emailPlaceholder}
              {...register("email")}
            />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>
        )}

        {showCity && (
          <div>
            <label htmlFor="cf-city" className={labelClass}>
              {s.cityLabel}
            </label>
            <select id="cf-city" className={inputClass} defaultValue="" {...register("city")}>
              <option value="">{s.cityPlaceholder}</option>
              {villes!.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Autre commune">{s.otherCity}</option>
            </select>
          </div>
        )}

        {showService && (
          <div className="sm:col-span-2">
            <label htmlFor="cf-service" className={labelClass}>
              {s.serviceLabel}
            </label>
            <select id="cf-service" className={inputClass} defaultValue="" {...register("service")}>
              <option value="">{s.servicePlaceholder}</option>
              {services!.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {showZone && (
          <div className="sm:col-span-2">
            <label htmlFor="cf-zone" className={labelClass}>
              {s.zoneLabel}
            </label>
            <input
              id="cf-zone"
              className={inputClass}
              placeholder={s.zonePlaceholder}
              {...register("zone")}
            />
          </div>
        )}

        {showDate && (
          <div className="sm:col-span-2">
            <label htmlFor="cf-date" className={labelClass}>
              {s.dateLabel}
            </label>
            <input id="cf-date" type="date" className={inputClass} {...register("date")} />
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="cf-message" className={labelClass}>
            {mode === "simple" || mode === "contact" ? s.messageLabel : s.messageLabelNeed}
          </label>
          <textarea
            id="cf-message"
            rows={4}
            className={cn(inputClass, "resize-y")}
            placeholder={
              mode === "simple" || mode === "contact"
                ? s.messagePlaceholder
                : s.messagePlaceholderNeed
            }
            {...register("message")}
          />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <input
          id="cf-consent"
          type="checkbox"
          className="mt-1 size-4 rounded border-border text-brand-600 focus:ring-brand-500"
          {...register("consent")}
        />
        <label htmlFor="cf-consent" className="text-sm text-muted">
          {s.consentBefore}
          {confidentialiteHref ? (
            <>
              {s.consentMiddle}
              <a href={confidentialiteHref} className="font-medium text-brand-700 hover:underline">
                {s.consentLink}
              </a>
            </>
          ) : null}
          . *
        </label>
      </div>
      {errors.consent && <p className={errorClass}>{errors.consent.message}</p>}

      {turnstileSiteKey && <div ref={tsRef} className="mt-4" />}

      {serverError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="mt-6 h-auto min-h-14 w-full whitespace-normal py-3 text-center leading-tight"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-5 animate-spin" /> {s.sending}
          </>
        ) : (
          submitLabel ?? defaultSubmit
        )}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-2">{s.quickReply}</p>
    </form>
  );
}
