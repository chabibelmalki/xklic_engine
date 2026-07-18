"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { CommandeRecapContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { formatEUR } from "@/lib/utils";

/**
 * CommandeRecap — page « merci » après paiement. Stripe renvoie le client sur
 * `…/merci?session_id={CHECKOUT_SESSION_ID}` ; ce bloc lit ce paramètre et
 * charge le récapitulatif via le proxy /api/shop/order. Le statut affiché est
 * celui de la base back-office : `paid` dès que le webhook Stripe est passé
 * (généralement immédiat), sinon `pending` avec message adapté.
 */

interface OrderItem {
  name: string;
  unit_price_cents: number;
  quantity: number;
  total_cents: number;
  /** Choix du client (menus/options) — snapshot posé par le back-office. */
  selections?: { group: string; choices: { name: string; price_delta_cents: number }[] }[];
}
interface Order {
  number: number;
  status: string;
  customer_email: string;
  delivery_label: string;
  delivery_price_cents: number;
  subtotal_cents: number;
  total_cents: number;
  items: OrderItem[];
}

const euros = (cents: number) => formatEUR(cents / 100);

export function CommandeRecap({
  block,
  config,
  tone,
  basePath = "",
}: BlockComponentProps<CommandeRecapContent>) {
  const c = block.content;
  const [state, setState] = useState<"loading" | "none" | "error" | "ok">("loading");
  const [order, setOrder] = useState<Order | null>(null);

  const retourHref = `${basePath}${c.retourHref ?? "/boutique"}`;

  useEffect(() => {
    (async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");
      if (!sessionId) {
        setState("none");
        return;
      }
      // Paiement terminé (Stripe ne redirige ici qu'après succès ; une annulation
      // va sur /annulation) : on vide le panier persistant de cette boutique pour
      // ne pas le retrouver au retour. Même clé que CatalogueLive.
      try {
        localStorage.removeItem(`xklic:cart:${config.slug}`);
      } catch {
        /* localStorage indisponible : rien à vider */
      }
      try {
        const res = await fetch(
          `/api/shop/order?site=${encodeURIComponent(config.slug)}&session_id=${encodeURIComponent(sessionId)}`,
        );
        if (!res.ok) throw new Error(String(res.status));
        setOrder((await res.json()) as Order);
        setState("ok");
      } catch {
        setState("error");
      }
    })();
  }, [config.slug]);

  return (
    <Section id="commande" tone={tone}>
      <div className="mx-auto max-w-xl">
        {state === "loading" && (
          <div className="grid place-items-center p-10 text-muted">
            <Loader2 className="size-6 animate-spin" aria-label="Chargement" />
          </div>
        )}

        {(state === "none" || state === "error") && (
          <div className="rounded-theme border border-brand-200 bg-brand-50/60 p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-600 text-brand-contrast">
              <CheckCircle2 className="size-7" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">
              {c.titre ?? "Merci pour votre commande !"}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {state === "error"
                ? "Votre paiement est bien pris en compte ; le récapitulatif n'a pas pu être chargé."
                : (c.intro ?? "Vous recevrez un e-mail de confirmation de la part de Stripe.")}
            </p>
            <div className="mt-5">
              <Button href={retourHref} variant="outline">
                Retour à la boutique
              </Button>
            </div>
          </div>
        )}

        {state === "ok" && order && (
          <div className="rounded-theme border border-border bg-surface p-6 shadow-sm sm:p-8">
            <div className="text-center">
              <span
                className={
                  order.status === "paid"
                    ? "mx-auto grid size-14 place-items-center rounded-full bg-brand-600 text-brand-contrast"
                    : "mx-auto grid size-14 place-items-center rounded-full bg-accent-500 text-accent-contrast"
                }
              >
                {order.status === "paid" ? (
                  <CheckCircle2 className="size-7" />
                ) : (
                  <Clock className="size-7" />
                )}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">
                {c.titre ?? "Merci pour votre commande !"}
              </h3>
              <p className="mt-1 text-sm text-muted">
                Nous avons bien reçu votre commande{" "}
                <strong className="text-ink">#{order.number}</strong>
                {order.status === "paid"
                  ? " — paiement confirmé."
                  : " — paiement en cours de confirmation."}
              </p>
              {order.customer_email && (
                <p className="mt-1 text-xs text-muted">
                  Un reçu est envoyé à {order.customer_email}.
                </p>
              )}
            </div>

            <ul className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="min-w-0 text-ink">
                    {it.name} <span className="text-muted">× {it.quantity}</span>
                    {(it.selections ?? []).map((s, si) => (
                      <span key={si} className="block text-xs leading-snug text-muted">
                        {s.group} : {s.choices.map((ch) => ch.name).join(", ")}
                      </span>
                    ))}
                  </span>
                  <span className="shrink-0 tabular-nums text-ink">{euros(it.total_cents)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Sous-total</span>
                <span className="tabular-nums">{euros(order.subtotal_cents)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{order.delivery_label}</span>
                <span className="tabular-nums">
                  {order.delivery_price_cents > 0 ? euros(order.delivery_price_cents) : "Gratuit"}
                </span>
              </div>
              <div className="flex justify-between font-display text-base font-extrabold text-ink">
                <span>Total</span>
                <span className="tabular-nums">{euros(order.total_cents)}</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button href={retourHref} variant="outline">
                Retour à la boutique
              </Button>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
