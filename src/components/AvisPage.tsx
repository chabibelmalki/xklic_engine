import QRCode from "qrcode";
import { Star, QrCode, ExternalLink } from "lucide-react";
import type { SiteConfig } from "@/types/config";
import { resolveTheme } from "@/lib/theme";
import { brandColorStyle } from "@/lib/colors";
import { resolvePack } from "@/lib/packs";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { localeDir, htmlLang } from "@/lib/i18n";
import { ui } from "@/i18n/ui";

/**
 * Page « Laissez un avis » — pilotée par `config.googleReviewUrl`.
 *
 * Deux chemins vers le même lien Google : un bouton principal (clic) et un QR
 * code généré côté serveur (SVG vectoriel → net à toute taille et à l'impression,
 * sans appel réseau). Le QR reste visible à l'impression (`print:`), le reste de
 * l'habillage est masqué : le client imprime une carte propre avec le code.
 *
 * Le garde-fou (404 si pas de lien) est posé par les routes : ce composant n'est
 * rendu que lorsque `config.googleReviewUrl` est défini.
 */
export async function AvisPage({
  config,
  reviewUrl,
  basePath = "",
  locale = config.i18n?.default ?? "fr",
}: {
  config: SiteConfig;
  reviewUrl: string;
  basePath?: string;
  locale?: string;
}) {
  const theme = resolveTheme(config.theme);
  const colorStyle = brandColorStyle(config.branding.colors);
  const pack = resolvePack(config.stylePack);
  const locales = config.i18n?.languages ?? [locale];
  const defaultLocale = config.i18n?.default ?? locale;
  const t = ui(locale);

  // QR vectoriel (SVG) : tolérance "M", marge minimale, noir sur blanc pour un
  // scan fiable quelle que soit la couleur du thème ou le support imprimé.
  const qrSvg = await QRCode.toString(reviewUrl, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0b0c", light: "#ffffff" },
  });

  const stars = (
    <div className="flex items-center justify-center gap-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-5 fill-accent-500 text-accent-500" />
      ))}
    </div>
  );

  return (
    <div
      data-theme={theme}
      data-pack={pack}
      style={colorStyle}
      lang={htmlLang(locale)}
      dir={localeDir(locale)}
      className="min-h-screen bg-bg text-ink print:bg-white"
    >
      <div className="print:hidden">
        <SiteHeader
          config={config}
          basePath={basePath}
          locale={locale}
          locales={locales}
          defaultLocale={defaultLocale}
          strings={t}
        />
      </div>

      <main className="relative overflow-hidden">
        <div aria-hidden className="hero-mesh pointer-events-none absolute inset-0 -z-10 print:hidden" />
        <Container className="py-16 sm:py-24">
          {/* En-tête */}
          <div className="mx-auto max-w-2xl text-center print:hidden">
            {stars}
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {t.avis.pageTitle}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">{t.avis.pageIntro}</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl items-center gap-10 lg:grid-cols-2 print:mt-0 print:block">
            {/* Action principale — masquée à l'impression */}
            <div className="text-center print:hidden lg:text-start">
              <Button
                href={reviewUrl}
                size="lg"
                className="h-auto min-h-14 w-full whitespace-normal py-3 leading-tight sm:w-auto"
              >
                <Star className="size-5 fill-current" />
                {t.avis.openGoogle}
                <ExternalLink className="size-4 opacity-80" />
              </Button>
              <div className="mt-6 flex items-center gap-3 text-sm font-medium text-muted">
                <span className="h-px flex-1 bg-border" />
                {t.avis.orScan}
                <span className="h-px flex-1 bg-border" />
              </div>
            </div>

            {/* Carte QR — visible à l'écran ET à l'impression */}
            <figure className="mx-auto w-full max-w-sm rounded-theme border border-border bg-white p-6 text-center shadow-sm print:mx-auto print:max-w-xs print:border print:shadow-none">
              <figcaption className="font-display text-lg font-bold text-ink">
                {config.entreprise.nom}
              </figcaption>
              <div className="mt-1 text-sm text-muted">{t.avis.thanks}</div>
              <div
                role="img"
                aria-label={t.avis.scanCaption}
                className="mx-auto mt-5 w-52 [&>svg]:h-auto [&>svg]:w-full sm:w-60 print:w-64"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <div className="mt-5 flex items-center justify-center gap-2 font-semibold text-ink">
                <QrCode className="size-5 text-brand-600 print:text-ink" />
                {t.avis.scanCaption}
              </div>
              <p className="mt-1.5 text-sm text-muted">{t.avis.scanHint}</p>
            </figure>
          </div>
        </Container>
      </main>

      <div className="print:hidden">
        <SiteFooter config={config} basePath={basePath} locale={locale} />
      </div>
    </div>
  );
}
