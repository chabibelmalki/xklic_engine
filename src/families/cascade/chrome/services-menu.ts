import type { SiteConfig, ServicesContent } from "@/types/config";

/** Une entrée du méga-menu Services : un lien avec un libellé. */
export interface MegaLink {
  label: string;
  href: string;
}
/** Une catégorie (onglet) du méga-menu, avec ses sous-services. */
export interface MegaCategory extends MegaLink {
  items: MegaLink[];
}
export interface ServicesMegaData {
  /** Lien vers la page /services (aperçu). */
  href: string;
  categories: MegaCategory[];
}

/**
 * Construit le méga-menu « Services » À PARTIR DES DONNÉES du site :
 * - catégories = items (avec `href`) de la grille de la page `services` ;
 * - sous-services = items (avec `href`) de la grille de CHAQUE page-catégorie.
 *
 * Renvoie `null` si aucune sous-catégorie n'a de page dédiée (ex. un site dont
 * les sous-services ne sont pas cliquables) → le header retombe sur un lien
 * simple. `basePath` préfixe tous les liens (locale / preview).
 */
export function buildServicesMega(config: SiteConfig, basePath: string): ServicesMegaData | null {
  const pages = config.pages ?? [];
  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  const servicesPage = bySlug.get("services");
  if (!servicesPage) return null;

  const firstServicesItems = (page: (typeof pages)[number] | undefined): MegaLink[] => {
    const block = page?.blocks?.find(
      (b) => b.type === "services" && Array.isArray((b.content as ServicesContent)?.items),
    );
    const items = (block?.content as ServicesContent | undefined)?.items ?? [];
    return items
      .filter((it) => typeof it.href === "string" && it.href.length > 0)
      .map((it) => ({ label: it.nom, href: it.href as string }));
  };

  const catLinks = firstServicesItems(servicesPage);
  if (catLinks.length === 0) return null;

  const withBase = (href: string) => `${basePath}${href}`;
  const categories: MegaCategory[] = catLinks.map((cat) => {
    const slug = cat.href.replace(/^\/+/, "");
    const items = firstServicesItems(bySlug.get(slug)).map((s) => ({ label: s.label, href: withBase(s.href) }));
    return { label: cat.label, href: withBase(cat.href), items };
  });

  // Gate : au moins une catégorie doit avoir des sous-services cliquables.
  if (!categories.some((c) => c.items.length > 0)) return null;

  return { href: `${basePath}/services`, categories };
}
