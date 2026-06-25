import type { SiteConfig } from "@/types/config";
import type { MentionsLegales } from "@/lib/legal";
import { resolveTheme } from "@/lib/theme";
import { resolvePack } from "@/lib/packs";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/ui/Container";
import { localeDir, htmlLang } from "@/lib/i18n";
import { ui } from "@/i18n/ui";

/**
 * Gabarit partagé des pages légales (mentions légales, confidentialité) : header
 * + sections (lignes clé/valeur et/ou paragraphe libre) + footer. Le document est
 * construit en amont par `buildMentionsLegales` / `buildConfidentialite`.
 */
export function LegalDocPage({
  config,
  doc,
  basePath = "",
  locale = config.i18n?.default ?? "fr",
}: {
  config: SiteConfig;
  doc: MentionsLegales;
  basePath?: string;
  locale?: string;
}) {
  const theme = resolveTheme(config.theme);
  const pack = resolvePack(config.stylePack);
  const locales = config.i18n?.languages ?? [locale];
  const defaultLocale = config.i18n?.default ?? locale;

  return (
    <div
      data-theme={theme}
      data-pack={pack}
      lang={htmlLang(locale)}
      dir={localeDir(locale)}
      className="min-h-screen bg-bg text-ink"
    >
      <SiteHeader
        config={config}
        basePath={basePath}
        locale={locale}
        locales={locales}
        defaultLocale={defaultLocale}
        strings={ui(locale)}
      />
      <main className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {doc.title}
          </h1>
          <div className="mt-10 space-y-10">
            {doc.sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-xl font-semibold text-ink">{section.title}</h2>
                {section.rows.length > 0 && (
                  <dl className="mt-4 divide-y divide-border overflow-hidden rounded-theme border border-border bg-surface">
                    {section.rows.map((row) => (
                      <div key={row.label} className="grid gap-1 px-5 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
                        <dt className="text-sm font-medium text-muted">{row.label}</dt>
                        <dd className="text-sm text-ink">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {section.text && <p className="mt-4 leading-relaxed text-muted">{section.text}</p>}
              </section>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter config={config} basePath={basePath} locale={locale} />
    </div>
  );
}
