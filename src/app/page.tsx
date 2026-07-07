import type { Metadata } from "next";
import { getConfig, getDefaultSlug } from "@/lib/config-loader";
import { SiteRenderer } from "@/components/SiteRenderer";
import { buildMetadata } from "@/lib/seo";

/**
 * Racine (apex domain / dev local). Sert le site PAR DÉFAUT (env `SITE`, sinon
 * "fatima"). En prod, les sous-domaines sont réécrits vers /sites/[slug] par le
 * middleware ; la racine reste le site par défaut.
 */
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig(getDefaultSlug());
  return config ? buildMetadata(config) : {};
}

export default function RootPage() {
  const config = getConfig(getDefaultSlug());
  if (!config) {
    return (
      <main className="grid min-h-screen place-items-center p-8 text-center">
        <p className="text-muted">
          Aucune config trouvée dans <code>/config/sites</code>. Ajoutez un fichier{" "}
          <code>&lt;slug&gt;.json</code>.
        </p>
      </main>
    );
  }
  return <SiteRenderer config={config} />;
}
