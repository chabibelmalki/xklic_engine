import { Menu, Phone } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderPhonePopover } from "@/components/layout/HeaderPhonePopover";
import { telHref, cn } from "@/lib/utils";
import { navPages, isMultiPage, resolvePages, findBlock } from "@/lib/pages";

/**
 * HEADER éditorial — SERVER pur : flat, filet bas fin, pas d'effet scroll (donc
 * aucun JS). Menu mobile natif via `<details>` (zéro dépendance client, bon pour
 * le LCP/SEO). `LanguageSwitcher` (îlot client) n'apparaît qu'en multilingue.
 * Props identiques à `SiteHeader` (contrat de famille).
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

export function EditorialHeader({
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
  const nav = buildNav(config, basePath, currentPath, strings.nav);
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const cta = ctaTarget(config, basePath, strings);
  const showLangs = locales.length > 1;

  return (
    <header className="relative sticky top-0 z-50 border-b border-border bg-bg">
      {/* Barre chrome : mesure LARGE dédiée (indépendante de --content-max, qui
          est la mesure ÉTROITE du corps de texte) → la nav tient sur une ligne. */}
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-8 px-6 sm:px-10">
        <Logo config={config} href={basePath || "/"} className="min-w-0" />

        <nav className="hidden shrink-0 items-center gap-x-6 lg:flex xl:gap-x-8">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                item.active ? "text-brand-700" : "text-muted hover:text-ink",
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
            <HeaderPhonePopover
              telephone={contact.telephone}
              callLabel={strings.header.callUs}
              copyLabel={strings.header.copyNumber}
              copiedLabel={strings.header.numberCopied}
            />
          )}
          {cta && (
            <Button href={cta.href} size="sm">
              {cta.label}
            </Button>
          )}
        </div>

        {/* Menu mobile : <details> natif — zéro JS, accessible clavier. */}
        <details className="group lg:hidden [&_.open-i]:block [&_.close-i]:hidden [&[open]_.open-i]:hidden [&[open]_.close-i]:block">
          <summary
            aria-label={strings.header.openMenu}
            className="grid size-10 shrink-0 cursor-pointer list-none place-items-center text-ink [&::-webkit-details-marker]:hidden"
          >
            <Menu className="open-i size-6" />
            <span className="close-i hidden text-2xl leading-none" aria-hidden>
              ×
            </span>
          </summary>
          <div className="absolute inset-x-0 top-full border-b border-border bg-bg">
            <nav className="flex flex-col gap-1 px-6 py-4">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "border-b border-border/60 py-3 text-sm font-semibold uppercase tracking-[0.14em] last:border-0",
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
