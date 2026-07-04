import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config-loader";
import { shopFetch, shopTenant } from "@/lib/shop";

/**
 * Proxy catalogue : GET /api/shop/catalog?site=<slug>
 * Relaye /v1/public/tenants/{tenant}/catalog du back-office avec la clé
 * ENGINE_API_KEY (serveur uniquement). Données live, jamais mises en cache.
 */
export async function GET(request: Request) {
  const site = new URL(request.url).searchParams.get("site") ?? "";
  const config = getConfig(site);
  if (!config) {
    return NextResponse.json({ error: "site inconnu" }, { status: 404 });
  }
  const tenant = shopTenant(config);
  if (!tenant) {
    return NextResponse.json({ error: "boutique non activée" }, { status: 404 });
  }
  try {
    const res = await shopFetch(`/v1/public/tenants/${encodeURIComponent(tenant)}/catalog`);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[shop/catalog]", (e as Error).message);
    return NextResponse.json({ error: "boutique indisponible" }, { status: 502 });
  }
}
