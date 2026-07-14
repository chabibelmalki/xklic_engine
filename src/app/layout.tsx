import type { Metadata } from "next";
import {
  Poppins,
  Inter,
  Playfair_Display,
  Oswald,
  Plus_Jakarta_Sans,
  Bricolage_Grotesque,
  DM_Sans,
  Fraunces,
  Nunito_Sans,
  Great_Vibes,
  Libre_Baskerville,
  Bodoni_Moda,
  Cormorant_Garamond,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

/**
 * Polices des STYLE PACKS. Chaque pack mappe `--pack-font-display` /
 * `--pack-font-sans` (globals.css) vers l'une de ces variables. Toutes sont
 * déclarées ici mais le navigateur ne télécharge QUE celles réellement rendues
 * par le pack actif d'un site (un seul pack par site) — `preload:false` évite de
 * précharger les polices non utilisées. `display:swap` partout (perf/SEO).
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  preload: false,
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  preload: false,
});
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  preload: false,
});
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  preload: false,
});
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  preload: false,
});
const dmSans = DM_Sans({ variable: "--font-dmsans", subsets: ["latin"], display: "swap", preload: false });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});
const nunito = Nunito_Sans({ variable: "--font-nunito", subsets: ["latin"], display: "swap", preload: false });
// Calligraphie (titres uniquement) — pack rose-noir-premium.
const greatVibes = Great_Vibes({
  variable: "--font-greatvibes",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});
const libreBaskerville = Libre_Baskerville({
  variable: "--font-librebaskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});
// Didone couture (titres display) — pack prestige-nuit.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
});
// Serif haute contraste (titres display) — pack cotier-marine (famille littoral).
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  preload: false,
});
// Sans géométrique technique (titres display) — pack signal-graphite (famille signal).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  preload: false,
});

const fontVars = [
  poppins,
  inter,
  playfair,
  oswald,
  jakarta,
  bricolage,
  dmSans,
  fraunces,
  nunito,
  greatVibes,
  libreBaskerville,
  bodoni,
  cormorant,
  spaceGrotesk,
]
  .map((f) => f.variable)
  .join(" ");

// Métadonnée globale neutre — chaque site fournit ses propres metadata via
// generateMetadata (uniques par site, pas de boilerplate partagé).
export const metadata: Metadata = {
  title: "Moteur de sites vitrines",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${fontVars} h-full`}
    >
      <head>
        {/* Sans JS, les blocs Reveal restent visibles (jamais bloqués à opacity:0). */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
