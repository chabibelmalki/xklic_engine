"use client";

import { useEffect, useState } from "react";
import { Menu, Phone } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderPhonePopover } from "@/components/layout/HeaderPhonePopover";
import { telHref, telHrefIntl, telIndicatif, telNeedsIndicatif, cn } from "@/lib/utils";
import { navPages, isMultiPage, resolvePages, getHomePage, findBlock } from "@/lib/pages";

/**
 * HEADER éclat — bande blanche minimale réglée en bas par un simple FILET.
 *
 * En-tête IMMERSIF (opt-in) : quand le 1er bloc de la page est un hero plein
 * cadre (`plein`/`fondu` avec image) ET `content.headerOverlay === true`, le
 * header se pose EN OVERLAY par-dessus l'image — transparent + texte clair en
 * haut de page, puis solide (blanc, filet) au scroll. Sinon il reste solide et
 * lisible. Client (détection du scroll) ; menu mobile en `<details>` natif.
 * Props = contrat de famille.
 */

type NavItem = { href: string; label: string; active: boolean };
const ANCHOR_FALLBACK: Record<string, string> = { etapes: "Étapes" };

function buildNav(
  config: SiteConfig,
  basePath: string,
  currentPath: string,
  nav: UIStrings["nav"],
): NavItem[] {
  if (isMultiPage(config)) {
    return navPages(config)
      .filter((p) => !p.isHome)
      .map((p) => ({
        href: `${basePath}${p.path}`,
        label: p.label,
        active: p.path === currentPath,
      }));
  }
  const labels = nav as Record<string, string>;
  const seen = new Set<string>();
  const items: NavItem[] = [];
  for (const b of config.blocks) {
    const label = labels[b.type] ?? ANCHOR_FALLBACK[b.type];
    if (!label || seen.has(b.type)) continue;
    if (b.type === "contact") continue;
    if (b.type === "zone" && b.mode === "aucune") continue;
    seen.add(b.type);
    items.push({ href: `${basePath}/#${b.type}`, label, active: false });
  }
  return items;
}

function ctaTarget(config: SiteConfig, basePath: string, strings: UIStrings) {
  const quote = strings.header.freeQuote;
  const contactLabel = strings.nav.contact;
  if (isMultiPage(config)) {
    const pages = resolvePages(config);
    const target = pages.find((p) => p.slug === "devis") ?? pages.find((p) => p.slug === "contact");
    if (!target) return null;
    return {
      href: `${basePath}${target.path}`,
      label: target.slug === "devis" ? quote : contactLabel,
    };
  }
  const contactBlock = config.blocks.find((b) => b.type === "contact")?.content as
    | ContactContent
    | undefined;
  if (!config.blocks.some((b) => b.type === "contact")) return null;
  return { href: `${basePath}/#contact`, label: contactBlock?.form ? quote : contactLabel };
}

export function EclatHeader({
  config,
  basePath,
  currentPath = "/",
  locale,
  locales,
  defaultLocale,
  strings,
}: {
  config: SiteConfig;
  basePath: string;
  currentPath?: string;
  locale: string;
  locales: string[];
  defaultLocale: string;
  strings: UIStrings;
}) {
  const [scrolled, setScrolled] = useState(false);

  const nav = buildNav(config, basePath, currentPath, strings.nav);
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const cta = ctaTarget(config, basePath, strings);
  const showLangs = locales.length > 1;

  // Immersif : détecté sur la page COURANTE (donc l'overlay n'affecte que la page
  // qui a le hero plein cadre — l'accueil, pas les pages internes).
  const pages = resolvePages(config);
  const currentPage = pages.find((p) => p.path === currentPath) ?? getHomePage(config);
  const firstBlock = currentPage.blocks?.[0] as
    | { type?: string; variant?: string; content?: { image?: unknown; headerOverlay?: boolean } }
    | undefined;
  const immersive =
    firstBlock?.type === "hero" &&
    (firstBlock.variant === "plein" || firstBlock.variant === "fondu") &&
    !!firstBlock.content?.image &&
    firstBlock.content?.headerOverlay === true;
  const overlay = immersive && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        overlay
          ? // Vraiment TRANSPARENT au-dessus du hero (aucun verre teinté) : la
            // lisibilité du texte clair est portée par le dégradé du hero lui-même.
            "bg-transparent"
          : "border-b border-border bg-bg/90 backdrop-blur-sm supports-[backdrop-filter]:bg-bg/75",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[var(--content-max)] items-center justify-between gap-4 px-6 sm:h-20 sm:px-10">
        <Logo config={config} href={basePath || "/"} variant={overlay ? "light" : "default"} className="min-w-0" />

        <nav className="hidden shrink-0 items-center gap-x-1 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "relative inline-flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                overlay
                  ? "text-white/85 hover:text-white"
                  : item.active
                    ? "text-ink"
                    : "text-muted hover:text-ink",
              )}
            >
              {item.active && !overlay && (
                <span aria-hidden className="absolute inset-x-3 -bottom-[1px] h-0.5 bg-brand-500" />
              )}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {showLangs && (
            <LanguageSwitcher
              locales={locales}
              current={locale}
              defaultLocale={defaultLocale}
              basePath={basePath}
              ariaLabel={strings.header.language}
            />
          )}
          {contact?.telephone &&
            (contact.telephoneHeader === "icone-popup" ? (
              <HeaderPhonePopover
                telephone={contact.telephone}
                callLabel={strings.header.callUs}
                copyLabel={strings.header.copyNumber}
                copiedLabel={strings.header.numberCopied}
              />
            ) : (
              <a
                href={telHrefIntl(contact.telephone)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors",
                  overlay ? "text-white hover:text-white/80" : "text-ink hover:text-brand-700",
                )}
              >
                <Phone className={cn("size-4 shrink-0", overlay ? "text-white" : "text-brand-600")} />
                <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                  {telNeedsIndicatif(contact.telephone) && (
                    <span className={cn("text-[0.78em] font-medium", overlay ? "text-white/70" : "text-muted")}>
                      {telIndicatif()}
                    </span>
                  )}
                  {contact.telephone}
                </span>
              </a>
            ))}
          {cta && (
            <Button href={cta.href} size="sm" variant={overlay ? "white" : "primary"}>
              {cta.label}
            </Button>
          )}
        </div>

        {/* Menu mobile : <details> natif — zéro JS, accessible clavier. */}
        <details className="group lg:hidden [&_.open-i]:block [&_.close-i]:hidden [&[open]_.open-i]:hidden [&[open]_.close-i]:block">
          <summary
            aria-label={strings.header.openMenu}
            className={cn(
              "grid size-10 shrink-0 cursor-pointer list-none place-items-center [&::-webkit-details-marker]:hidden",
              overlay ? "text-white" : "text-ink",
            )}
          >
            <Menu className="open-i size-6" />
            <span className="close-i hidden text-2xl leading-none" aria-hidden>
              ×
            </span>
          </summary>
          <div className="absolute inset-x-0 top-full border-b border-border bg-bg">
            <nav className="flex flex-col px-6 py-4 sm:px-10">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "flex items-center border-b border-border py-3.5 text-sm font-medium last:border-0",
                    item.active ? "text-brand-700" : "text-muted",
                  )}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-5 flex flex-col gap-2.5">
                {showLangs && (
                  <LanguageSwitcher
                    locales={locales}
                    current={locale}
                    defaultLocale={defaultLocale}
                    basePath={basePath}
                    ariaLabel={strings.header.language}
                    className="self-start"
                  />
                )}
                {contact?.telephone && (
                  <Button href={telHref(contact.telephone)} variant="outline" size="lg">
                    <Phone className="size-4" /> {contact.telephone}
                  </Button>
                )}
                {cta && (
                  <Button href={cta.href} size="lg">
                    {cta.label}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
