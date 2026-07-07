import type { SiteConfig } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import type { SectionTone } from "@/components/ui/Section";

/** Contrat commun à tous les blocs : chaque bloc lit son bout de config. */
export interface BlockComponentProps<C = unknown> {
  block: { type: string; variant?: string; mode?: string; content: C };
  config: SiteConfig;
  /** Index de la section rendue (sert au fond alterné). */
  index: number;
  /**
   * Ton de fond résolu par le SiteRenderer selon la stratégie du pack. Le bloc
   * le passe tel quel à son `<Section tone={tone}>` (ne le recalcule jamais).
   */
  tone: SectionTone;
  /** Préfixe de route ("" en prod, "/preview/<slug>" en dev) pour les liens internes. */
  basePath?: string;
  /** Langue active (BCP-47 court : "fr", "en", "ar"). Sert au sens RTL et aux liens. */
  locale: string;
  /** Libellés d'UI de la langue active (résolus côté serveur). */
  strings: UIStrings;
}
