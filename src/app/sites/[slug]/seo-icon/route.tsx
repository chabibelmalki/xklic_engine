import { ImageResponse } from "next/og";
import { getConfig, listSlugs } from "@/lib/config-loader";
import { iconInitials, iconBrandColor } from "@/lib/favicon";

// Favicon PNG généré PAR SITE — crawlable par Google (contrairement à un
// data-URI inline). Nom de segment `seo-icon` (et NON `icon`) volontaire : sous
// un segment dynamique, un fichier/route nommé `icon` est happé par la
// convention metadata « icon » de Next. Un rewrite next.config expose l'URL
// publique /sites/[slug]/icon.png -> /sites/[slug]/seo-icon (cf. seo-sitemap).
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
