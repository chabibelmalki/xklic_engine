import { NextResponse } from "next/server";
import { getAllConfigs } from "@/lib/config-loader";
import { siteOrigin } from "@/lib/urls";

/**
 * Point d'accès PUBLIC listant les sites clients EN LIGNE.
 *
 * SOURCE DE VÉRITÉ pour la page « Réalisations » de la vitrine
 * (xklic.com/realisations), qui consomme cet endpoint en fetch ISR. Se met à
 * jour tout seul : un client = un dossier config/sites/<slug>/ (voir
 * config-loader), donc ajouter un client suffit à le faire apparaître.
 *
 * On expose un sous-ensemble VOLONTAIREMENT MINIMAL et stable — nom, activité,
 * ville, URL publique réelle — et AUCUNE donnée sensible (SIRET, e-mail,
 * dirigeant…). L'URL vient de `siteOrigin` (source unique d'URL du moteur).
 *
 * CORS large : consommé par un projet séparé (la vitrine), côté serveur comme
 * navigateur. Cache CDN long, la liste changeant rarement.
 */

export const revalidate = 3600; // 1 h

export interface RealisationDTO {
  slug: string;
  nom: string;
  /** Libellé d'activité court (ex. « Pâtisserie de création »). */
  activite: string;
  ville: string;
  /** URL publique réelle du site client (ex. https://sanadclean.xklic.com). */
  url: string;
}

/** « Activité · Ville » dans la tagline → on isole l'activité ; replis sûrs. */
function deriveActivite(tagline: string | undefined, apeLabel?: string, schemaType?: string): string {
  const head = tagline?.split("·")[0]?.trim();
  return head || apeLabel || schemaType || "";
}

export async function GET() {
  const sites: RealisationDTO[] = getAllConfigs()
    .map((c) => ({
      slug: c.slug,
      nom: c.entreprise?.nom ?? c.slug,
      activite: deriveActivite(c.branding?.tagline, c.entreprise?.apeLabel, c.seo?.schemaType),
      ville: c.seo?.ville ?? "",
      url: siteOrigin(c),
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  return NextResponse.json(
    { sites, count: sites.length },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
