"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Minus,
  Trash2,
  Loader2,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShoppingBag,
  ArrowDown,
} from "lucide-react";
import type { BoutiqueContent, ProduitItem, ProduitCategorie } from "@/types/config";
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
  /** Prix unitaire facturé (€). Absent => sur devis. */
  billed?: number;
  surDevis: boolean;
  qty: number;
}

/** Identifiant stable d'un article (catégorie + nom). */
function itemId(ci: number, item: ProduitItem): string {
  return `${ci}::${item.nom}`;
}

/** Carte produit : photo (ou pastille emoji), prix, et contrôle d'ajout/quantité. */
function ProductCard({
  item,
  qty,
  onAdd,
  onDec,
  devis,
}: {
  item: ProduitItem;
  qty: number;
  onAdd: () => void;
  onDec: () => void;
  devis: UIStrings["devis"];
}) {
  const billable = typeof item.prix === "number";
  const priceMain = billable ? formatEUR(item.prix as number) : (item.prix as string | undefined);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-theme border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/5",
        qty > 0 ? "border-brand-500 ring-1 ring-brand-500" : "border-border hover:border-brand-200",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {item.image ? (
          <Image
            src={item.image.url}
            alt={item.image.alt ?? item.nom}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-6xl">
            <span aria-hidden>{item.emoji ?? "🧁"}</span>
          </div>
        )}
        {item.badge && (
          <span className="absolute start-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-accent-contrast shadow-sm">
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-display text-lg font-bold text-ink">{item.nom}</h4>
        {item.description && (
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{item.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="font-display text-lg font-extrabold text-brand-700">
            {priceMain ?? devis.onQuote}
            {billable && item.unite && (
              <span className="ms-1 text-sm font-medium text-muted">{item.unite}</span>
            )}
          </span>

          {qty > 0 ? (
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
              <button
                type="button"
                aria-label={devis.decrease}
                onClick={onDec}
                className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-7 text-center text-sm font-bold tabular-nums text-ink">{qty}</span>
              <button
                type="button"
                aria-label={devis.increase}
                onClick={onAdd}
                className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2"
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <Button type="button" onClick={onAdd} size="sm" variant="outline">
              <Plus className="size-4" /> {devis.add}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

const labelClass = "block text-sm font-medium text-ink-soft";
const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

/**
 * Boutique — catalogue façon e-commerce : on ajoute des produits au panier
 * depuis leur carte (photo + prix + bouton « + »), on ajuste les quantités dans
 * « Votre sélection », puis on envoie la commande (→ /api/contact, mode "devis").
 * Pas de paiement en ligne : c'est une demande de commande/devis.
 */
export function Boutique({
  block,
  config,
  index,
  basePath = "",
  strings,
}: BlockComponentProps<BoutiqueContent>) {
  const c = block.content;
  const devis = strings.devis;
  const form = strings.form;

  const categories: ProduitCategorie[] = c.categories?.length
    ? c.categories
    : [{ items: c.items ?? [] }];

  const [selection, setSelection] = useState<SelLine[]>([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawConf = c.confidentialiteHref ?? "/confidentialite";
  const confidentialiteHref = rawConf.startsWith("http") ? rawConf : `${basePath}${rawConf}`;

  function addItem(ci: number, item: ProduitItem) {
    const id = itemId(ci, item);
    const billable = typeof item.prix === "number";
    setSelection((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
      return [
        ...prev,
        {
          id,
          label: item.nom,
          billed: billable ? (item.prix as number) : undefined,
          surDevis: !billable,
          qty: 1,
        },
      ];
    });
  }
  function decItem(id: string) {
    setSelection((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0),
    );
  }
  function removeLine(id: string) {
    setSelection((prev) => prev.filter((l) => l.id !== id));
  }
  const qtyOf = (id: string) => selection.find((l) => l.id === id)?.qty ?? 0;

  const totals = useMemo(() => {
    let billed = 0;
    let hasDevis = false;
    for (const l of selection) {
      if (l.billed == null || l.surDevis) hasDevis = true;
      else billed += l.billed * l.qty;
    }
    return { billed, hasDevis };
  }, [selection]);

  const itemCount = selection.reduce((n, l) => n + l.qty, 0);

  function scrollToForm() {
    document.getElementById("boutique-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const consent = fd.get("consent") === "on";
    if (name.length < 2) return setError(form.genericError);
    if (phone.length < 8) return setError(form.genericError);
    if (!consent) return setError(form.antirobot);
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
          city: String(fd.get("city") ?? ""),
          message: String(fd.get("message") ?? ""),
          consent: true,
          site: config.entreprise.nom,
          siteSlug: config.slug,
          estimateBilled: Math.round(totals.billed),
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
    <Section id="boutique" tone={toneForIndex(index)}>
      {(c.titre || c.intro || c.eyebrow) && (
        <Reveal>
          <SectionHeading eyebrow={c.eyebrow} title={c.titre ?? devis.title} intro={c.intro} />
        </Reveal>
      )}

      {/* Barre panier épinglée (mobile) */}
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
            {formatEUR(totals.billed)}
            <ArrowDown className="size-4" />
          </span>
        </button>
      )}

      <div className="mt-10 grid gap-8 pb-20 lg:grid-cols-[1fr_360px] lg:pb-0">
        {/* Catalogue */}
        <div className="space-y-10">
          {categories.map((cat, ci) => (
            <div key={ci}>
              {(cat.titre || cat.description) && (
                <Reveal>
                  <div className="mb-5 border-s-2 border-brand-200 ps-4">
                    {cat.titre && (
                      <h3 className="font-display text-xl font-bold text-ink">{cat.titre}</h3>
                    )}
                    {cat.description && <p className="mt-1 text-sm text-muted">{cat.description}</p>}
                  </div>
                </Reveal>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                {cat.items.map((item, ii) => {
                  const id = itemId(ci, item);
                  return (
                    <Reveal key={item.nom} delay={(ii % 2) * 0.05}>
                      <ProductCard
                        item={item}
                        qty={qtyOf(id)}
                        onAdd={() => addItem(ci, item)}
                        onDec={() => decItem(id)}
                        devis={devis}
                      />
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}
          {c.notes?.length ? (
            <ul className="space-y-1.5 text-sm text-muted">
              {c.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Panier (sticky en desktop) */}
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
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <ShoppingBag className="size-5 text-brand-600" /> {devis.yourSelection}
                </h3>
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
                          onClick={() => decItem(l.id)}
                          className="grid size-6 place-items-center rounded-full hover:bg-surface-2"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold tabular-nums">{l.qty}</span>
                        <button
                          type="button"
                          aria-label={devis.increase}
                          onClick={() => addItem(Number(l.id.split("::")[0]), { nom: l.label, prix: l.billed })}
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
                  <div className="flex justify-between font-display text-base font-extrabold text-ink">
                    <span>{devis.total}</span>
                    <span>{formatEUR(totals.billed)}</span>
                  </div>
                  {totals.hasDevis && <p className="text-xs text-muted">{devis.quoteItemsNote}</p>}
                </div>
              )}

              {/* Formulaire de commande intégré */}
              <form id="boutique-form" onSubmit={submit} noValidate className="mt-5 space-y-3 border-t border-border pt-4">
                <div className="absolute left-[-9999px]" aria-hidden>
                  <input tabIndex={-1} autoComplete="off" name="company" />
                </div>
                <div>
                  <label htmlFor="bq-name" className={labelClass}>
                    {form.nameLabel} *
                  </label>
                  <input id="bq-name" name="name" className={inputClass} placeholder={form.namePlaceholder} />
                </div>
                <div>
                  <label htmlFor="bq-phone" className={labelClass}>
                    {form.phoneLabel} *
                  </label>
                  <input id="bq-phone" name="phone" type="tel" className={inputClass} placeholder={form.phonePlaceholder} />
                </div>
                <div>
                  <label htmlFor="bq-email" className={labelClass}>
                    {form.emailLabel}
                  </label>
                  <input id="bq-email" name="email" type="email" className={inputClass} placeholder={form.emailPlaceholder} />
                </div>
                {c.villes?.length ? (
                  <div>
                    <label htmlFor="bq-city" className={labelClass}>
                      {form.cityLabel}
                    </label>
                    <select id="bq-city" name="city" className={inputClass} defaultValue="">
                      <option value="">{form.cityPlaceholder}</option>
                      {c.villes.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                      <option value={form.otherCity}>{form.otherCity}</option>
                    </select>
                  </div>
                ) : null}
                <div>
                  <label htmlFor="bq-message" className={labelClass}>
                    {form.precisionsLabel}
                  </label>
                  <textarea
                    id="bq-message"
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

                {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

                <Button type="submit" size="lg" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" /> {form.sending}
                    </>
                  ) : (
                    c.submitLabel ?? form.submitDevis
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
