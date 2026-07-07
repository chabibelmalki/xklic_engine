/**
 * Détection du mode LOCAL / TEST (dev) vs PRODUCTION — garde-fou pour ne PAS, en
 * local : (a) afficher / vérifier Turnstile, (b) livrer les formulaires au client
 * (e-mail Resend / webhook) et risquer de spammer la vraie adresse client pendant
 * les tests.
 *
 * Basé sur `NODE_ENV` : `next dev` ⇒ "development", build/runtime Vercel ⇒
 * "production". Sûr côté client comme serveur (NODE_ENV est inliné par Next dans
 * les deux bundles).
 */
export function isLocalTestMode(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * Livraison des formulaires au client autorisée ? NON en local, SAUF override
 * explicite `DEV_ALLOW_DELIVERY=true` (test ponctuel d'un envoi e-mail réel).
 * Serveur uniquement (lit une var non publique).
 */
export function isDeliveryEnabled(): boolean {
  return !isLocalTestMode() || process.env.DEV_ALLOW_DELIVERY === "true";
}

/**
 * Écriture back-office (events + leads) autorisée ? NON en local, SAUF override
 * explicite `DEV_ALLOW_INSERT=true`. Évite de polluer les tables avec des lignes
 * de test pendant le dev. Serveur uniquement.
 */
export function isInsertEnabled(): boolean {
  return !isLocalTestMode() || process.env.DEV_ALLOW_INSERT === "true";
}
