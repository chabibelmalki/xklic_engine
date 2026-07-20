"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { telHref, cn } from "@/lib/utils";
import { navPages, isMultiPage, resolvePages, getHomePage, findBlock } from "@/lib/pages";

/**
 * HEADER aronde — CLIENT (bascule overlay). Barre CLAIRE d'atelier par défaut
 * (fond `bg`, arête espresso, nav MAJUSCULE espacée avec marqueur CARRÉ caramel,
 * téléphone en clair). Quand le 1er bloc de la page est un hero plein cadre avec
 * image + `headerOverlay`, le header se pose EN OVERLAY par-dessus (transparent,
 * voile sombre en tête, logo/nav/tél en BLANC) puis redevient solide au scroll.
 * Le logo raster (noir sur transparent) étant illisible sur le bois sombre, on
 * rend le NOM en wordmark blanc en mode overlay (comme le footer). Props
 * identiques à `SiteHeader` (contrat de famille).
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
      .map((p) => ({ href: `${basePath}${p.path}`, label: p.label, active: p.path === currentPath }));
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
    return { href: `${basePath}${target.path}`, label: target.slug === "devis" ? quote : contactLabel };
  }
  const contactBlock = config.blocks.find((b) => b.type === "contact")?.content as
    | ContactContent
    | undefined;
  if (!config.blocks.some((b) => b.type === "contact")) return null;
  return { href: `${basePath}/#contact`, label: contactBlock?.form ? quote : contactLabel };
}

export function ArondeHeader({
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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const nav = buildNav(config, basePath, currentPath, strings.nav);
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const cta = ctaTarget(config, basePath, strings);
  const showLangs = locales.length > 1;

  // Overlay opt-in : 1er bloc de la page courante = hero plein cadre avec image
  // + headerOverlay. Détecté par page → n'affecte que la page concernée.
  const pages = resolvePages(config);
  const currentPage = pages.find((p) => p.path === currentPath) ?? getHomePage(config);
  const firstBlock = currentPage.blocks?.[0] as
    | { type?: string; content?: { image?: unknown; headerOverlay?: boolean } }
    | undefined;
  const immersive =
    firstBlock?.type === "hero" &&
    !!firstBlock.content?.image &&
    firstBlock.content?.headerOverlay === true;
  const overlay = immersive && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b-2 border-brand-800 bg-bg/95 backdrop-blur-sm supports-[backdrop-filter]:bg-bg/80"
          : immersive
            ? "bg-gradient-to-b from-ink/55 via-ink/20 to-transparent"
            : "border-b-2 border-brand-800 bg-bg/95 backdrop-blur-sm supports-[backdrop-filter]:bg-bg/80",
      )}
    >
      <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-8 px-6 sm:h-24 sm:px-10">
        {/* Logo : image (noir) sur header clair ; wordmark blanc en overlay. */}
        {overlay ? (
          <Link
            href={basePath || "/"}
            aria-label={config.entreprise.nom}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0"
          >
            <span className="font-display text-xl font-bold tracking-tight text-white">
              {config.entreprise.nom}
            </span>
          </Link>
        ) : (
          <Logo
            config={config}
            href={basePath || "/"}
            layout="stacked"
            className="min-w-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0"
          />
        )}

        <nav className="hidden shrink-0 items-center gap-x-6 lg:flex xl:gap-x-8">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap py-1 text-xs font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                overlay
                  ? item.active
                    ? "text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:mx-auto after:h-1.5 after:w-1.5 after:rounded-[1px] after:bg-accent-500"
                    : "text-white/80 hover:text-white"
                  : item.active
                    ? "text-brand-800 after:absolute after:inset-x-0 after:-bottom-0.5 after:mx-auto after:h-1.5 after:w-1.5 after:rounded-[1px] after:bg-accent-500"
                    : "text-muted hover:text-brand-800",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          {showLangs && (
            <LanguageSwitcher
              locales={locales}
              current={locale}
              defaultLocale={defaultLocale}
              basePath={basePath}
              ariaLabel={strings.header.language}
            />
          )}
          {contact?.telephone && (
            <a
              href={telHref(contact.telephone)}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors",
                overlay ? "text-white hover:text-white/80" : "text-brand-800 hover:text-brand-600",
              )}
            >
              <Phone className={cn("size-4", overlay ? "text-white" : "text-brand-600")} />
              {contact.telephone}
            </a>
          )}
          {cta && (
            <Button href={cta.href} variant="accent" size="sm">
              {cta.label}
            </Button>
          )}
        </div>

        {/* Menu mobile : bouton + panneau piloté par état (React) — le header
            redevient solide quand le menu est ouvert. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? strings.header.closeMenu : strings.header.openMenu}
          aria-expanded={open}
          aria-controls="aronde-mobile-menu"
          className={cn(
            "ml-auto grid size-10 shrink-0 place-items-center rounded-[3px] transition-colors lg:hidden",
            overlay ? "text-white hover:bg-white/10" : "text-brand-800 hover:bg-surface-2",
          )}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div
        id="aronde-mobile-menu"
        className={cn(
          "overflow-hidden border-brand-800 bg-bg transition-[max-height] duration-300 ease-in-out lg:hidden",
          open ? "max-h-[42rem] border-b-2" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "border-b border-brand-100/70 py-3 text-sm font-semibold uppercase tracking-[0.14em] last:border-0",
                item.active ? "text-brand-700" : "text-ink",
              )}
            >
              {item.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2.5">
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
              <Button href={cta.href} variant="accent" size="lg" onClick={() => setOpen(false)}>
                {cta.label}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
