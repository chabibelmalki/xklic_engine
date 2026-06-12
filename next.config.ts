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
};

export default nextConfig;
