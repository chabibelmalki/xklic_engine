import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config-loader";
import { shopCheckoutSchema } from "@/lib/shop-schema";
import { shopFetch, shopTenant } from "@/lib/shop";
import { isLocalTestMode } from "@/lib/runtime";
import { verifyTurnstileToken } from "@/lib/turnstile";

/**
 * Proxy checkout : POST /api/shop/checkout
 *
 * Même posture de sécurité que /api/contact (honeypot + Turnstile opt-in par
 * site), puis relais vers le back-office qui SEUL fait autorité sur les prix
 * et le stock (transaction Go + revalidation Stripe). L'engine ne calcule ni
 * ne transmet aucun prix ; la clé Stripe ne le traverse jamais.
 *
 * Les URLs de retour Stripe sont construites ICI : origin de la requête
 * (le host public du site, préservé par le proxy multi-tenant) + chemins
 * RELATIFS fournis par le client (validés : anti open-redirect).
 */

/** Messages lisibles pour les erreurs métier du back-office. */
const SHOP_ERRORS: Record<string, string> = {
  out_of_stock: "Un article de votre panier n'est plus en stock. Actualisez la page.",
  product_unavailable: "Un article de votre panier n'est plus disponible. Actualisez la page.",
  options_invalid: "La composition d'un article a changé. Actualisez la page et recomposez votre choix.",
  delivery_method_invalid: "Le mode de livraison choisi n'est plus proposé. Actualisez la page.",
  address_required: "Merci de renseigner votre adresse de livraison.",
  out_of_zone: "Cette adresse n'est pas dans la zone de livraison de ce mode. Choisissez une autre commune ou le retrait.",
  stripe_not_connected: "Le paiement en ligne n'est pas encore activé pour cette boutique.",
  stripe_not_configured: "Le paiement en ligne est momentanément indisponible.",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = shopCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Panier invalide", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // Honeypot : bot => on répond OK sans rien faire (même posture que /api/contact).
  if (data.company && data.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const config = getConfig(data.siteSlug);
  if (!config) {
    return NextResponse.json({ error: "site inconnu" }, { status: 404 });
  }
  const tenant = shopTenant(config);
  if (!tenant) {
    return NextResponse.json({ error: "boutique non activée" }, { status: 404 });
  }

  // Turnstile : seulement si le site l'a activé, et jamais en local/test.
  if (config.forms?.turnstile && !isLocalTestMode()) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    if (!(await verifyTurnstileToken(config, data.turnstileToken, ip))) {
      return NextResponse.json({ error: "Vérification anti-robot échouée." }, { status: 403 });
    }
  }

  // Origin public de la requête (host réel du site, y compris localhost en dev).
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const successURL = `${origin}${data.successPath}?session_id={CHECKOUT_SESSION_ID}`;
  const cancelURL = `${origin}${data.cancelPath}`;

  try {
    const res = await shopFetch(`/v1/public/tenants/${encodeURIComponent(tenant)}/checkout`, {
      method: "POST",
      body: JSON.stringify({
        items: data.items.map((it) => ({
          product_id: it.productId,
          quantity: it.quantity,
          options: (it.options ?? []).map((o) => ({
            group_id: o.groupId,
            choice_ids: o.choiceIds,
          })),
        })),
        delivery_method_id: data.deliveryMethodId,
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone || "",
        },
        address: {
          line1: data.address?.line1 || "",
          complement: data.address?.complement || "",
          city: data.address?.city || "",
          postcode: data.address?.postcode || "",
          country: data.address?.country || "",
          region: data.address?.region || "",
          lat: data.address?.lat ?? 0,
          lon: data.address?.lon ?? 0,
        },
        success_url: successURL,
        cancel_url: cancelURL,
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as {
      error?: string;
      checkout_url?: string;
      order_number?: number;
    };
    if (!res.ok) {
      const message = SHOP_ERRORS[payload.error ?? ""] ?? "Le paiement a échoué, réessayez.";
      return NextResponse.json({ error: message, code: payload.error }, { status: res.status });
    }
    return NextResponse.json({
      checkout_url: payload.checkout_url,
      order_number: payload.order_number,
    });
  } catch (e) {
    console.error("[shop/checkout]", (e as Error).message);
    return NextResponse.json({ error: "Boutique momentanément indisponible." }, { status: 502 });
  }
}
