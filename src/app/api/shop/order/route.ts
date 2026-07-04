import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config-loader";
import { shopFetch, shopTenant } from "@/lib/shop";

/**
 * Proxy récap commande (page « merci ») :
 * GET /api/shop/order?site=<slug>&session_id=<cs_…>
 * Relaye /v1/public/tenants/{tenant}/orders/by-session/{sessionID}.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const site = url.searchParams.get("site") ?? "";
  const sessionID = url.searchParams.get("session_id") ?? "";
  if (!sessionID || sessionID.length > 300) {
    return NextResponse.json({ error: "session_id manquant" }, { status: 400 });
  }
  const config = getConfig(site);
  const tenant = config ? shopTenant(config) : null;
  if (!tenant) {
    return NextResponse.json({ error: "boutique non activée" }, { status: 404 });
  }
  try {
    const res = await shopFetch(
      `/v1/public/tenants/${encodeURIComponent(tenant)}/orders/by-session/${encodeURIComponent(sessionID)}`,
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[shop/order]", (e as Error).message);
    return NextResponse.json({ error: "récapitulatif indisponible" }, { status: 502 });
  }
}
