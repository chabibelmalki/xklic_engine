import type {
  SiteConfig,
  ServicesContent,
  TarifsContent,
  ZoneContent,
  ContactContent,
} from "@/types/config";
import { siteOrigin } from "@/lib/urls";
import { statutLabel } from "@/lib/legal";
import { formatEUR } from "@/lib/utils";
import { resolvePages, findBlock } from "@/lib/pages";
import { localizedPath } from "@/lib/i18n";

/** Pages publiques indexables d'un site (relatives à l'origin) + mentions. */
function sitePaths(config: SiteConfig): { path: string; priority: string }[] {
  const pages = resolvePages(config)
    .filter((p) => !p.noindex)
    .map((p) => ({ path: p.path, priority: p.isHome ? "1.0" : "0.7" }));
  return [
    ...pages,
    { path: "/mentions-legales", priority: "0.3" },
    { path: "/confidentialite", priority: "0.3" },
  ];
}

function content<T>(config: SiteConfig, type: string): T | undefined {
  return findBlock<T>(config, type)?.content;
}

/** sitemap.xml d'un site (toutes les pages × toutes les langues). */
export function buildSitemapXml(config: SiteConfig): string {
  const origin = siteOrigin(config);
  // Monolingue → [default] (préfixe vide, comportement inchangé).
  const def = config.i18n?.default ?? "fr";
  const langs = config.i18n?.languages ?? [def];
  const urls = sitePaths(config)
    .flatMap(({ path, priority }) =>
      langs.map((lang) => {
        const lp = localizedPath(path, lang, def);
        const loc = lp === "/" ? origin : `${origin}${lp}`;
        return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
      }),
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/** robots.txt d'un site (pointe sur son propre sitemap). */
export function buildRobotsTxt(config: SiteConfig): string {
  const origin = siteOrigin(config);
  return `User-agent: *
Allow: /
Disallow: /preview/
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;
}

/**
 * llms.txt — résumé factuel et structuré pour les IA (GEO). Contenu propre au
 * site, dérivé de la config.
 */
export function buildLlmsTxt(config: SiteConfig): string {
  const e = config.entreprise;
  const origin = siteOrigin(config);
  const services = content<ServicesContent>(config, "services");
  const tarifs = content<TarifsContent>(config, "tarifs");
  const zoneBlock = findBlock<ZoneContent>(config, "zone");
  const zone = zoneBlock?.content;
  const contact = content<ContactContent>(config, "contact");

  const lines: string[] = [];
  lines.push(`# ${e.nom}`);
  lines.push("");
  lines.push(`> ${e.nom} — ${config.seo.ville}. Type : ${config.seo.schemaType}.`);
  lines.push("");
  lines.push("## Entreprise");
  lines.push(`- Nom : ${e.nom}`);
  lines.push(`- Statut : ${statutLabel(e.statut)}`);
  lines.push(`- SIRET : ${e.siret}`);
  lines.push(`- Ville : ${config.seo.ville}`);
  lines.push(`- Site : ${origin}`);

  if (contact) {
    lines.push("");
    lines.push("## Contact");
    if (contact.telephone) lines.push(`- Téléphone : ${contact.telephone}`);
    if (contact.email) lines.push(`- E-mail : ${contact.email}`);
    if (contact.adresse) lines.push(`- Adresse : ${contact.adresse}`);
    if (contact.horaires?.length)
      lines.push(`- Horaires : ${contact.horaires.map((h) => `${h.jour} ${h.heures}`).join("; ")}`);
  }

  if (services?.items.length) {
    lines.push("");
    lines.push("## Services");
    for (const s of services.items) {
      lines.push(`- ${s.nom}${s.description ? ` : ${s.description}` : ""}`);
    }
  }

  if (tarifs) {
    lines.push("");
    lines.push("## Tarifs");
    if (tarifs.items?.length) {
      for (const t of tarifs.items) {
        const price =
          t.prix === undefined
            ? "sur devis"
            : typeof t.prix === "number"
              ? formatEUR(t.prix)
              : t.prix;
        lines.push(`- ${t.nom} : ${price}${t.unite ? ` ${t.unite}` : ""}`);
      }
    } else {
      lines.push("- Sur devis.");
    }
  }

  if (zone && zoneBlock?.mode !== "aucune") {
    lines.push("");
    lines.push("## Zone d'intervention");
    lines.push(`- ${(zone.villes ?? [config.seo.ville]).join(", ")}`);
    if (zone.rayonKm) lines.push(`- Rayon : ${zone.rayonKm} km`);
  }

  lines.push("");
  return lines.join("\n");
}
