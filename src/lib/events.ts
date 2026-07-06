import "server-only";
import { z } from "zod";
import type { SiteConfig } from "@/types/config";
import { resolvePages } from "@/lib/pages";
import { postEvent } from "@/lib/backoffice";

/**
 * Capture des INTENTIONS de contact (Tier 1) — table `events`, SANS PII.
 * On capte les clics tel/WhatsApp/mailto/itinéraire + la soumission de
 * formulaire (`form_submit`, émis côté serveur depuis /api/contact). On ne capte
 * NI trafic NI pageviews (ça ira chez un outil tiers).
 */

/** Types d'event acceptés (source de vérité unique, partagée /api/track + /api/contact). */
export const EVENT_TYPES = ["tel", "whatsapp", "mailto", "directions", "form_submit"] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export const eventTypeSchema = z.enum(EVENT_TYPES);

/** Routes "spéciales" du template, présentes quel que soit le site. */
const STATIC_ROUTES = new Set(["/avis", "/mentions-legales", "/confidentialite"]);

/** Valeur stockée quand le chemin n'appartient pas aux routes connues du site. */
const UNKNOWN_PATH = "unknown";

/**
 * Normalise un chemin de page vers une WHITELIST de routes connues du site —
 * GARDE-FOU PII : on n'écrit JAMAIS `location.href`/`pathname` brut dans `events`.
 *
 * `raw` peut être un pathname ou une URL complète. On retire query + hash, le
 * préfixe de service (`/preview/<slug>`, `/sites/<slug>`) et le préfixe de
 * langue (`/en`, `/ar`…), puis on valide contre les pages réelles du site. Tout
 * chemin non reconnu → `"unknown"` (jamais la valeur d'origine). Zéro query
 * string, zéro PII ne peut transiter.
 */
export function normalizePagePath(config: SiteConfig | null, raw: string | undefined): string {
  if (!raw) return UNKNOWN_PATH;

  // 1) Extraire le pathname seul (jette query + hash, même si `raw` est une URL).
  let pathname = raw;
  try {
    if (/^https?:\/\//i.test(raw)) pathname = new URL(raw).pathname;
  } catch {
    return UNKNOWN_PATH;
  }
  pathname = pathname.split("?")[0].split("#")[0];
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;

  if (!config) return UNKNOWN_PATH;

  // 2) Retirer le préfixe de service (preview / sites) propre à ce slug.
  for (const prefix of [`/preview/${config.slug}`, `/sites/${config.slug}`]) {
    if (pathname === prefix) pathname = "/";
    else if (pathname.startsWith(`${prefix}/`)) pathname = pathname.slice(prefix.length);
  }

  // 3) Retirer le préfixe de langue (toute locale non-défaut du site).
  const def = config.i18n?.default;
  const languages = config.i18n?.languages ?? [];
  const seg = pathname.split("/")[1];
  if (seg && seg !== def && languages.includes(seg)) {
    pathname = pathname.slice(seg.length + 1) || "/";
  }

  // 4) Normaliser le trailing slash (sauf racine).
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "") || "/";

  // 5) Valider contre les routes connues du site.
  const known = new Set<string>(["/"]);
  for (const p of resolvePages(config)) known.add(p.path);
  for (const r of STATIC_ROUTES) known.add(r);

  return known.has(pathname) ? pathname : UNKNOWN_PATH;
}

/**
 * Dédup double-clic CÔTÉ SERVEUR (best-effort, in-memory). Même
 * `type + site + session` dans une fenêtre de 30 s = un seul event — sinon les
 * compteurs mentent (double-tap sur un lien tel:). Sans `session`, on n'a pas de
 * clé fiable → on n'absorbe pas (insert toujours) pour ne pas fusionner des
 * visiteurs distincts.
 *
 * Limite assumée (Vercel serverless) : la Map vit par INSTANCE lambda ; deux
 * clics tombant sur deux instances différentes ne sont pas dédupliqués. Rare sur
 * une fenêtre de 30 s, et cohérent avec le choix "pas d'infra de dédup".
 */
const DEDUP_WINDOW_MS = 30_000;
const lastSeen = new Map<string, number>();

function shouldEmit(type: EventType, site: string, session: string | undefined): boolean {
  if (!session) return true;
  const key = `${type}|${site}|${session}`;
  const now = Date.now();
  const prev = lastSeen.get(key);
  if (prev !== undefined && now - prev < DEDUP_WINDOW_MS) return false;
  lastSeen.set(key, now);
  // Purge paresseuse pour borner la mémoire si le trafic monte.
  if (lastSeen.size > 5000) {
    for (const [k, t] of lastSeen) if (now - t > DEDUP_WINDOW_MS) lastSeen.delete(k);
  }
  return true;
}

/**
 * Dédup + insert dans `events`. Fire-and-forget (ne lève jamais). `pagePath` doit
 * être DÉJÀ normalisé via `normalizePagePath`. `session` = identifiant client
 * anonyme (UUID sessionStorage), non-PII, sert à dédupliquer et à relier au
 * funnel `leads`.
 */
export async function trackEvent(args: {
  type: EventType;
  siteSlug: string;
  pagePath: string;
  session?: string;
}): Promise<void> {
  if (!shouldEmit(args.type, args.siteSlug, args.session)) return;
  await postEvent({
    type: args.type,
    site_slug: args.siteSlug,
    page: args.pagePath,
    session: args.session ?? "",
  });
}
