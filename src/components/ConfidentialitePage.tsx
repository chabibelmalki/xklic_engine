import type { SiteConfig } from "@/types/config";
import { buildConfidentialite } from "@/lib/legal";
import { LegalDocPage } from "@/components/LegalDocPage";

/** Page /confidentialite (RGPD) générée depuis `config.entreprise` + bloc contact. */
export function ConfidentialitePage({
  config,
  basePath = "",
  locale,
}: {
  config: SiteConfig;
  basePath?: string;
  locale?: string;
}) {
  return (
    <LegalDocPage config={config} doc={buildConfidentialite(config)} basePath={basePath} locale={locale} />
  );
}
