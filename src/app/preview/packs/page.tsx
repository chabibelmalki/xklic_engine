import type { Metadata } from "next";
import type { SiteConfig, HeroContent } from "@/types/config";
import { Hero } from "@/blocks/Hero";
import { PACKS } from "@/lib/packs";
import { ui } from "@/i18n/ui";

/**
 * Route de DEV (noindex) : galerie de validation des STYLE PACKS. Rend le MÊME
 * bloc hero (variant `centre`) dans chaque pack signé, pour comparer les
 * ambiances toutes choses égales par ailleurs (la différence ne vient alors que
 * du pack : typo, couleur, fond, formes, motion). Sert aux captures Playwright.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Sample {
  pack: string;
  ville: string;
  content: HeroContent;
}

const SAMPLES: Sample[] = [
  {
    pack: "maison-premium",
    ville: "Osny",
    content: {
      eyebrow: "Pâtisserie artisanale · Osny",
      titre: "Des gâteaux d'exception pour",
      titreAccent: "vos plus beaux moments",
      accroche:
        "Pièces montées, wedding cakes et créations sur mesure, façonnés maison avec des ingrédients nobles et une finition d'orfèvre.",
      ctaPrimaire: { label: "Demander un devis", href: "#" },
      ctaSecondaire: { label: "Voir les créations", href: "#" },
      trust: [
        { icone: "ChefHat", label: "Fait maison" },
        { icone: "Award", label: "Sur mesure" },
        { icone: "Heart", label: "Ingrédients nobles" },
        { icone: "Star", label: "Avis 5 / 5" },
      ],
    },
  },
  {
    pack: "atelier-industriel",
    ville: "Cergy",
    content: {
      eyebrow: "Garage indépendant · Cergy",
      titre: "L'entretien auto sans",
      titreAccent: "mauvaise surprise",
      accroche:
        "Révision, freinage, pneus, diagnostic : devis clair AVANT intervention, rendez-vous sous 48 h. Toutes marques.",
      ctaPrimaire: { label: "Prendre rendez-vous", href: "#" },
      ctaSecondaire: { label: "Voir les forfaits", href: "#" },
      trust: [
        { icone: "Wrench", label: "Toutes marques" },
        { icone: "ShieldCheck", label: "Devis transparent" },
        { icone: "Clock", label: "RDV sous 48 h" },
        { icone: "Gauge", label: "Diagnostic offert" },
      ],
    },
  },
  {
    pack: "clair-frais",
    ville: "Nîmes",
    content: {
      eyebrow: "Ménage à domicile · Nîmes",
      titre: "Un intérieur impeccable,",
      titreAccent: "sans y penser",
      accroche:
        "Ménage régulier ou ponctuel, repassage, grand nettoyage. Intervenants de confiance et crédit d'impôt de 50 %.",
      ctaPrimaire: { label: "Devis gratuit", href: "#" },
      ctaSecondaire: { label: "Nos prestations", href: "#" },
      trust: [
        { icone: "Sparkles", label: "Crédit d'impôt 50 %" },
        { icone: "ShieldCheck", label: "Personnel assuré" },
        { icone: "CalendarCheck", label: "Sans engagement" },
        { icone: "Star", label: "Clients ravis" },
      ],
    },
  },
  {
    pack: "pop-moderne",
    ville: "Lyon",
    content: {
      eyebrow: "Coaching sportif · Lyon",
      titre: "Transforme ton corps,",
      titreAccent: "à ton rythme",
      accroche:
        "Coaching personnalisé en salle, à domicile ou en visio. Programme sur mesure, suivi nutrition et motivation au quotidien.",
      ctaPrimaire: { label: "Séance d'essai offerte", href: "#" },
      ctaSecondaire: { label: "Les formules", href: "#" },
      trust: [
        { icone: "Dumbbell", label: "Programmes perso" },
        { icone: "Flame", label: "Résultats visibles" },
        { icone: "Video", label: "En visio aussi" },
        { icone: "Trophy", label: "Coach diplômé" },
      ],
    },
  },
  {
    pack: "terra-naturel",
    ville: "Aix-en-Provence",
    content: {
      eyebrow: "Paysagiste · Aix-en-Provence",
      titre: "Des extérieurs qui",
      titreAccent: "respirent la nature",
      accroche:
        "Création et entretien de jardins, terrasses et espaces verts. Approche durable, plantes locales, crédit d'impôt 50 %.",
      ctaPrimaire: { label: "Demander un devis", href: "#" },
      ctaSecondaire: { label: "Nos réalisations", href: "#" },
      trust: [
        { icone: "Leaf", label: "Éco-responsable" },
        { icone: "Sprout", label: "Sur mesure" },
        { icone: "Sun", label: "Entretien annuel" },
        { icone: "Star", label: "Clients fidèles" },
      ],
    },
  },
];

function mockConfig(ville: string): SiteConfig {
  return {
    slug: "preview-packs",
    theme: "pro-bleu-nuit",
    branding: {},
    entreprise: { nom: "Demo", statut: "micro", siret: "", tva: { regime: "franchise" } },
    seo: { schemaType: "LocalBusiness", ville },
    meta: {},
    blocks: [],
  };
}

export default function PacksGalleryPage() {
  const strings = ui("fr");
  const labelOf = (id: string) => PACKS.find((p) => p.id === id)?.label ?? id;

  return (
    <main className="bg-slate-100">
      {SAMPLES.map((s) => (
        <section key={s.pack}>
          <div className="bg-slate-900 px-5 py-2 font-mono text-xs text-slate-300">
            data-pack=&quot;{s.pack}&quot; — {labelOf(s.pack)}
          </div>
          <div data-theme="pro-bleu-nuit" data-pack={s.pack} className="bg-bg text-ink">
            <Hero
              block={{ type: "hero", variant: "centre", content: s.content }}
              config={mockConfig(s.ville)}
              index={0}
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
