import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

// Police display (titres) + corps. Exposées en variables CSS consommées par
// les tokens de thème (--font-display / --font-sans dans globals.css).
const display = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

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
      className={`${display.variable} ${sans.variable} h-full`}
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
