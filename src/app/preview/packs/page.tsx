import type { Metadata } from "next";
import type { SiteConfig, HeroContent } from "@/types/config";
import { Hero } from "@/blocks/Hero";
import { PACKS } from "@/lib/packs";
import { ui } from "@/i18n/ui";

/**
 * Route de DEV (noindex) : galerie de validation des STYLE PACKS. Rend le MÊME
 * contenu hero (variant `centre`), NEUTRE et sans métier, dans CHAQUE pack — pour
 * comparer les ambiances toutes choses égales par ailleurs : seuls la typo, les
 * formes, le fond, les ombres et le motion changent (la couleur, elle, vient du
 * `theme`, ici tenu constant). Aucun pack n'est associé à un secteur. Sert aux
 * captures Playwright.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Route de DEV (noindex) : rendu à la demande, hors prérendu (économie ISR writes).
export const dynamic = "force-dynamic";

/** Thème constant pour isoler la variable « pack » (la couleur est un autre axe). */
const THEME = "pro-bleu-nuit";

/** Contenu hero neutre, identique pour tous les packs (zéro biais métier). */
const NEUTRAL: HeroContent = {
  eyebrow: "Aperçu d'un style pack",
  titre: "Le même contenu,",
  titreAccent: "habillé par le pack",
  accroche:
    "Ce bloc est rendu à l'identique dans chaque pack : seuls la typographie, les formes, le fond, les ombres et le motion changent. La couleur, elle, est pilotée par le thème.",
  ctaPrimaire: { label: "Action principale", href: "#" },
  ctaSecondaire: { label: "Action secondaire", href: "#" },
  trust: [
    { icone: "Sparkles", label: "Design soigné" },
    { icone: "ShieldCheck", label: "Pro & fiable" },
    { icone: "Star", label: "Avis clients" },
    { icone: "Zap", label: "Mise en ligne rapide" },
  ],
};

function mockConfig(): SiteConfig {
  return {
    slug: "preview-packs",
    theme: THEME,
    branding: {},
    entreprise: { nom: "Demo", statut: "micro", siret: "", tva: { regime: "franchise" } },
    seo: { schemaType: "LocalBusiness", ville: "votre ville" },
    meta: {},
    blocks: [],
  };
}

export default function PacksGalleryPage() {
  const strings = ui("fr");

  return (
    <main className="bg-slate-100">
      {PACKS.map((p) => (
        <section key={p.id}>
          <div className="bg-slate-900 px-5 py-2 font-mono text-xs text-slate-300">
            data-pack=&quot;{p.id}&quot; — {p.label}
          </div>
          <div data-theme={THEME} data-pack={p.id} className="bg-bg text-ink">
            <Hero
              block={{ type: "hero", variant: "centre", content: NEUTRAL }}
              config={mockConfig()}
              index={0}
              tone="bg"
              basePath=""
              locale="fr"
              strings={strings}
            />
          </div>
        </section>
      ))}
    </main>
  );
}
