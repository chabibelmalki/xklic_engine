import { NextResponse } from "next/server";
import { shopFetch } from "@/lib/shop";

/**
 * Proxy autocomplétion géo : GET /api/shop/geo?q=<terme>&limit=<n>
 * Relaye /v1/public/geo/search du back-office (Photon/OSM proxifié, cache) avec
 * la clé ENGINE_API_KEY (serveur uniquement). Sert à saisir la commune de
 * livraison au checkout. Le résultat est filtré côté client contre la zone du
 * mode choisi ; le blocage réel est refait au checkout back-office.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ places: [] });
  }
  const limit = params.get("limit") ?? "8";
  try {
    const res = await shopFetch(
      `/v1/public/geo/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`,
    );
    const data = await res.json().catch(() => ({ places: [] }));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[shop/geo]", (e as Error).message);
    return NextResponse.json({ error: "recherche indisponible", places: [] }, { status: 502 });
  }
}
