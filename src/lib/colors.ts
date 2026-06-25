import type { CSSProperties } from "react";
import type { BrandColors } from "@/types/config";

/**
 * Génération de palette pilotée par la config (découplage couleur↔code).
 *
 * Principe : la config porte l'INTENTION (1 à 2 couleurs graines + tonalité des
 * neutres) ; le moteur DÉRIVE tout le système de tokens (échelle 50→800, accent,
 * neutres, couleurs de texte contrastées) et l'injecte en variables CSS inline
 * sur le conteneur racine — exactement les mêmes tokens que les thèmes nommés
 * de globals.css, donc 100 % compatible avec les blocs existants.
 *
 * Pourquoi générer au lieu de laisser la config tout définir : on GARANTIT
 * l'harmonie (échelle perceptuellement uniforme en OKLCH) et l'accessibilité
 * (texte blanc/foncé choisi par contraste WCAG), quelle que soit la couleur
 * fournie par le client.
 *
 * Ce module ne s'active QUE si `branding.colors` est présent : sans lui, le
 * rendu retombe sur le thème nommé (`data-theme`) → zéro régression sur les
 * sites actuels.
 */

// ----------------------------------------------------------------------------
// Conversions sRGB ⇄ OKLab ⇄ OKLCH (math. de Björn Ottosson)
// ----------------------------------------------------------------------------

type RGB = { r: number; g: number; b: number }; // canaux 0..1 (sRGB)
type Oklch = { L: number; C: number; H: number }; // H en degrés

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function hexToRgb(hex: string): RGB {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const n = parseInt(h, 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const to = (c: number) =>
    Math.round(clamp01(c) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function rgbToOklch({ r, g, b }: RGB): Oklch {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToRgb({ L, C, H }: Oklch): RGB {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return {
    r: clamp01(linearToSrgb(lr)),
    g: clamp01(linearToSrgb(lg)),
    b: clamp01(linearToSrgb(lb)),
  };
}

function hexToOklch(hex: string): Oklch {
  return rgbToOklch(hexToRgb(hex));
}

function oklchToHex(c: Oklch): string {
  return rgbToHex(oklchToRgb(c));
}

function normalizeHex(hex: string): string {
  return rgbToHex(hexToRgb(hex));
}

// ----------------------------------------------------------------------------
// Contraste (WCAG) — choix texte blanc vs foncé sur un fond donné
// ----------------------------------------------------------------------------

const DARK_TEXT = "#0b1b2e"; // encre par défaut pour les fonds clairs

function relLuminance({ r, g, b }: RGB): number {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(a: RGB, b: RGB): number {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Renvoie #ffffff ou l'encre foncée selon le meilleur contraste sur `bgHex`. */
function contrastOn(bgHex: string): string {
  const bg = hexToRgb(bgHex);
  const white = contrastRatio(bg, { r: 1, g: 1, b: 1 });
  const dark = contrastRatio(bg, hexToRgb(DARK_TEXT));
  return white >= dark ? "#ffffff" : DARK_TEXT;
}

// ----------------------------------------------------------------------------
// Génération des échelles
// ----------------------------------------------------------------------------

const LIGHT_MAX = 0.972; // luminance de la teinte la plus claire (≈ -50)
const DARK_MIN = 0.3; // luminance de la teinte la plus foncée (≈ -800)

// Étapes plus claires que la graine : fraction parcourue vers LIGHT_MAX.
const LIGHT_STEPS: [number, number][] = [
  [50, 0.965],
  [100, 0.84],
  [200, 0.64],
  [300, 0.4],
  [400, 0.16],
];
// Étapes plus foncées que la graine : fraction parcourue vers DARK_MIN.
const DARK_STEPS: [number, number][] = [
  [600, 0.22],
  [700, 0.5],
  [800, 0.76],
];

/** Échelle brand 50→800 ancrée sur la graine au niveau 500. */
function brandScale(seedHex: string): Record<string, string> {
  const seed = hexToOklch(seedHex);
  const out: Record<string, string> = {};

  for (const [step, frac] of LIGHT_STEPS) {
    const L = seed.L + (LIGHT_MAX - seed.L) * frac;
    const C = seed.C * (1 - 0.62 * frac); // moins de chroma vers le blanc (teintes douces)
    out[`--brand-${step}`] = oklchToHex({ L, C, H: seed.H });
  }
  // La graine EST le niveau 500 (le bleu du logo est exactement sur le site).
  out["--brand-500"] = normalizeHex(seedHex);
  for (const [step, frac] of DARK_STEPS) {
    const L = seed.L - (seed.L - DARK_MIN) * frac;
    const C = seed.C * (1 - 0.1 * frac);
    out[`--brand-${step}`] = oklchToHex({ L, C, H: seed.H });
  }
  out["--brand-contrast"] = contrastOn(out["--brand-500"]);
  return out;
}

/** Accent : 50 / 500 / 600 + contraste. Défaut ambre si non fourni. */
function accentScale(accentHex: string): Record<string, string> {
  const a = hexToOklch(accentHex);
  const c50 = { L: a.L + (LIGHT_MAX - a.L) * 0.92, C: a.C * 0.45, H: a.H };
  const c600 = { L: a.L - (a.L - DARK_MIN) * 0.26, C: a.C * 0.98, H: a.H };
  return {
    "--accent-50": oklchToHex(c50),
    "--accent-500": normalizeHex(accentHex),
    "--accent-600": oklchToHex(c600),
    "--accent-contrast": contrastOn(normalizeHex(accentHex)),
  };
}

/** Neutres tokenisés, légèrement teintés (cohérence) — ton warm/cool/auto. */
function neutralScale(brandHex: string, tone?: "warm" | "cool"): Record<string, string> {
  const brandH = hexToOklch(brandHex).H;
  const H = tone === "warm" ? 70 : tone === "cool" ? 250 : brandH;
  const n = (L: number, C: number) => oklchToHex({ L, C, H });
  return {
    "--ink": n(0.22, 0.02),
    "--ink-soft": n(0.4, 0.018),
    "--muted": n(0.52, 0.015),
    "--muted-2": n(0.66, 0.013),
    "--bg": "#ffffff",
    "--alt": n(0.975, 0.01),
    "--surface": "#ffffff",
    "--surface-2": n(0.955, 0.016),
    "--border": n(0.905, 0.018),
  };
}

const ACCENT_DEFAULT = "#f59e0b";

/**
 * Construit l'objet `style` (variables CSS inline) à poser sur le conteneur
 * racine. Renvoie `undefined` si aucune graine n'est définie → on laisse le
 * thème nommé (`data-theme`) faire le rendu. Le `--radius` n'est jamais touché
 * (il reste du ressort du thème/pack).
 */
export function brandColorStyle(colors?: BrandColors): CSSProperties | undefined {
  if (!colors?.brand) return undefined;
  const vars: Record<string, string> = {
    ...brandScale(colors.brand),
    ...accentScale(colors.accent ?? ACCENT_DEFAULT),
    ...neutralScale(colors.brand, colors.neutral),
  };
  return vars as CSSProperties;
}
