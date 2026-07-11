import { Fragment } from "react";
import type { SiteConfig, ContactContent } from "@/types/config";
import { resolveTheme } from "@/lib/theme";
import { brandColorStyle } from "@/lib/colors";
import { resolvePack, getPack } from "@/lib/packs";
import { getFamily, getFamilyBlock } from "@/families";
import { sectionTone } from "@/components/ui/Section";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { buildJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackClicks } from "@/components/TrackClicks";
import { getHomePage, findBlock, type ResolvedPage } from "@/lib/pages";
import { localeDir, htmlLang } from "@/lib/i18n";
import { ui } from "@/i18n/ui";
import { getTurnstileSiteKey } from "@/lib/turnstile";

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
  "grilleTarifs",
  "serviceQuoteBuilder",
  "zone",
  "faq",
  "galerie",
  "avis",
  "contact",
]);

export async function SiteRenderer({
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
  // Sitekey Turnstile résolue UNE fois côté serveur (back-office, repli env) et
  // injectée dans chaque bloc — les blocs client ne peuvent pas la résoudre.
  const turnstileSiteKey = await getTurnstileSiteKey(config);
  const theme = resolveTheme(config.theme);
  const colorStyle = brandColorStyle(config.branding.colors);
  const pack = resolvePack(config.stylePack);
  const packDef = getPack(config.stylePack);
  const family = getFamily(packDef.family);
  const { Header, Footer, FloatingActions } = family.Chrome;
  const strategy = packDef.sectionStrategy;
  // La stratégie `bordered` force un filet entre sections, quel que soit le pack.
  const divider = strategy === "bordered" ? "rule" : packDef.sectionDivider;
  const current = page ?? getHomePage(config);
  // Coordonnées sourcées sur TOUT le site (la page contact peut être ailleurs).
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const t = ui(locale);
  const locales = config.i18n?.languages ?? [locale];
  const defaultLocale = config.i18n?.default ?? locale;

  let sectionIndex = 0;
  // Une section est « tonale » (fond alterné) si son type est dans SECTION_TYPES,
  // sauf une zone en mode "aucune" (non rendue).
  const isTonal = (b?: { type: string; mode?: string }) =>
    !!b && SECTION_TYPES.has(b.type) && !(b.type === "zone" && b.mode === "aucune");

  return (
    <div
      data-theme={theme}
      data-pack={pack}
      style={colorStyle}
      lang={htmlLang(locale)}
      dir={localeDir(locale)}
      className="flex min-h-screen flex-col bg-bg text-ink"
    >
      {/* Le layout racine (partagé moteur/tenants) fige <html lang="fr"> ; la
          locale n'y est pas connaissable sans rendre tout dynamique. On aligne
          lang/dir de <html> côté client pour les variantes non-FR (lecteurs
          d'écran + crawlers exécutant le JS) — le signal serveur principal
          reste hreflang + lang/dir de ce wrapper. */}
      {htmlLang(locale) !== "fr" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.lang=${JSON.stringify(htmlLang(locale))};document.documentElement.dir=${JSON.stringify(localeDir(locale))};`,
          }}
        />
      )}
      <JsonLd data={buildJsonLd(config, current)} />
      <Header
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
          const Cmp = getFamilyBlock(family, block.type);
          const isSection = isTonal(block);
          const index = isSection ? sectionIndex++ : i;
          const tone = sectionTone(strategy, index);
          // Divider UNIQUEMENT entre deux sections tonales ADJACENTES. Le ton de la
          // section précédente = sectionTone(index - 1) (elle porte l'index tonal
          // juste avant celui-ci, puisqu'elle est elle-même tonale et adjacente).
          const prevIsSection = i > 0 && isTonal(current.blocks[i - 1]);
          const div =
            divider !== "none" && isSection && prevIsSection ? (
              <SectionDivider
                variant={divider}
                fromTone={sectionTone(strategy, index - 1)}
                toTone={tone}
              />
            ) : null;
          return (
            <Fragment key={`${block.type}-${i}`}>
              {div}
              <Cmp
                block={block as never}
                config={config}
                index={index}
                tone={tone}
                basePath={basePath}
                locale={locale}
                strings={t}
                turnstileSiteKey={turnstileSiteKey}
              />
            </Fragment>
          );
        })}
      </main>
      <Footer config={config} basePath={basePath} currentPath={current.path} locale={locale} />
      <FloatingActions
        telephone={contact?.telephone}
        whatsapp={contact?.whatsapp}
        entreprise={config.entreprise.nom}
        strings={t.floating}
      />
      {/* Instrumentation Tier 1 : un seul listener délégué pour tout le site. */}
      <TrackClicks siteSlug={config.slug} />
    </div>
  );
}
