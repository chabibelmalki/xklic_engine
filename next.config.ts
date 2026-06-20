import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le lockfile peut vivre dans un dossier parent (workspaces) : on ancre la
  // racine Turbopack sur ce projet pour éviter les avertissements de root.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Les images/logos sont référencés par URL (object storage) dans les
    // configs. Aucune image n'est commitée : on autorise les URLs HTTPS.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // L'URL publique du sitemap par site reste /sitemap.xml (réécrite par le
  // proxy sous-domaine vers /sites/<slug>/sitemap.xml). En interne, le Route
  // Handler vit sous `seo-sitemap` pour éviter la convention metadata réservée
  // `sitemap.xml`, dont la machinerie de « source route » casse au build sous
  // segment dynamique. On rebranche donc l'URL interne vers ce handler.
  // `beforeFiles` : prioritaire sur le match du segment dynamique `[seg]`.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/sites/:slug/sitemap.xml",
          destination: "/sites/:slug/seo-sitemap",
        },
        // Favicon PNG généré : exposé sous un nom de fichier conventionnel
        // (/icon.png) tout en évitant la convention metadata `icon` de Next
        // (handler interne `seo-icon`). Même logique que `seo-sitemap`.
        {
          source: "/sites/:slug/icon.png",
          destination: "/sites/:slug/seo-icon",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
