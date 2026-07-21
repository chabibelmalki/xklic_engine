import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { SiteConfig } from "@/types/config";

/**
 * Chargeur de configs. UN DOSSIER PAR CLIENT dans `/config/sites/<slug>/` :
 *   <slug>/config.json   → langue par défaut (config COMPLÈTE, déclare `i18n`)
 *   <slug>/<locale>.json → une config COMPLÈTE traduite par langue supplémentaire
 * Exemple : souadtazya/config.json (fr), souadtazya/en.json, souadtazya/ar.json.
 * Un site monolingue n'a qu'un `config.json`. Tout est lu au build (SSG) / à la
 * revalidation (ISR), jamais côté client. Pas de DB : les fichiers SONT la base.
 */

const SITES_DIR = path.join(process.cwd(), "config", "sites");
const BASE_FILE = "config.json";

/** Une famille de configs : la langue par défaut + une config complète par langue. */
interface SiteEntry {
  default: string;
  languages: string[];
  byLocale: Map<string, SiteConfig>;
}

const DEFAULT_LOCALE = "fr";

let _cache: Map<string, SiteEntry> | null = null;

// Rappel (une fois par slug) : un domaine perso (`customDomains`/`domain`) doit
// être réellement câblé, sinon canonical/hreflang/OG/sitemap pointent vers un
// domaine qui ne sert pas le site — ET le proxy y route les requêtes entrantes.
// Voir le commentaire de `SiteConfig.customDomains`.
const warnedDomains = new Set<string>();

function normalize(parsed: SiteConfig, slug: string): SiteConfig {
  parsed.slug = slug;
  // Défensif : un site multi-page peut ne pas définir `blocks` au niveau racine.
  if (!Array.isArray(parsed.blocks)) parsed.blocks = [];
  const customDomains =
    parsed.customDomains?.length ? parsed.customDomains : parsed.domain ? [parsed.domain] : [];
  if (customDomains.length && !warnedDomains.has(slug)) {
    warnedDomains.add(slug);
    console.warn(
      `[config] ${slug} : domaine(s) perso = [${customDomains.join(", ")}]. L'URL publique (canonical) sera https://${customDomains[0]} et le proxy y route le trafic — vérifiez que CHAQUE host est BIEN câblé (Vercel + DNS) et régénérez le manifeste. Sinon, retirez ces champs pour servir sur ${slug}.<NEXT_PUBLIC_ROOT_DOMAIN>.`,
    );
  }
  return parsed;
}

/**
 * Champs TECHNIQUES / d'identité TOUJOURS hérités de `config.json` par les
 * variantes de langue — jamais lus depuis un `<locale>.json`. Un fichier de
 * locale traduit du CONTENU ; s'il divergeait sur ces champs, la variante
 * casserait le canonique (bug historique : `customDomains` absent des locales
 * → canonical/hreflang des pages EN/AR émis sur `<slug>.xklic.com`), la
 * protection des formulaires ou l'exclusion d'index.
 */
function inheritTechnical(variant: SiteConfig, base: SiteConfig): SiteConfig {
  variant.customDomains = base.customDomains;
  variant.domain = base.domain;
  variant.demo = base.demo;
  variant.noindexSite = base.noindexSite;
  variant.servicesMegaMenu = base.servicesMegaMenu;
  variant.whiteHeader = base.whiteHeader;
  variant.geo = base.geo;
  variant.forms = base.forms;
  variant.googleReviewUrl = base.googleReviewUrl;
  variant.social = base.social;
  variant.theme = base.theme;
  variant.stylePack = base.stylePack;
  return variant;
}

function parseFile(fullPath: string): SiteConfig {
  const raw = fs.readFileSync(fullPath, "utf8");
  try {
    return JSON.parse(raw) as SiteConfig;
  } catch (e) {
    throw new Error(`Config invalide (JSON) : ${fullPath} — ${(e as Error).message}`);
  }
}

// En production (SSG/ISR) les fichiers ne changent pas pendant l'exécution :
// on met en cache. En développement on relit à chaque appel pour qu'une édition
// de config soit prise en compte SANS redémarrer le serveur.
const USE_CACHE = process.env.NODE_ENV === "production";

function readAll(): Map<string, SiteEntry> {
  if (_cache && USE_CACHE) return _cache;
  const map = new Map<string, SiteEntry>();

  if (!fs.existsSync(SITES_DIR)) {
    if (USE_CACHE) _cache = map;
    return map;
  }

  for (const entry of fs.readdirSync(SITES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue; // un client = un DOSSIER
    const slug = entry.name;
    const dir = path.join(SITES_DIR, slug);
    const basePath = path.join(dir, BASE_FILE);
    if (!fs.existsSync(basePath)) {
      console.warn(`[config] ${slug}/ : pas de ${BASE_FILE}, dossier ignoré.`);
      continue;
    }

    const base = parseFile(basePath);
    if (base.slug && base.slug !== slug) {
      console.warn(
        `[config] ${slug}/${BASE_FILE} : slug "${base.slug}" != dossier "${slug}", on garde le dossier.`,
      );
    }
    const def = base.i18n?.default ?? DEFAULT_LOCALE;
    const languages = base.i18n?.languages ?? [def];
    const byLocale = new Map<string, SiteConfig>([[def, normalize(base, slug)]]);

    // Variantes de langue : tous les autres `<locale>.json` du dossier.
    for (const file of fs.readdirSync(dir)) {
      if (file === BASE_FILE || !file.endsWith(".json")) continue;
      const locale = file.slice(0, -".json".length);
      if (!languages.includes(locale)) {
        console.warn(
          `[config] ${slug}/${file} : "${locale}" absent de i18n.languages (${languages.join(", ")}), variante ignorée.`,
        );
        continue;
      }
      byLocale.set(locale, inheritTechnical(normalize(parseFile(path.join(dir, file)), slug), base));
    }

    map.set(slug, { default: def, languages, byLocale });
  }

  if (USE_CACHE) _cache = map;
  return map;
}

/** Liste tous les slugs disponibles (= sous-domaines / exemples), variantes exclues. */
export function listSlugs(): string[] {
  return [...readAll().keys()].sort();
}

/**
 * Charge une config par slug (et langue optionnelle), ou `null` si absente.
 * Sans `locale` → langue par défaut. Variante manquante → repli sur le défaut.
 */
export function getConfig(slug: string, locale?: string): SiteConfig | null {
  const entry = readAll().get(slug);
  if (!entry) return null;
  const loc = locale ?? entry.default;
  return entry.byLocale.get(loc) ?? entry.byLocale.get(entry.default) ?? null;
}

/** Charge une config par slug ou lève (pour les routes qui exigent un site). */
export function getConfigOrThrow(slug: string, locale?: string): SiteConfig {
  const cfg = getConfig(slug, locale);
  if (!cfg) throw new Error(`Aucune config pour le slug "${slug}".`);
  return cfg;
}

/** Toutes les configs (langue par défaut de chaque site) — sitemaps globaux, index. */
export function getAllConfigs(): SiteConfig[] {
  return [...readAll().values()].map((e) => e.byLocale.get(e.default)!);
}

/** Langues supportées d'un site (défaut inclus). Monolingue → `[default]`. */
export function siteLocales(slug: string): string[] {
  return readAll().get(slug)?.languages ?? [DEFAULT_LOCALE];
}

/** Langue par défaut d'un site (servie sans préfixe d'URL). */
export function defaultLocale(slug: string): string {
  return readAll().get(slug)?.default ?? DEFAULT_LOCALE;
}

/** Slug par défaut : env `SITE`, sinon "fatima", sinon le premier dispo. */
export function getDefaultSlug(): string {
  const env = process.env.SITE?.trim();
  const slugs = listSlugs();
  if (env && slugs.includes(env)) return env;
  if (slugs.includes("fatima")) return "fatima";
  return slugs[0] ?? "fatima";
}
