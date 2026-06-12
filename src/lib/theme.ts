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
];

export const DEFAULT_THEME: ThemeId = "pro-bleu-nuit";

const KNOWN = new Set(THEMES.map((t) => t.id));

/** Renvoie l'id de thème à appliquer (défaut si inconnu). */
export function resolveTheme(theme: ThemeId | undefined): ThemeId {
  return theme && KNOWN.has(theme) ? theme : DEFAULT_THEME;
}
