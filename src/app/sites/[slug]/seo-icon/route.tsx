import { ImageResponse } from "next/og";
import { getConfig, listSlugs } from "@/lib/config-loader";
import { iconInitials, iconBrandColor } from "@/lib/favicon";

// Favicon PNG généré PAR SITE — crawlable par Google (contrairement à un
// data-URI inline). Servi à l'URL publique SANS extension `/seo-icon` : le
// proxy sous-domaine réécrit `<slug>.xklic.com/seo-icon` -> ce handler. On
// évite `.png` car le matcher du proxy (src/proxy.ts) exclut les chemins en
// `.png` (servis comme assets statiques) -> ils ne seraient jamais réécrits.
// Nom `seo-icon` (et NON `icon`) : évite aussi la convention metadata de Next.
export const dynamic = "force-static";

const SIZE = 128;

export function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getConfig(slug);
  if (!config) return new Response("Not found", { status: 404 });

  const text = iconInitials(config.entreprise.nom);
  const background = iconBrandColor(config);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
          color: "#ffffff",
          fontSize: text.length > 1 ? 60 : 80,
          fontWeight: 700,
          // Coins arrondis (le reste du carré reste transparent).
          borderRadius: 28,
        }}
      >
        {text}
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
