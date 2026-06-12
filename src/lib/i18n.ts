/**
 * Helpers i18n PURS (aucun accès au système de fichiers / config-loader) afin de
 * rester importables côté CLIENT comme serveur. Les données propres au site
 * (langues, langue par défaut) sont passées en ARGUMENTS : c'est la route (côté
 * serveur) qui les lit via `siteLocales(slug)` / `defaultLocale(slug)` et les
 * transmet ici. Ainsi ce module n'a aucune dépendance serveur.
 */

/** Langues à écriture droite-à-gauche. */
export const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

export function localeDir(locale: string): "rtl" | "ltr" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

/** Libellé natif d'une langue, pour le sélecteur. */
const LOCALE_LABELS: Record<string, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
  tr: "Türkçe",
  pt: "Português",
  es: "Español",
  it: "Italiano",
  de: "Deutsch",
  ru: "Русский",
  bn: "বাংলা",
  hi: "हिन्दी",
};
export function localeLabel(locale: string): string {
  return LOCALE_LABELS[locale] ?? locale.toUpperCase();
}

/**
 * Pays du drapeau d'une langue (les emojis drapeaux ne s'affichent pas sous
 * Windows — on sert des SVG auto-hébergés depuis `public/flags/<pays>.svg`).
 */
const LOCALE_COUNTRY: Record<string, string> = {
  fr: "fr",
  en: "us",
  ar: "sa",
  tr: "tr",
  pt: "pt",
  es: "es",
  it: "it",
  de: "de",
  ru: "ru",
  bn: "bd",
  hi: "in",
};
export function localeFlagSrc(locale: string): string | null {
  const c = LOCALE_COUNTRY[locale];
  return c ? `/flags/${c}.svg` : null;
}

/** Valeur de l'attribut `lang` HTML (BCP-47). Les codes courts conviennent. */
export function htmlLang(locale: string): string {
  return locale;
}

/** Locale OpenGraph (`xx_XX`). */
const OG_LOCALES: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  ar: "ar_AR",
  tr: "tr_TR",
  pt: "pt_PT",
  es: "es_ES",
  it: "it_IT",
  de: "de_DE",
  ru: "ru_RU",
  bn: "bn_BD",
  hi: "hi_IN",
};
export function ogLocale(locale: string): string {
  return OG_LOCALES[locale] ?? locale;
}

/** Préfixe d'URL d'une langue : "" pour la langue par défaut, sinon "/<locale>". */
export function localePrefix(locale: string, defaultLocale: string): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}

/** Applique le préfixe de langue à un chemin de page ("/" ou "/services"). */
export function localizedPath(path: string, locale: string, defaultLocale: string): string {
  const prefix = localePrefix(locale, defaultLocale);
  if (path === "/" || path === "") return prefix || "/";
  return `${prefix}${path}`;
}

/** Préfixe de route public (basePath) augmenté de la langue si non-défaut. */
export function buildLocaleBasePath(
  baseBasePath: string,
  locale: string,
  defaultLocale: string,
): string {
  return `${baseBasePath}${localePrefix(locale, defaultLocale)}`;
}

/** `seg` est-il une langue non-défaut supportée (donc un préfixe de langue) ? */
export function isLocale(seg: string, languages: string[], defaultLocale: string): boolean {
  return seg !== defaultLocale && languages.includes(seg);
}

/** Résolution du segment dual `[seg]` : soit une langue, soit une page en langue défaut. */
export type SegResolution =
  | { kind: "localeHome"; locale: string }
  | { kind: "defaultPage"; locale: string; pageSlug: string };

export function resolveSeg(
  seg: string,
  languages: string[],
  defaultLocale: string,
): SegResolution {
  if (isLocale(seg, languages, defaultLocale)) return { kind: "localeHome", locale: seg };
  return { kind: "defaultPage", locale: defaultLocale, pageSlug: seg };
}

/**
 * Résolution de `[seg]/[sub]` : `seg` DOIT être une langue non-défaut (les pages
 * en langue par défaut ne s'imbriquent pas). Sinon `null` → `notFound()`.
 */
export function resolveSegSub(
  seg: string,
  sub: string,
  languages: string[],
  defaultLocale: string,
): { locale: string; pageSlug: string } | null {
  if (!isLocale(seg, languages, defaultLocale)) return null;
  return { locale: seg, pageSlug: sub };
}

/**
 * Garde-fou : aucun code de langue non-défaut ne doit coïncider avec un slug de
 * page (sinon `/en` serait ambigu entre la langue et une page nommée "en").
 */
export function assertNoLocalePageSlugCollision(
  pageSlugs: string[],
  languages: string[],
  defaultLocale: string,
): void {
  const slugSet = new Set(pageSlugs);
  for (const loc of languages) {
    if (loc !== defaultLocale && slugSet.has(loc)) {
      throw new Error(
        `[i18n] Collision : le code de langue "${loc}" est aussi un slug de page. Renommez la page.`,
      );
    }
  }
}
