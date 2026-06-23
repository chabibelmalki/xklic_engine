import type { ZoneContent } from "@/types/config";

/**
 * Liste à plat des communes desservies, source unique pour l'affichage et le SEO
 * (JSON-LD `areaServed`, `llms.txt`). Si `zones` est défini, on aplatit les
 * groupes (en dédoublonnant) ; sinon on retombe sur `villes`.
 */
export function allZoneVilles(content: ZoneContent | undefined): string[] {
  if (!content) return [];
  if (content.zones?.length) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const z of content.zones) {
      for (const v of z.villes) {
        if (!seen.has(v)) {
          seen.add(v);
          out.push(v);
        }
      }
    }
    return out;
  }
  return content.villes ?? [];
}
