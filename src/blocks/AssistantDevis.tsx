import type { AssistantDevisContent, ContactContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { findBlock } from "@/lib/pages";
import { AssistantDevisWizard } from "@/components/AssistantDevisWizard";

/**
 * Bloc `assistantDevis` — enveloppe SERVEUR : lit le contenu + les coordonnées
 * (téléphone/WhatsApp sourcés sur tout le site) et rend l'assistant client
 * multi-étapes. Envoi direct via /api/contact (mode "devis"). Registre classic →
 * disponible à toutes les familles (repli). Couleurs 100 % tokens.
 */
export function AssistantDevis({
  block,
  config,
  tone,
  turnstileSiteKey,
}: BlockComponentProps<AssistantDevisContent>) {
  const c = block.content;
  const contact = findBlock<ContactContent>(config, "contact")?.content;

  return (
    <Section id="devis" tone={tone}>
      <div className="mx-auto max-w-2xl">
        {c.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">{c.eyebrow}</p>
        )}
        {c.titre && (
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            {c.titre}
          </h2>
        )}
        {c.intro && <p className="mt-4 text-lg leading-relaxed text-muted">{c.intro}</p>}
        <div className="mt-8">
          <AssistantDevisWizard
            site={config.entreprise.nom}
            siteSlug={config.slug}
            buildingTypes={c.buildingTypes}
            services={c.services}
            villes={c.villes}
            confidentialiteHref={c.confidentialiteHref}
            submitLabel={c.submitLabel}
            turnstileSiteKey={turnstileSiteKey}
            telephone={contact?.telephone}
            whatsapp={contact?.whatsapp}
          />
        </div>
      </div>
    </Section>
  );
}
