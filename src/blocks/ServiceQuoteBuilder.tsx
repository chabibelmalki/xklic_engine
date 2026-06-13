"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Minus,
  Check,
  Trash2,
  Loader2,
  CheckCircle2,
  Phone,
  MessageCircle,
  Info,
  ArrowDown,
} from "lucide-react";
import type {
  ServiceQuoteBuilderContent,
  DevisCategorie,
  DevisPrestation,
  DevisTier,
} from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { cn, formatEUR, telHref, waHref } from "@/lib/utils";

interface SelLine {
  id: string;
  label: string;
  /** Prix facturé unitaire (€). Absent => sur devis. */
  billed?: number;
  surDevis?: boolean;
  creditEligible: boolean;
  qty: number;
}

function tierPrice(
  t: DevisTier,
  devis: UIStrings["devis"],
): { billed?: number; surDevis: boolean; text: string } {
  if (t.surDevis || t.prix == null) return { surDevis: true, text: devis.onQuote };
  return { billed: t.prix, surDevis: false, text: `${t.prefixe ? `${t.prefixe} ` : ""}${formatEUR(t.prix)}` };
}

/** Carte d'une prestation horaire (heures + matériel, état local). */
function HourlyCard({
  prestation,
  creditEligible,
  onAdd,
  devis,
}: {
  prestation: DevisPrestation;
  creditEligible: boolean;
  onAdd: (line: Omit<SelLine, "qty">) => void;
  devis: UIStrings["devis"];
}) {
  const min = prestation.heuresMin ?? 1;
  const max = prestation.heuresMax ?? 40;
  const taux = prestation.tauxHoraire ?? 0;
  const supp = prestation.supplementMateriel ?? 0;
  const [hours, setHours] = useState(prestation.heuresDefaut ?? Math.max(min, 2));
  const [material, setMaterial] = useState(false);
  const [added, setAdded] = useState(false);

  const unit = taux + (material ? supp : 0);
  const total = unit * hours;

  function add() {
    onAdd({
      id: `${prestation.nom}-${hours}-${material ? "mat" : "std"}`,
      label: `${prestation.nom} — ${hours} h${material ? " (matériel fourni)" : ""}`,
      billed: total,
      surDevis: false,
      creditEligible,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display font-bold text-ink">{prestation.nom}</p>
        <span className="rounded-full bg-surface px-3 py-1 text-sm font-bold text-brand-700 shadow-sm">
          {formatEUR(unit)}/h
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span className="text-sm text-muted">{devis.hours}</span>
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
          <button
            type="button"
            aria-label={devis.minusHour}
            onClick={() => setHours((h) => Math.max(min, h - 1))}
            className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-sm font-bold tabular-nums text-ink">{hours}</span>
          <button
            type="button"
            aria-label={devis.plusHour}
            onClick={() => setHours((h) => Math.min(max, h + 1))}
            className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <span className="ms-auto font-display text-lg font-extrabold text-ink">
          {formatEUR(total)}
        </span>
      </div>

      {supp > 0 && (
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={material}
            onChange={(e) => setMaterial(e.target.checked)}
            className="size-4 rounded border-border text-brand-600 focus:ring-brand-500"
          />
          {prestation.supplementMaterielLabel ?? `Matériel fourni (+${formatEUR(supp)}/h)`}
        </label>
      )}

      <Button type="button" onClick={add} size="sm" variant={added ? "primary" : "outline"} className="mt-4 w-full">
        {added ? (
          <>
            <Check className="size-4" /> {devis.added}
          </>
        ) : (
          <>
            <Plus className="size-4" /> {devis.add}
          </>
        )}
      </Button>
    </div>
  );
}

/** Bouton d'ajout d'un tier. */
function TierRow({
  prestation,
  tier,
  creditEligible,
  onAdd,
  devis,
}: {
  prestation: DevisPrestation;
  tier: DevisTier;
  creditEligible: boolean;
  onAdd: (line: Omit<SelLine, "qty">) => void;
  devis: UIStrings["devis"];
}) {
  const [added, setAdded] = useState(false);
  const p = tierPrice(tier, devis);

  function add() {
    onAdd({
      id: `${prestation.nom}-${tier.label}`,
      label: `${prestation.nom} — ${tier.label}`,
      billed: p.billed,
      surDevis: p.surDevis,
      creditEligible,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{tier.label}</p>
        <p className="text-xs text-muted">{p.text}</p>
      </div>
      <button
        type="button"
        onClick={add}
        aria-label={`${devis.add} ${prestation.nom} ${tier.label}`}
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full transition-colors",
          added ? "bg-brand-600 text-brand-contrast" : "bg-brand-50 text-brand-700 hover:bg-brand-100",
        )}
      >
        {added ? <Check className="size-4" /> : <Plus className="size-4" />}
      </button>
    </div>
  );
}

function CategoryCard({
  categorie,
  onAdd,
  devis,
  showCredit,
}: {
  categorie: DevisCategorie;
  onAdd: (line: Omit<SelLine, "qty">) => void;
  devis: UIStrings["devis"];
  showCredit: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {categorie.emoji && <span className="text-2xl">{categorie.emoji}</span>}
        <h3 className="font-display text-lg font-bold text-ink">{categorie.titre}</h3>
        {showCredit && (
          <span
            className={cn(
              "ms-auto rounded-full px-3 py-1 text-xs font-semibold",
              categorie.creditImpot
                ? "bg-accent-50 text-accent-600"
                : "bg-surface-2 text-muted",
            )}
          >
            {categorie.creditImpot ? devis.creditBadge : devis.notEligible}
          </span>
        )}
      </div>
      {categorie.description && <p className="mt-2 text-sm text-muted">{categorie.description}</p>}

      <div className="mt-4 space-y-4">
        {categorie.prestations.map((p, i) =>
          p.type === "horaire" ? (
            <HourlyCard
              key={i}
              prestation={p}
              creditEligible={!!categorie.creditImpot}
              onAdd={onAdd}
              devis={devis}
            />
          ) : (
            <div key={i}>
              <p className="mb-2 text-sm font-semibold text-ink-soft">{p.nom}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(p.tiers ?? []).map((t, j) => (
                  <TierRow
                    key={j}
                    prestation={p}
                    tier={t}
                    creditEligible={!!categorie.creditImpot}
                    onAdd={onAdd}
                    devis={devis}
                  />
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

const labelClass = "block text-sm font-medium text-ink-soft";
const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

/**
 * ServiceQuoteBuilder — « configurateur de devis » pour métiers de SERVICES.
 *
 * Le client assemble des prestations dans un panier, voit une estimation
 * instantanée, puis envoie sa sélection comme demande de devis (→ /api/contact,
 * mode "devis"). Deux modèles de prix par prestation, pilotés par config :
 *   • horaire  — heures +/− (+ supplément optionnel type « matériel fourni »)
 *   • paliers  — tiers « dès X € » ou « sur devis »
 * Plus une bascule remise optionnelle (ici crédit d'impôt 50 % des services à la
 * personne), à neutraliser ou détourner pour les métiers sans crédit d'impôt.
 *
 * RÉUTILISABLE bien au-delà du ménage — tout service chiffrable et assemblable :
 * aide à domicile, jardinage, soutien scolaire, déménagement, lavage auto,
 * plomberie/électricité, garagiste, toilettage, esthétique, photographe,
 * traiteur, location de matériel…
 *
 * ⚠️ Ce n'est PAS un panier e-commerce (aucun paiement) : c'est de la GÉNÉRATION
 * DE DEVIS. Les PRODUITS physiques auront leurs propres modules dédiés
 * (catalogue / panier / paiement) — d'où le nom explicite "service…".
 */
export function ServiceQuoteBuilder({
  block,
  config,
  index,
  basePath = "",
  locale,
  strings,
}: BlockComponentProps<ServiceQuoteBuilderContent>) {
  const c = block.content;
  const devis = strings.devis;
  const form = strings.form;
  const tone = toneForIndex(index);
  const showCredit = c.credit !== false;
  const creditRate = c.creditRate ?? 0.5;
  const ceiling = c.creditCeiling;

  const [withCredit, setWithCredit] = useState(showCredit);
  const [selection, setSelection] = useState<SelLine[]>([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawConf = c.confidentialiteHref ?? "/confidentialite";
  const confidentialiteHref = rawConf.startsWith("http") ? rawConf : `${basePath}${rawConf}`;

  function addLine(line: Omit<SelLine, "qty">) {
    setSelection((prev) => {
      const existing = prev.find((l) => l.id === line.id);
      if (existing) return prev.map((l) => (l.id === line.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { ...line, qty: 1 }];
    });
  }
  function setQty(id: string, delta: number) {
    setSelection((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  }
  function removeLine(id: string) {
    setSelection((prev) => prev.filter((l) => l.id !== id));
  }

  const totals = useMemo(() => {
    let billed = 0;
    let creditBase = 0;
    let hasDevis = false;
    for (const l of selection) {
      if (l.billed == null || l.surDevis) {
        hasDevis = true;
        continue;
      }
      billed += l.billed * l.qty;
      if (l.creditEligible) creditBase += l.billed * l.qty;
    }
    const credit = withCredit ? creditBase * creditRate : 0;
    return { billed, credit, net: billed - credit, hasDevis };
  }, [selection, withCredit, creditRate]);

  const overCeiling = ceiling != null && totals.credit * 12 > ceiling;
  const itemCount = selection.reduce((n, l) => n + l.qty, 0);

  function scrollToForm() {
    document.getElementById("devis-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const consent = fd.get("consent") === "on";
    if (name.length < 2) return setError("Votre nom est requis.");
    if (phone.length < 8) return setError("Un téléphone valide est requis.");
    if (!consent) return setError("Veuillez accepter pour continuer.");
    if (String(fd.get("company") ?? "")) return; // honeypot

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "devis",
          name,
          phone,
          email: String(fd.get("email") ?? ""),
          address: String(fd.get("address") ?? ""),
          postalCode: String(fd.get("postalCode") ?? ""),
          city: String(fd.get("city") ?? ""),
          message: String(fd.get("message") ?? ""),
          consent: true,
          site: config.entreprise.nom,
          siteSlug: config.slug,
          withCredit,
          estimateBilled: Math.round(totals.billed),
          estimateNet: Math.round(totals.net),
          items: selection.map((l) => ({
            label: l.label,
            price: l.billed,
            qty: l.qty,
            surDevis: l.surDevis,
          })),
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? form.genericError);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : form.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section id="devis" tone={tone}>
      {(c.titre || c.intro || c.eyebrow) && (
        <Reveal>
          <SectionHeading eyebrow={c.eyebrow} title={c.titre ?? devis.title} intro={c.intro} />
        </Reveal>
      )}

      {/* Bascule crédit d'impôt (masquée pour les configurateurs neutres) */}
      {showCredit && (
        <div className="mx-auto mt-10 flex max-w-md items-center rounded-full border border-border bg-surface p-1 shadow-sm">
          {[
            { v: false, label: c.creditLabelOff ?? devis.priceNormal },
            { v: true, label: c.creditLabelOn ?? devis.priceCredit },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => setWithCredit(opt.v)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                withCredit === opt.v ? "bg-brand-600 text-brand-contrast shadow" : "text-muted hover:text-ink",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Barre total épinglée (mobile) — compteur + total, clic = aller au formulaire.
          Laisse la place aux boutons flottants WhatsApp/appel (right-[5.5rem]). */}
      {!done && selection.length > 0 && (
        <button
          type="button"
          onClick={scrollToForm}
          aria-label={devis.goToForm}
          className="fixed bottom-5 start-4 end-[5.5rem] z-40 flex items-center justify-between gap-3 rounded-full bg-brand-600 px-5 py-3 text-brand-contrast shadow-xl transition-transform active:scale-95 sm:end-[6rem] lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-6 place-items-center rounded-full bg-white/20 text-xs font-bold tabular-nums">
              {itemCount}
            </span>
            {itemCount > 1 ? devis.articlePlural : devis.articleSingular}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-bold">
            {formatEUR(totals.net)}
            <ArrowDown className="size-4" />
          </span>
        </button>
      )}

      <div className="mt-10 grid gap-8 pb-20 lg:grid-cols-[1fr_360px] lg:pb-0">
        {/* Catalogue */}
        <div className="space-y-6">
          {c.categories.map((cat, i) => (
            <CategoryCard key={cat.id ?? i} categorie={cat} onAdd={addLine} devis={devis} showCredit={showCredit} />
          ))}
          {c.notes?.length ? (
            <ul className="space-y-1.5 text-sm text-muted">
              {c.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Récapitulatif (sticky en desktop) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {done ? (
            <div className="rounded-theme border border-brand-200 bg-brand-50/60 p-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-600 text-brand-contrast">
                <CheckCircle2 className="size-7" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">{form.quoteSuccessTitle}</h3>
              <p className="mt-2 text-sm text-muted">{form.quoteSuccessBody}</p>
              <div className="mt-5 flex flex-col gap-2.5">
                {c.telephone && (
                  <Button href={telHref(c.telephone)} variant="outline">
                    <Phone className="size-4" /> {c.telephone}
                  </Button>
                )}
                {c.whatsapp && (
                  <Button href={waHref(c.whatsapp)} variant="whatsapp">
                    <MessageCircle className="size-4" /> {form.whatsapp}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-theme border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-ink">{devis.yourSelection}</h3>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                  {itemCount}
                </span>
              </div>

              {selection.length === 0 ? (
                <p className="mt-4 text-sm text-muted">{devis.addPrompt}</p>
              ) : (
                <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pe-1">
                  {selection.map((l) => (
                    <li key={l.id} className="flex items-start justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="text-ink">{l.label}</p>
                        <p className="text-xs text-muted">
                          {l.surDevis || l.billed == null
                            ? devis.onQuote
                            : formatEUR(l.billed * l.qty)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label={devis.decrease}
                          onClick={() => setQty(l.id, -1)}
                          className="grid size-6 place-items-center rounded-full hover:bg-surface-2"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold tabular-nums">{l.qty}</span>
                        <button
                          type="button"
                          aria-label={devis.increase}
                          onClick={() => setQty(l.id, 1)}
                          className="grid size-6 place-items-center rounded-full hover:bg-surface-2"
                        >
                          <Plus className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={devis.remove}
                          onClick={() => removeLine(l.id)}
                          className="ms-1 grid size-6 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {selection.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>{devis.subtotal}</span>
                    <span className="text-ink">{formatEUR(totals.billed)}</span>
                  </div>
                  {withCredit && totals.credit > 0 && (
                    <div className="flex justify-between text-brand-700">
                      <span>{devis.taxCredit} (−{Math.round(creditRate * 100)} %)</span>
                      <span>−{formatEUR(totals.credit)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-base font-extrabold text-ink">
                    <span>{withCredit ? devis.toPay : devis.total}</span>
                    <span>{formatEUR(totals.net)}</span>
                  </div>
                  {totals.hasDevis && (
                    <p className="text-xs text-muted">{devis.quoteItemsNote}</p>
                  )}
                  {overCeiling && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-accent-50 px-2.5 py-2 text-xs text-accent-600">
                      <Info className="mt-0.5 size-3.5 shrink-0" />
                      {devis.ceilingBefore}
                      {ceiling != null ? formatEUR(ceiling) : ""}
                      {devis.ceilingAfter}
                    </p>
                  )}
                </div>
              )}

              {/* Formulaire intégré */}
              <form id="devis-form" onSubmit={submit} noValidate className="mt-5 space-y-3 border-t border-border pt-4">
                <div className="sr-only" aria-hidden>
                  <input tabIndex={-1} autoComplete="off" name="company" />
                </div>
                <div>
                  <label htmlFor="db-name" className={labelClass}>
                    {form.nameLabel} *
                  </label>
                  <input id="db-name" name="name" className={inputClass} placeholder="Prénom Nom" />
                </div>
                <div>
                  <label htmlFor="db-phone" className={labelClass}>
                    {form.phoneLabel} *
                  </label>
                  <input id="db-phone" name="phone" type="tel" className={inputClass} placeholder="06 12 34 56 78" />
                </div>
                <div>
                  <label htmlFor="db-email" className={labelClass}>
                    {form.emailLabel}
                  </label>
                  <input id="db-email" name="email" type="email" className={inputClass} placeholder="vous@exemple.fr" />
                </div>
                <div>
                  <label htmlFor="db-address" className={labelClass}>
                    {form.addressLabel}
                  </label>
                  <input id="db-address" name="address" autoComplete="street-address" className={inputClass} placeholder={form.addressPlaceholder} />
                </div>
                <div className="grid grid-cols-[7.5rem_1fr] gap-3">
                  <div>
                    <label htmlFor="db-postal" className={labelClass}>
                      {form.postalCodeLabel}
                    </label>
                    <input id="db-postal" name="postalCode" inputMode="numeric" autoComplete="postal-code" className={inputClass} placeholder={form.postalCodePlaceholder} />
                  </div>
                  <div>
                    <label htmlFor="db-city" className={labelClass}>
                      {form.cityLabel}
                    </label>
                    <input id="db-city" name="city" autoComplete="address-level2" className={inputClass} placeholder={form.communePlaceholder} />
                  </div>
                </div>
                <div>
                  <label htmlFor="db-message" className={labelClass}>
                    {form.precisionsLabel}
                  </label>
                  <textarea
                    id="db-message"
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

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
                )}

                <Button type="submit" size="lg" disabled={submitting} className="h-auto min-h-14 w-full whitespace-normal py-3 text-center leading-tight">
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" /> {form.sending}
                    </>
                  ) : (
                    c.submitLabel ?? form.requestIntervention
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
