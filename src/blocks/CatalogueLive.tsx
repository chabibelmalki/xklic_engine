"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CreditCard,
} from "lucide-react";
import type { CatalogueContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section, toneForIndex } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";
import { cn, formatEUR } from "@/lib/utils";
import { resolveTurnstileSiteKey } from "@/lib/runtime";

/**
 * Catalogue — boutique en ligne LIVE. Les produits, prix et stocks viennent du
 * back-office à CHAQUE affichage (fetch client → proxy /api/shop/catalog), et le
 * paiement passe par /api/shop/checkout → session Stripe hosted du marchand.
 *
 * Distinct du bloc `boutique` (articles statiques, sortie en demande de devis) :
 * ici le client PAIE. Le prix affiché est informatif — la source de vérité reste
 * le back-office, qui recalcule tout au moment du checkout.
 */

interface ShopProduct {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price_cents: number;
  images: string[];
  stock: number;
  in_stock: boolean;
}
interface ShopCategory {
  id: string;
  name: string;
}
interface ShopDelivery {
  id: string;
  kind: string;
  label: string;
  price_cents: number;
  details: string;
}
interface ShopCatalog {
  tenant: { name: string; checkout_enabled: boolean };
  categories: ShopCategory[];
  products: ShopProduct[];
  delivery_methods: ShopDelivery[];
}

const euros = (cents: number) => formatEUR(cents / 100);

function ShopProductCard({
  product,
  qty,
  onAdd,
  onDec,
}: {
  product: ShopProduct;
  qty: number;
  onAdd: () => void;
  onDec: () => void;
}) {
  const out = !product.in_stock;
  const maxed = qty >= product.stock;
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-theme border bg-surface shadow-sm transition-all duration-300",
        out
          ? "border-border opacity-70"
          : "hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/5",
        qty > 0 ? "border-brand-500 ring-1 ring-brand-500" : "border-border hover:border-brand-200",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-6xl">
            <span aria-hidden>🛍️</span>
          </div>
        )}
        {out && (
          <span className="absolute start-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-surface shadow-sm">
            Épuisé
          </span>
        )}
        {!out && product.stock <= 3 && (
          <span className="absolute start-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-accent-contrast shadow-sm">
            Plus que {product.stock}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-display text-lg font-bold text-ink">{product.name}</h4>
        {product.description && (
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{product.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="font-display text-lg font-extrabold text-brand-700">
            {euros(product.price_cents)}
          </span>

          {out ? (
            <span className="text-sm font-medium text-muted">Indisponible</span>
          ) : qty > 0 ? (
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
              <button
                type="button"
                aria-label="Retirer un exemplaire"
                onClick={onDec}
                className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-7 text-center text-sm font-bold tabular-nums text-ink">{qty}</span>
              <button
                type="button"
                aria-label="Ajouter un exemplaire"
                onClick={onAdd}
                disabled={maxed}
                className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2 disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <Button type="button" onClick={onAdd} size="sm" variant="outline">
              <Plus className="size-4" /> Ajouter
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function CatalogueLive({
  block,
  config,
  index,
  basePath = "",
}: BlockComponentProps<CatalogueContent>) {
  const c = block.content;

  const [catalog, setCatalog] = useState<ShopCatalog | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [deliveryId, setDeliveryId] = useState<string>("");
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stepTopRef = useRef<HTMLDivElement>(null);

  const rawConf = c.confidentialiteHref ?? "/confidentialite";
  const confidentialiteHref = rawConf.startsWith("http") ? rawConf : `${basePath}${rawConf}`;
  const turnstileSiteKey = resolveTurnstileSiteKey(config);

  async function loadCatalog() {
    try {
      const res = await fetch(`/api/shop/catalog?site=${encodeURIComponent(config.slug)}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as ShopCatalog;
      setCatalog(data);
      setLoadError(false);
      // panier ↦ stock frais : on écrête les quantités devenues trop hautes
      setCart((prev) => {
        const next: Record<string, number> = {};
        for (const [id, qty] of Object.entries(prev)) {
          const p = data.products.find((x) => x.id === id);
          if (p && p.in_stock) next[id] = Math.min(qty, p.stock);
        }
        return next;
      });
      if (data.delivery_methods.length > 0) {
        setDeliveryId((cur) =>
          data.delivery_methods.some((d) => d.id === cur) ? cur : data.delivery_methods[0].id,
        );
      }
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    void loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.slug]);

  const products = catalog?.products ?? [];
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Regroupement par catégorie (catégories nommées d'abord, puis le reste).
  const groups = useMemo(() => {
    if (!catalog) return [];
    const out: { name: string | null; items: ShopProduct[] }[] = [];
    for (const cat of catalog.categories) {
      const items = products.filter((p) => p.category_id === cat.id);
      if (items.length) out.push({ name: cat.name, items });
    }
    const rest = products.filter(
      (p) => !p.category_id || !catalog.categories.some((cc) => cc.id === p.category_id),
    );
    if (rest.length) out.push({ name: out.length ? "Autres" : null, items: rest });
    return out;
  }, [catalog, products]);

  function addItem(id: string) {
    const p = byId.get(id);
    if (!p || !p.in_stock) return;
    setCart((prev) => {
      const qty = prev[id] ?? 0;
      if (qty >= p.stock) return prev;
      return { ...prev, [id]: qty + 1 };
    });
  }
  function decItem(id: string) {
    setCart((prev) => {
      const qty = (prev[id] ?? 0) - 1;
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }
  function removeLine(id: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ product: byId.get(id), qty }))
    .filter((l): l is { product: ShopProduct; qty: number } => !!l.product);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.product.price_cents * l.qty, 0);
  const delivery = catalog?.delivery_methods.find((d) => d.id === deliveryId);
  const total = subtotal + (delivery?.price_cents ?? 0);
  const checkoutEnabled = catalog?.tenant.checkout_enabled ?? false;

  if (step === 2 && lines.length === 0) setStep(1);

  useEffect(() => {
    if (step === 2) stepTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const consent = fd.get("consent") === "on";
    if (name.length < 2) return setError("Indiquez votre nom.");
    if (!email.includes("@")) return setError("Indiquez un e-mail valide (reçu de commande).");
    if (!consent) return setError("Merci d'accepter la politique de confidentialité.");
    if (String(fd.get("company") ?? "")) return; // honeypot
    const turnstileToken = String(fd.get("cf-turnstile-response") ?? "");
    if (turnstileSiteKey && !turnstileToken) return setError("Vérification anti-robot requise.");
    if (!deliveryId) return setError("Choisissez un mode de retrait/livraison.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSlug: config.slug,
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
          deliveryMethodId: deliveryId,
          customer: { name, email, phone },
          successPath: `${basePath}/merci`,
          cancelPath: `${basePath}/annulation`,
          company: String(fd.get("company") ?? ""),
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        checkout_url?: string;
        error?: string;
        code?: string;
      };
      if (!res.ok || !data.checkout_url) {
        // stock devenu insuffisant entre-temps : on rafraîchit le catalogue
        if (data.code === "out_of_stock" || data.code === "product_unavailable") {
          void loadCatalog();
        }
        throw new Error(data.error ?? "Le paiement a échoué, réessayez.");
      }
      window.location.assign(data.checkout_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le paiement a échoué, réessayez.");
      setSubmitting(false);
    }
  }

  const recapCard = (footer?: React.ReactNode) => (
    <div className="rounded-theme border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <ShoppingBag className="size-5 text-brand-600" /> Votre panier
        </h3>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
          {itemCount}
        </span>
      </div>

      {lines.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Ajoutez des articles depuis le catalogue.</p>
      ) : (
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pe-1">
          {lines.map((l) => (
            <li key={l.product.id} className="flex items-start justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="text-ink">{l.product.name}</p>
                <p className="text-xs text-muted">{euros(l.product.price_cents * l.qty)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Retirer un exemplaire"
                  onClick={() => decItem(l.product.id)}
                  className="grid size-6 place-items-center rounded-full hover:bg-surface-2"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-5 text-center text-xs font-bold tabular-nums">{l.qty}</span>
                <button
                  type="button"
                  aria-label="Ajouter un exemplaire"
                  onClick={() => addItem(l.product.id)}
                  className="grid size-6 place-items-center rounded-full hover:bg-surface-2"
                >
                  <Plus className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Retirer du panier"
                  onClick={() => removeLine(l.product.id)}
                  className="ms-1 grid size-6 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {lines.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Sous-total</span>
            <span>{euros(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>{delivery?.label ?? "Livraison"}</span>
            <span>{delivery && delivery.price_cents > 0 ? euros(delivery.price_cents) : "Gratuit"}</span>
          </div>
          <div className="flex justify-between font-display text-base font-extrabold text-ink">
            <span>Total</span>
            <span>{euros(total)}</span>
          </div>
        </div>
      )}

      {footer}
    </div>
  );

  return (
    <Section id="catalogue" tone={toneForIndex(index)}>
      {(c.titre || c.intro || c.eyebrow) && (
        <Reveal>
          <SectionHeading eyebrow={c.eyebrow} title={c.titre ?? "Notre boutique"} intro={c.intro} />
        </Reveal>
      )}

      {/* Barre panier épinglée (mobile) */}
      {step === 1 && lines.length > 0 && (
        <button
          type="button"
          onClick={() => setStep(2)}
          aria-label="Passer commande"
          className="fixed bottom-5 start-4 end-[5.5rem] z-40 flex items-center justify-between gap-3 rounded-full bg-brand-600 px-5 py-3 text-brand-contrast shadow-xl transition-transform active:scale-95 sm:end-[6rem] lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-6 place-items-center rounded-full bg-white/20 text-xs font-bold tabular-nums">
              {itemCount}
            </span>
            {itemCount > 1 ? "articles" : "article"}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-bold">
            {euros(total)}
            <ArrowRight className="size-4" />
          </span>
        </button>
      )}

      {loadError ? (
        <p className="mt-10 rounded-theme border border-border bg-surface p-6 text-center text-sm text-muted">
          La boutique est momentanément indisponible. Réessayez dans quelques instants.
        </p>
      ) : !catalog ? (
        <div className="mt-10 grid place-items-center p-10 text-muted">
          <Loader2 className="size-6 animate-spin" aria-label="Chargement du catalogue" />
        </div>
      ) : products.length === 0 ? (
        <p className="mt-10 rounded-theme border border-border bg-surface p-6 text-center text-sm text-muted">
          {c.emptyMessage ?? "La boutique ouvre bientôt — repassez nous voir !"}
        </p>
      ) : step === 1 ? (
        /* Étape 1 — catalogue live + panier */
        <div className="mt-10 grid gap-8 pb-20 lg:grid-cols-[1fr_360px] lg:pb-0">
          <div className="space-y-10">
            {groups.map((group, gi) => (
              <div key={gi}>
                {group.name && (
                  <Reveal>
                    <div className="mb-5 border-s-2 border-brand-200 ps-4">
                      <h3 className="font-display text-xl font-bold text-ink">{group.name}</h3>
                    </div>
                  </Reveal>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  {group.items.map((p, pi) => (
                    <Reveal key={p.id} delay={(pi % 2) * 0.05}>
                      <ShopProductCard
                        product={p}
                        qty={cart[p.id] ?? 0}
                        onAdd={() => addItem(p.id)}
                        onDec={() => decItem(p.id)}
                      />
                    </Reveal>
                  ))}
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

          <div className="lg:sticky lg:top-24 lg:self-start">
            {recapCard(
              lines.length > 0 && (
                <div className="mt-5 space-y-3">
                  {!checkoutEnabled ? (
                    <p className="rounded-xl bg-surface-2 px-4 py-2.5 text-xs text-muted">
                      Le paiement en ligne arrive bientôt pour cette boutique.
                    </p>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      size="lg"
                      className="h-auto min-h-14 w-full whitespace-normal py-3 text-center leading-tight"
                    >
                      Passer commande
                      <ArrowRight className="size-5" />
                    </Button>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        /* Étape 2 — livraison + coordonnées + paiement */
        <div ref={stepTopRef} className="mt-10 scroll-mt-24">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="size-4" /> Modifier mon panier
          </button>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="lg:order-1">
              <div className="rounded-theme border border-border bg-surface p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 font-display text-lg font-bold text-ink">
                  Retrait ou livraison
                </h3>
                <div className="space-y-2.5">
                  {catalog.delivery_methods.map((d) => (
                    <label
                      key={d.id}
                      className={cn(
                        "flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3.5 text-sm transition-colors",
                        deliveryId === d.id
                          ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500"
                          : "border-border hover:border-brand-200",
                      )}
                    >
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryId === d.id}
                          onChange={() => setDeliveryId(d.id)}
                          className="mt-0.5 size-4 text-brand-600 focus:ring-brand-500"
                        />
                        <span>
                          <span className="font-semibold text-ink">{d.label}</span>
                          {d.details && <span className="block text-xs text-muted">{d.details}</span>}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-ink">
                        {d.price_cents > 0 ? euros(d.price_cents) : "Gratuit"}
                      </span>
                    </label>
                  ))}
                </div>

                <h3 className="mb-4 mt-8 font-display text-lg font-bold text-ink">Vos coordonnées</h3>
                <form onSubmit={submit} noValidate className="space-y-3">
                  <div className="sr-only" aria-hidden>
                    <input tabIndex={-1} autoComplete="off" name="company" />
                  </div>
                  <div>
                    <label htmlFor="shop-name" className="block text-sm font-medium text-ink-soft">
                      Nom et prénom *
                    </label>
                    <input
                      id="shop-name"
                      name="name"
                      autoComplete="name"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="shop-email" className="block text-sm font-medium text-ink-soft">
                      E-mail (reçu de commande) *
                    </label>
                    <input
                      id="shop-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="shop-phone" className="block text-sm font-medium text-ink-soft">
                      Téléphone
                    </label>
                    <input
                      id="shop-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      name="consent"
                      className="mt-0.5 size-4 rounded border-border text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                      J'accepte que mes coordonnées soient utilisées pour traiter ma commande —{" "}
                      <a
                        href={confidentialiteHref}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        politique de confidentialité
                      </a>
                      . *
                    </span>
                  </label>

                  <Turnstile siteKey={turnstileSiteKey} className="pt-1" />

                  {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="h-auto min-h-14 w-full whitespace-normal py-3 text-center leading-tight"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" /> Redirection vers le paiement…
                      </>
                    ) : (
                      <>
                        <CreditCard className="size-5" />
                        {c.submitLabel ?? "Payer ma commande"} — {euros(total)}
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted">
                    Paiement sécurisé par Stripe. Vous allez être redirigé.
                  </p>
                </form>
              </div>
            </div>

            <div className="lg:order-2 lg:sticky lg:top-24 lg:self-start">{recapCard()}</div>
          </div>
        </div>
      )}
    </Section>
  );
}
