import { NextResponse } from "next/server";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";
import { eventTypeSchema, normalizePagePath, trackEvent } from "@/lib/events";

/**
 * Réception des EVENTS de contact (Tier 1) — table `events`, SANS PII.
 * POST JSON uniquement. Le `type` est validé strictement (enum partagée). Le
 * `pagePath` reçu est normalisé puis validé contre la whitelist des routes du
 * site (jamais stocké brut). Fire-and-forget : on répond toujours 200 (un bot ou
 * un payload bancal ne doit pas générer de bruit côté visiteur), l'insert
 * back-office échoue en silence si besoin.
 *
 * `form_submit` est émis CÔTÉ SERVEUR depuis /api/contact (succès du lead) ;
 * il reste accepté ici par cohérence d'enum, mais le listener client ne l'émet pas.
 */
const trackSchema = z.object({
  type: eventTypeSchema,
  siteSlug: z.string().min(1).max(100),
  /** pathname brut (sans query/hash côté client) ; normalisé+whitelisté serveur. */
  pagePath: z.string().max(512).optional(),
  /** UUID de session anonyme (dédup) ; optionnel. */
  session: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    // Payload invalide (bot, vieux client…) : on ne bruite pas, 422 discret.
    return NextResponse.json({ ok: false }, { status: 422 });
  }
  const { type, siteSlug, pagePath, session } = parsed.data;

  const config = getConfig(siteSlug);
  const page = normalizePagePath(config, pagePath);

  await trackEvent({ type, siteSlug, pagePath: page, session });
  return NextResponse.json({ ok: true });
}
