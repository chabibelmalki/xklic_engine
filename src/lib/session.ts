/**
 * Identifiant de SESSION anonyme (client). UUID aléatoire conservé en
 * `sessionStorage` — PAS de cookie, PAS de PII, PAS de fingerprinting. Sert
 * uniquement à dédupliquer les events (double-clic) et à relier un `form_submit`
 * aux clics du même visiteur (funnel). Repart à zéro à chaque onglet/visite.
 *
 * Sûr en SSR (renvoie "" hors navigateur) et tolérant aux navigations privées /
 * sessionStorage indisponible (renvoie "" → l'event part juste sans dédup).
 */
const KEY = "xklic_sid";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.sessionStorage.getItem(KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      window.sessionStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}
