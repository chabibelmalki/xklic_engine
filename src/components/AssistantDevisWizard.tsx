"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  UserRound,
} from "lucide-react";
import { cn, telHref, waHref } from "@/lib/utils";
import { getSessionId } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";

/**
 * Assistant de demande de devis MULTI-ÉTAPES (client). Trois étapes — bâtiment,
 * besoins (prestations cochées), coordonnées — puis envoi direct via
 * /api/contact (mode "devis"). Toutes les réponses sont empaquetées dans le lead
 * (service = prestations cochées, message = récap structuré). Aucune donnée prix.
 * Anti-spam : honeypot + Turnstile optionnel. 100 % tokens (suit palette + pack).
 */

const URGENCES = ["Dès que possible", "Sous quelques semaines", "Je me renseigne"] as const;

const labelCls = "block text-sm font-semibold text-ink-soft";
const fieldCls =
  "mt-1.5 w-full min-w-0 rounded-[var(--radius-btn)] border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-2 focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function AssistantDevisWizard({
  site,
  siteSlug,
  buildingTypes = [],
  services,
  villes = [],
  confidentialiteHref,
  submitLabel = "Envoyer ma demande",
  turnstileSiteKey,
  telephone,
  whatsapp,
}: {
  site: string;
  siteSlug?: string;
  buildingTypes?: string[];
  services: string[];
  villes?: string[];
  confidentialiteHref?: string;
  submitLabel?: string;
  turnstileSiteKey?: string;
  telephone?: string;
  whatsapp?: string;
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  // Champs.
  const [batiment, setBatiment] = useState("");
  const [ville, setVille] = useState("");
  const [surface, setSurface] = useState("");
  const [adresse, setAdresse] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [urgence, setUrgence] = useState<string>("");
  const [precisions, setPrecisions] = useState("");
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot

  const steps = [
    { title: "Votre bâtiment", icon: Building2 },
    { title: "Vos besoins", icon: ClipboardList },
    { title: "Vos coordonnées", icon: UserRound },
  ];

  const toggle = (svc: string) =>
    setChosen((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]));

  function validate(): boolean {
    setError(null);
    if (step === 0) {
      if (!batiment || !ville) {
        setError("Indiquez le type de bâtiment et la commune.");
        return false;
      }
    }
    if (step === 1) {
      if (chosen.length === 0) {
        setError("Sélectionnez au moins une prestation.");
        return false;
      }
    }
    if (step === 2) {
      if (nom.trim().length < 2 || !/^[0-9+\s().-]{8,20}$/.test(tel)) {
        setError("Votre nom et un téléphone valide sont requis.");
        return false;
      }
      if (!consent) {
        setError("Merci d'accepter la politique de confidentialité.");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (validate()) setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function prev() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!validate()) return;
    if (turnstileSiteKey && !turnstileToken) {
      setError("Merci de valider l'anti-robot.");
      return;
    }
    setSending(true);
    setError(null);
    const message = [
      `Type de bâtiment : ${batiment}`,
      surface ? `Surface approximative : ${surface} m²` : null,
      adresse ? `Adresse : ${adresse}` : null,
      urgence ? `Délai : ${urgence}` : null,
      `Prestations souhaitées : ${chosen.join(", ")}`,
      precisions ? `\nPrécisions :\n${precisions}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "devis",
          name: nom,
          phone: tel,
          email: email || undefined,
          service: chosen.join(", "),
          city: ville,
          address: adresse || undefined,
          zone: [adresse, ville].filter(Boolean).join(", ") || undefined,
          date: urgence || undefined,
          message,
          consent: true,
          company: company || undefined,
          site,
          siteSlug,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          session: getSessionId() || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Une erreur est survenue, réessayez.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue, réessayez.");
      window.turnstile?.reset();
      setTurnstileToken("");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius-card)] border border-brand-200 bg-brand-50/60 p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-brand-contrast">
          <CheckCircle2 className="size-8" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-ink">Demande envoyée !</h3>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Merci, nous avons bien reçu votre demande de devis. Nous revenons vers vous rapidement.
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

  const Current = steps[step].icon;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
      {/* Barre de progression. */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <span
            key={s.title}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-[linear-gradient(90deg,var(--brand-500),var(--accent-500))]" : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Étape {step + 1} sur {steps.length}
      </p>
      <h3 className="mt-1 flex items-center gap-2.5 font-display text-2xl font-bold text-ink">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Current className="size-5" />
        </span>
        {steps[step].title}
      </h3>

      {/* Honeypot. */}
      <div className="sr-only" aria-hidden>
        <label>
          Ne pas remplir
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
      </div>

      <div className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <div>
              <label htmlFor="ad-bat" className={labelCls}>Type de bâtiment *</label>
              <select id="ad-bat" className={fieldCls} value={batiment} onChange={(e) => setBatiment(e.target.value)}>
                <option value="">Sélectionner…</option>
                {buildingTypes.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="ad-ville" className={labelCls}>Commune *</label>
                <select id="ad-ville" className={fieldCls} value={ville} onChange={(e) => setVille(e.target.value)}>
                  <option value="">Sélectionner…</option>
                  {villes.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                  <option value="Autre commune du Nord">Autre commune du Nord</option>
                </select>
              </div>
              <div>
                <label htmlFor="ad-surface" className={labelCls}>Surface approx. (m²)</label>
                <input id="ad-surface" inputMode="numeric" className={fieldCls} placeholder="Ex : 120" value={surface} onChange={(e) => setSurface(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="ad-adr" className={labelCls}>Adresse (facultatif)</label>
              <input id="ad-adr" className={fieldCls} placeholder="N° et rue" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <span className={labelCls}>Prestations souhaitées *</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {services.map((svc) => {
                  const active = chosen.includes(svc);
                  return (
                    <button
                      type="button"
                      key={svc}
                      onClick={() => toggle(svc)}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-btn)] border px-4 py-3 text-left text-sm font-medium transition-colors",
                        active ? "border-brand-500 bg-brand-50 text-brand-800" : "border-border bg-surface text-ink-soft hover:border-brand-300",
                      )}
                    >
                      <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", active ? "border-brand-600 bg-brand-600 text-white" : "border-border")}>
                        {active && <CheckCircle2 className="size-4" />}
                      </span>
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <span className={labelCls}>Délai souhaité</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {URGENCES.map((u) => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => setUrgence(u)}
                    aria-pressed={urgence === u}
                    className={cn(
                      "rounded-[var(--radius-btn)] border px-4 py-2.5 text-sm font-medium transition-colors",
                      urgence === u ? "border-brand-500 bg-brand-50 text-brand-800" : "border-border text-ink-soft hover:border-brand-300",
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="ad-prec" className={labelCls}>Précisions (facultatif)</label>
              <textarea id="ad-prec" rows={3} className={cn(fieldCls, "resize-y")} placeholder="État des lieux, contraintes d'accès, étage…" value={precisions} onChange={(e) => setPrecisions(e.target.value)} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="ad-nom" className={labelCls}>Nom / société *</label>
                <input id="ad-nom" className={fieldCls} placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div>
                <label htmlFor="ad-tel" className={labelCls}>Téléphone *</label>
                <input id="ad-tel" type="tel" className={fieldCls} placeholder="07 XX XX XX XX" value={tel} onChange={(e) => setTel(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="ad-mail" className={labelCls}>E-mail (facultatif)</label>
              <input id="ad-mail" type="email" className={fieldCls} placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <label className="flex items-start gap-3 text-sm text-muted">
              <input type="checkbox" className="mt-1 size-4 rounded border-border text-brand-600 focus:ring-brand-500" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                J'accepte que mes informations soient utilisées pour traiter ma demande
                {confidentialiteHref ? (
                  <>
                    {" "}(voir la{" "}
                    <a href={confidentialiteHref} className="font-medium text-brand-700 hover:underline">politique de confidentialité</a>)
                  </>
                ) : null}
                . *
              </span>
            </label>
            <Turnstile siteKey={turnstileSiteKey} onVerify={setTurnstileToken} />
          </>
        )}
      </div>

      {error && <p className="mt-4 rounded-[var(--radius-btn)] bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        {step > 0 && (
          <Button type="button" variant="outline" size="lg" onClick={prev} className="sm:w-auto">
            <ArrowLeft className="size-4" /> Retour
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button type="button" size="lg" onClick={next} className="sm:ms-auto">
            Suivant <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={submit} disabled={sending} className="sm:ms-auto">
            {sending ? (
              <><Loader2 className="size-5 animate-spin" /> Envoi…</>
            ) : (
              <><Send className="size-4" /> {submitLabel}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
