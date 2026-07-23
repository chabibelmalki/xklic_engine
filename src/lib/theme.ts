import type { ThemeId } from "@/types/config";

/**
 * Registre des thèmes. Le rendu ne fait que poser `data-theme="<id>"` sur le
 * conteneur racine du site ; les variables CSS correspondantes (globals.css)
 * prennent le relais. Un thème inconnu retombe sur le défaut sans casser.
 */
export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "douceur-beige", label: "Douceur beige" },
  { id: "energie-corail", label: "Énergie corail" },
  { id: "pro-bleu-nuit", label: "Pro bleu nuit" },
  { id: "fraicheur-teal", label: "Fraîcheur teal" },
  { id: "rose-poudre", label: "Rose poudré" },
  // Palettes promues depuis les ex-couleurs des packs (découplage couleur↔pack) :
  { id: "maison-ivoire", label: "Maison ivoire" },
  { id: "terra-sauge", label: "Terra sauge" },
  { id: "acier-anthracite", label: "Acier anthracite" },
  { id: "rose-cuivre", label: "Rose cuivre" },
  { id: "noir-cuivre", label: "Noir cuivre (sombre)" },
  { id: "pop-violet", label: "Pop violet" },
  { id: "bleu-azur", label: "Bleu azur" },
  { id: "vitrail-foret", label: "Vitrail forêt (vert profond & laiton sur ivoire)" },
];

export const DEFAULT_THEME: ThemeId = "pro-bleu-nuit";

const KNOWN = new Set(THEMES.map((t) => t.id));

/** Renvoie l'id de thème à appliquer (défaut si inconnu). */
export function resolveTheme(theme: ThemeId | undefined): ThemeId {
  return theme && KNOWN.has(theme) ? theme : DEFAULT_THEME;
}
