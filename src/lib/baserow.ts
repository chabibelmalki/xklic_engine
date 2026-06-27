import "server-only";
import { isInsertEnabled } from "@/lib/runtime";

/**
 * Client Baserow d'ÉCRITURE (runtime serveur uniquement). Sert la capture de
 * leads Tier 1 : `events` (clics de contact, sans PII) et `leads` (formulaires,
 * avec PII). Lecture = `scripts/get-dossier.mjs` (CLI local), distincte.
 *
 * ⚠️ TOKEN — `BASEROW_WRITE_TOKEN` (jamais `NEXT_PUBLIC_*`) : il vit côté serveur
 * uniquement et doit être SCOPÉ WRITE-ONLY sur les seules tables `events` +
 * `leads` côté Baserow (Account → Database tokens). Ne JAMAIS réutiliser le token
 * CLI de lecture (`BASEROW_TOKEN`), qui voit Dossiers/Paiements/Production/etc.
 *
 * Philosophie : FIRE-AND-FORGET. Un insert qui échoue (Baserow indisponible,
 * token manquant, table inconnue) est avalé en silence — on ne bloque JAMAIS le
 * parcours visiteur, on ne retente pas, on n'empile pas de file d'attente. La
 * perte d'un event sur panne rare est acceptée par conception.
 */

const API = (process.env.BASEROW_API_URL?.trim() || "https://api.baserow.io").replace(/\/$/, "");

/** IDs de table lus depuis l'env (jamais hardcodés). */
export const BASEROW_TABLES = {
  events: () => process.env.BASEROW_TABLE_EVENTS?.trim(),
  leads: () => process.env.BASEROW_TABLE_LEADS?.trim(),
};

/**
 * Insère une ligne dans une table Baserow via l'API REST (`user_field_names=true`
 * → les clés de `fields` sont les NOMS de colonnes, pas des `field_<id>`).
 * Ne lève jamais : retourne `true` si Baserow a confirmé, `false` sinon.
 */
export async function insertRow(
  tableId: string | undefined,
  fields: Record<string, unknown>,
): Promise<boolean> {
  // GARDE-FOU LOCAL : pas d'écriture Baserow en dev/test (override possible via
  // DEV_ALLOW_INSERT=true) — n'altère jamais le parcours visiteur.
  if (!isInsertEnabled()) {
    console.info(`[baserow] mode local/test — insert table ${tableId ?? "?"} ignoré.`);
    return false;
  }
  const token = process.env.BASEROW_WRITE_TOKEN?.trim();
  if (!token) {
    console.info("[baserow] BASEROW_WRITE_TOKEN absent — insert ignoré (repli silencieux).");
    return false;
  }
  if (!tableId) {
    console.info("[baserow] tableId absent (var d'env non posée) — insert ignoré.");
    return false;
  }
  try {
    const res = await fetch(
      `${API}/api/database/rows/table/${tableId}/?user_field_names=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      },
    );
    if (!res.ok) {
      console.error(`[baserow] insert table ${tableId} → HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[baserow] insert table ${tableId} échec : ${(e as Error).message}`);
    return false;
  }
}
