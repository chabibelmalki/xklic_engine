"use client";

import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderPhonePopover } from "./HeaderPhonePopover";
import { cn, telHref } from "@/lib/utils";
import { navPages, isMultiPage, resolvePages, findBlock } from "@/lib/pages";

type NavItem = { href: string; label: string; active: boolean };

/** Libellés d'ancres (one-pager). `etapes` n'a pas d'entrée dans le dico nav. */
const ANCHOR_FALLBACK: Record<string, string> = { etapes: "Étapes" };

/** Nav par PAGES (multi-page) ou par ancres de blocs (one-pager). */
function buildNav(
  config: SiteConfig,
  basePath: string,
  currentPath: string,
  nav: UIStrings["nav"],
): NavItem[] {
  if (isMultiPage(config)) {
    // L'accueil n'est pas listé (le logo y mène).
    return navPages(config)
      .filter((p) => !p.isHome)
      .map((p) => ({
        href: `${basePath}${p.path}`,
        label: p.label,
        active: p.path === currentPath,
      }));
  }
  // One-pager : ancres vers les blocs présents.
  const labels = nav as Record<string, string>;
  const seen = new Set<string>();
  const items: NavItem[] = [];
  for (const b of config.blocks) {
    const label = labels[b.type] ?? ANCHOR_FALLBACK[b.type];
    if (!label || seen.has(b.type)) continue;
    if (b.type === "contact") continue; // CTA dédié
    if (b.type === "zone" && b.mode === "aucune") continue;
    seen.add(b.type);
    items.push({ href: `${basePath}/#${b.type}`, label, active: false });
  }
  return items;
}

/** Cible du CTA principal : page devis > page contact > ancre #contact. */
function ctaTarget(
  config: SiteConfig,
  basePath: string,
  strings: UIStrings,
): { href: string; label: string } | null {
  const quote = strings.header.freeQuote;
  const contactLabel = strings.nav.contact;
  if (isMultiPage(config)) {
    const pages = resolvePages(config);
    const devis = pages.find((p) => p.slug === "devis");
    const contact = pages.find((p) => p.slug === "contact");
    const target = devis ?? contact;
    if (!target) return null;
    return { href: `${basePath}${target.path}`, label: devis ? quote : contactLabel };
  }
  const hasContact = config.blocks.some((b) => b.type === "contact");
  if (!hasContact) return null;
  const contactBlock = config.blocks.find((b) => b.type === "contact")?.content as
    | ContactContent
    | undefined;
  return { href: `${basePath}/#contact`, label: contactBlock?.form ? quote : contactLabel };
}

export function SiteHeader({
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloque le scroll du body quand le menu mobile est ouvert.
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
          ? "border-b border-border bg-bg/85 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:h-20">
        <Logo config={config} href={basePath || "/"} className="min-w-0" />

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                item.active
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
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
                href={telHref(contact.telephone)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-700"
              >
                <Phone className="size-4 text-brand-600" />
                {contact.telephone}
              </a>
            ))}
          {cta && (
            <Button href={cta.href} size="sm">
              {cta.label}
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-ink transition-colors hover:bg-surface-2 lg:hidden"
          aria-label={open ? strings.header.closeMenu : strings.header.openMenu}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-border bg-bg transition-[max-height] duration-300 ease-in-out lg:hidden",
          open ? "max-h-[42rem] border-t" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "rounded-xl px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500",
                item.active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink hover:bg-brand-50 hover:text-brand-700",
              )}
            >
              {item.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2.5">
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
              <Button href={cta.href} size="lg" onClick={() => setOpen(false)}>
                {cta.label}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
