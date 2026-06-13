"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Phone, MessageCircle } from "lucide-react";
import { leadSchema, type LeadInput } from "@/lib/lead-schema";
import { cn, telHref, waHref } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const labelClass = "block text-sm font-medium text-ink-soft";
const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100";
const errorClass = "mt-1 text-xs font-medium text-red-500";

/**
 * Formulaire de devis / contact OPÉRATIONNEL. POST /api/devis (envoi e-mail via
 * Resend si configuré, sinon log serveur — le parcours marche sans config).
 * honeypot anti-spam, consentement RGPD, états succès/erreur.
 */
export function LeadForm({
  type = "devis",
  site,
  siteSlug,
  services,
  villes,
  telephone,
  whatsapp,
  confidentialiteHref,
}: {
  type?: "devis" | "contact";
  site: string;
  /** Slug du site : achemine le lead vers le destinataire `config.forms.to`. */
  siteSlug?: string;
  services?: string[];
  villes?: string[];
  telephone?: string;
  whatsapp?: string;
  confidentialiteHref?: string;
}) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { type, consent: false, site, siteSlug },
  });

  async function onSubmit(values: LeadInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Une erreur est survenue.");
      }
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  if (done) {
    return (
      <div className="rounded-theme border border-brand-200 bg-brand-50/60 p-8 text-center sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-brand-contrast">
          <CheckCircle2 className="size-8" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-ink">Message envoyé !</h3>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Merci, votre demande a bien été transmise. Nous vous recontactons rapidement. Pour une
          réponse immédiate, appelez-nous ou écrivez sur WhatsApp.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {telephone && (
            <Button href={telHref(telephone)} variant="outline">
              <Phone className="size-4" /> {telephone}
            </Button>
          )}
          {whatsapp && (
            <Button href={waHref(whatsapp)} variant="whatsapp">
              <MessageCircle className="size-4" /> WhatsApp
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-theme border border-border bg-surface p-6 shadow-sm sm:p-8"
    >
      <input type="hidden" {...register("type")} value={type} />
      <input type="hidden" {...register("site")} value={site} />
      {siteSlug && <input type="hidden" {...register("siteSlug")} value={siteSlug} />}

      {/* Honeypot anti-spam */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label>
          Ne pas remplir
          <input tabIndex={-1} autoComplete="off" {...register("company")} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-name" className={labelClass}>
            Nom complet *
          </label>
          <input id="lf-name" className={inputClass} placeholder="Prénom Nom" {...register("name")} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="lf-phone" className={labelClass}>
            Téléphone *
          </label>
          <input
            id="lf-phone"
            type="tel"
            className={inputClass}
            placeholder="06 12 34 56 78"
            {...register("phone")}
          />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="lf-email" className={labelClass}>
            E-mail
          </label>
          <input
            id="lf-email"
            type="email"
            className={inputClass}
            placeholder="vous@exemple.fr"
            {...register("email")}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="lf-city" className={labelClass}>
            Ville
          </label>
          {villes?.length ? (
            <select id="lf-city" className={inputClass} defaultValue="" {...register("city")}>
              <option value="">Choisir votre ville…</option>
              {villes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Autre commune">Autre commune</option>
            </select>
          ) : (
            <input id="lf-city" className={inputClass} placeholder="Votre ville" {...register("city")} />
          )}
        </div>

        {type === "devis" && services?.length ? (
          <div className="sm:col-span-2">
            <label htmlFor="lf-service" className={labelClass}>
              Prestation souhaitée
            </label>
            <select id="lf-service" className={inputClass} defaultValue="" {...register("service")}>
              <option value="">Choisir…</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="sm:col-span-2">
          <label htmlFor="lf-message" className={labelClass}>
            {type === "devis" ? "Détails de votre besoin" : "Votre message"}
          </label>
          <textarea
            id="lf-message"
            rows={4}
            className={cn(inputClass, "resize-y")}
            placeholder={
              type === "devis" ? "Surface, fréquence, type de besoin…" : "Votre message…"
            }
            {...register("message")}
          />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <input
          id="lf-consent"
          type="checkbox"
          className="mt-1 size-4 rounded border-border text-brand-600 focus:ring-brand-500"
          {...register("consent")}
        />
        <label htmlFor="lf-consent" className="text-sm text-muted">
          J&apos;accepte que mes informations soient utilisées pour traiter ma demande
          {confidentialiteHref ? (
            <>
              , conformément à la{" "}
              <a href={confidentialiteHref} className="font-medium text-brand-700 hover:underline">
                politique de confidentialité
              </a>
            </>
          ) : null}
          . *
        </label>
      </div>
      {errors.consent && <p className={errorClass}>{errors.consent.message}</p>}

      {serverError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-6 w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="size-5 animate-spin" /> Envoi…
          </>
        ) : type === "devis" ? (
          "Envoyer ma demande de devis"
        ) : (
          "Envoyer le message"
        )}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-2">
        Réponse rapide · Gratuit et sans engagement
      </p>
    </form>
  );
}
