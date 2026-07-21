import { Menu, Phone } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderPhonePopover } from "@/components/layout/HeaderPhonePopover";
import { telHref, cn } from "@/lib/utils";
import { navPages, isMultiPage, resolvePages, findBlock } from "@/lib/pages";
import { LiveDot } from "../ui/Escale";

/**
 * HEADER escale — la BARRE D'OPÉRATIONS : bande claire, navigation en mono
 * capitales espacées (les intitulés d'un afficheur), état actif souligné d'un
 * VOLET d'accent, et un voyant « en service · 24/7 » à côté du numéro.
 *
 * Le numéro est composé avec `telHref` (et NON `telHrefIntl`, dont l'indicatif
 * par défaut est +33) : la config porte déjà le numéro au format international,
 * ce qui rend le lien juste quel que soit le pays du client.
 *
 * SERVER pur, menu mobile en `<details>` natif (zéro JS). Props = contrat de
 * famille (identiques à `SiteHeader`).
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

export function EscaleHeader({
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
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm supports-[backdrop-filter]:bg-bg/85">
      <div className="mx-auto flex h-16 w-full max-w-[var(--content-max)] items-center justify-between gap-4 px-6 sm:h-20 sm:px-10">
        <Logo config={config} href={basePath || "/"} className="min-w-0" />

        <nav className="hidden shrink-0 items-center gap-x-0.5 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "escale-mono relative inline-flex items-center whitespace-nowrap px-3 py-2 text-[0.68rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                item.active ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {/* Volet d'accent sous le mot actif. */}
              {item.active && (
                <span aria-hidden className="absolute inset-x-2 bottom-0.5 h-[3px] bg-accent-500" />
              )}
              <span className="relative">{item.label}</span>
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
                href={telHref(contact.telephone)}
                className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap transition-colors hover:text-brand-700"
              >
                <LiveDot />
                <span className="escale-mono text-[0.78rem] font-bold text-ink group-hover:text-brand-700">
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
                    "escale-mono flex items-center border-b border-border py-3.5 text-[0.72rem] font-bold last:border-0",
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
                    <Phone className="size-4" />
                    <span className="escale-mono text-sm font-bold">{contact.telephone}</span>
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
