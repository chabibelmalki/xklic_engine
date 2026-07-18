// Référence des 14 allergènes à déclaration obligatoire (INCO / UE 1169-2011).
// Les CLÉS sont alignées sur le back-office (api/internal/store/catalog.go →
// AllergenKeys) et l'admin (xklic-backoffice/admin/src/allergens.ts) : le
// catalogue public renvoie `allergens: string[]` (ces clés) sur chaque produit.
// Icône = emoji (approximation lisible pour moutarde/sésame/céleri).

export type Allergen = { key: string; label: string; icon: string };

export const ALLERGENS: Allergen[] = [
  { key: "gluten", label: "Gluten", icon: "🌾" },
  { key: "crustaces", label: "Crustacés", icon: "🦐" },
  { key: "oeufs", label: "Œufs", icon: "🥚" },
  { key: "poissons", label: "Poissons", icon: "🐟" },
  { key: "arachides", label: "Arachides", icon: "🥜" },
  { key: "soja", label: "Soja", icon: "🫘" },
  { key: "lait", label: "Lait", icon: "🥛" },
  { key: "fruits-a-coque", label: "Fruits à coque", icon: "🌰" },
  { key: "celeri", label: "Céleri", icon: "🥬" },
  { key: "moutarde", label: "Moutarde", icon: "🟡" },
  { key: "sesame", label: "Sésame", icon: "🌱" },
  { key: "sulfites", label: "Sulfites", icon: "🍷" },
  { key: "lupin", label: "Lupin", icon: "🌼" },
  { key: "mollusques", label: "Mollusques", icon: "🦪" },
];

/**
 * Résout une liste de clés (venue du catalogue) en allergènes connus, dans
 * l'ordre canonique (celui d'ALLERGENS). Les clés inconnues sont ignorées —
 * l'affichage ne casse jamais si le back-office ajoute une clé non mappée ici.
 */
export function resolveAllergens(keys: string[] | undefined | null): Allergen[] {
  if (!keys?.length) return [];
  const set = new Set(keys);
  return ALLERGENS.filter((a) => set.has(a.key));
}
