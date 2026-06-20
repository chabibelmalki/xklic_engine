import type { SiteConfig, ContactContent } from "@/types/config";
import { getBlockComponent } from "@/blocks/catalog";
import { resolveTheme } from "@/lib/theme";
import { resolvePack } from "@/lib/packs";
import { buildJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { getHomePage, findBlock, type ResolvedPage } from "@/lib/pages";
import { localeDir, htmlLang } from "@/lib/i18n";
import { ui } from "@/i18n/ui";

/**
 * Cœur du moteur : pose le thème (data-theme), injecte le JSON-LD, puis rend
 * les blocs de la PAGE courante (`page.blocks`) via le catalogue. Un type
 * inconnu retombe sur le bloc `Unknown` (dégradation propre).
 *
 * Multi-page : `page` est la page à rendre (accueil par défaut). Le header/footer
 * construisent leur nav depuis `config.pages` et mettent en valeur `page.path`.
 *
 * `basePath` permet de servir le même rendu en prod ("") comme en preview
 * ("/preview/<slug>") sans dupliquer la logique.
 */

// Blocs qui rendent une SECTION tonale (fond alterné via toneForIndex).
// hero / pageHero / cta sont hors flux alterné.
const SECTION_TYPES = new Set([
  "services",
  "etapes",
  "simulateur",
  "tarifs",
  "serviceQuoteBuilder",
  "zone",
  "faq",
  "galerie",
  "avis",
  "contact",
]);

export function SiteRenderer({
  config,
  page,
  basePath = "",
  locale = config.i18n?.default ?? "fr",
}: {
  config: SiteConfig;
  page?: ResolvedPage;
  basePath?: string;
  locale?: string;
}) {
  const theme = resolveTheme(config.theme);
  const pack = resolvePack(config.stylePack);
  const current = page ?? getHomePage(config);
  // Coordonnées sourcées sur TOUT le site (la page contact peut être ailleurs).
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const t = ui(locale);
  const locales = config.i18n?.languages ?? [locale];
  const defaultLocale = config.i18n?.default ?? locale;

  let sectionIndex = 0;

  return (
    <div
      data-theme={theme}
      data-pack={pack}
      lang={htmlLang(locale)}
      dir={localeDir(locale)}
      className="flex min-h-screen flex-col bg-bg text-ink"
    >
      <JsonLd data={buildJsonLd(config, current)} />
      <SiteHeader
        config={config}
        basePath={basePath}
        currentPath={current.path}
        locale={locale}
        locales={locales}
        defaultLocale={defaultLocale}
        strings={t}
      />
      {/* overflow-x-clip : garde-fou anti-débordement horizontal SUR LE CONTENU
          uniquement. Posé ici (et pas sur <html>/<body>/conteneur racine) pour
          ne PAS casser le `position: sticky` de l'en-tête, qui vit hors de <main>. */}
      <main className="flex-1 overflow-x-clip">
        {current.blocks.map((block, i) => {
          const Cmp = getBlockComponent(block.type);
          const isSection =
            SECTION_TYPES.has(block.type) && !(block.type === "zone" && block.mode === "aucune");
          const index = isSection ? sectionIndex++ : i;
          return (
            <Cmp
              key={`${block.type}-${i}`}
              block={block as never}
              config={config}
              index={index}
              basePath={basePath}
              locale={locale}
              strings={t}
            />
          );
        })}
      </main>
      <SiteFooter config={config} basePath={basePath} currentPath={current.path} locale={locale} />
      <FloatingActions
        telephone={contact?.telephone}
        whatsapp={contact?.whatsapp}
        entreprise={config.entreprise.nom}
        strings={t.floating}
      />
    </div>
  );
}
