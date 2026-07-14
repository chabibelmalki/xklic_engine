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
 * HEADER foyer — SERVER pur, CHALEUREUX : barre claire crème, filet BAS
 * pointillé (couture) pleine largeur, logo à gauche, nav à droite en pastilles
 * arrondies (état actif = pastille de marque douce), CTA en pilule d'accent
 * miel. Menu mobile natif `<details>` (zéro JS). Registre domestique, distinct
 * du liseré épais + nav centrée d'`epure` et du filet technique de `signal`.
 * Props = contrat de famille (identiques à SiteHeader).
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

export function FoyerHeader({
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
    <header className="sticky top-0 z-50 border-b border-dashed border-brand-200 bg-bg/95 backdrop-blur-sm supports-[backdrop-filter]:bg-bg/80">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[minmax(0,auto)_1fr_auto] items-center gap-4 px-5 sm:h-20 sm:px-8 lg:px-10">
        <Logo config={config} href={basePath || "/"} className="min-w-0" />

        {/* Nav à droite en pastilles arrondies (desktop). */}
        <nav className="col-start-2 hidden items-center justify-end gap-x-1 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                item.active
                  ? "bg-brand-100 text-brand-800"
                  : "text-ink-soft hover:bg-brand-50 hover:text-brand-800",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions (desktop). */}
        <div className="hidden items-center justify-end gap-3 lg:flex">
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
            <Button href={cta.href} variant="accent" size="sm">
              {cta.label}
            </Button>
          )}
        </div>

        {/* Menu mobile : <details> natif — zéro JS. */}
        <details className="group col-start-3 justify-self-end lg:hidden [&_.open-i]:block [&_.close-i]:hidden [&[open]_.open-i]:hidden [&[open]_.close-i]:block">
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
            <nav className="flex flex-col gap-1 px-5 py-4 sm:px-8">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "border-b border-dashed border-brand-200/70 py-3 text-sm font-semibold last:border-0",
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
                  <Button href={cta.href} variant="accent" size="lg">
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
