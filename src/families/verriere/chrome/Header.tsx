import { Menu, Phone } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderPhonePopover } from "@/components/layout/HeaderPhonePopover";
import { telHref, telHrefIntl, telIndicatif, telNeedsIndicatif, cn } from "@/lib/utils";
import { navPages, isMultiPage, resolvePages, findBlock } from "@/lib/pages";
import { FiletFerronnerie, Ombelle } from "../ui/Verriere";

/**
 * HEADER verrière — SERVER pur : une traverse de papier ivoire fermée en bas par
 * le FILET DE FERRONNERIE (rivets de laiton sur fer forgé), jamais une bordure
 * plate ni un dégradé.
 *
 * L'état actif est un JONC DE LAITON sous le mot, précédé d'une ombelle : le
 * fleuron qui marque la page où l'on se trouve. Menu mobile en `<details>` natif
 * (zéro JS). Props = contrat de famille (identiques à `SiteHeader`).
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

export function VerriereHeader({
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
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm supports-[backdrop-filter]:bg-bg/85">
      <div className="mx-auto flex h-16 w-full max-w-[var(--content-max)] items-center justify-between gap-4 px-6 sm:h-20 sm:px-10">
        <Logo config={config} href={basePath || "/"} className="min-w-0" />

        <nav className="hidden shrink-0 items-center gap-x-1 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                item.active ? "text-brand-700" : "text-muted hover:text-ink",
              )}
            >
              {item.active && <Ombelle className="size-3.5 shrink-0 text-accent-600" />}
              {item.label}
              {/* Jonc de laiton : le fleuron de la page courante. */}
              {item.active && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-0.5 h-px bg-accent-500"
                />
              )}
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
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold text-ink transition-colors hover:text-brand-700"
              >
                <Phone className="size-4 shrink-0 text-brand-700" />
                <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                  {telNeedsIndicatif(contact.telephone) && (
                    <span className="text-[0.78em] font-medium text-muted">{telIndicatif()}</span>
                  )}
                  {contact.telephone}
                </span>
              </a>
            ))}
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
            <nav className="flex flex-col px-6 py-4 sm:px-10">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 border-b border-border py-3.5 text-sm font-medium last:border-0",
                    item.active ? "text-brand-700" : "text-muted",
                  )}
                >
                  {item.active && <Ombelle className="size-3.5 shrink-0 text-accent-600" />}
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

      {/* Filet de ferronnerie : la signature du chrome. */}
      <FiletFerronnerie />
    </header>
  );
}
