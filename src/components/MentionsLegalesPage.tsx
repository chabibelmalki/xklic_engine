import type { SiteConfig } from "@/types/config";
import { buildMentionsLegales } from "@/lib/legal";
import { LegalDocPage } from "@/components/LegalDocPage";

/** Page /mentions-legales générée depuis `config.entreprise` (branchée statut). */
export function MentionsLegalesPage({
  config,
  basePath = "",
  locale,
}: {
  config: SiteConfig;
  basePath?: string;
  locale?: string;
}) {
  return (
    <LegalDocPage config={config} doc={buildMentionsLegales(config)} basePath={basePath} locale={locale} />
  );
}
