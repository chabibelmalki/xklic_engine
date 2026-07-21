import { Menu, Phone, ChevronDown } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import { Logo } from "@/components/layout/Logo";
import { ServicesMega } from "./ServicesMega";
import { buildServicesMega } from "./services-menu";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderPhonePopover } from "@/components/layout/HeaderPhonePopover";
import { telHref, cn } from "@/lib/utils";
import { navPages, isMultiPage, resolvePages, findBlock } from "@/lib/pages";

/**
 * HEADER cascade — SERVER pur, VERRE translucide : fond `bg` semi-opaque +
 * `backdrop-blur`, liseré dégradé bleu→vert en bas (signature), nav en pilules,
 * CTA en pilule. Menu mobile natif via `<details>` (zéro JS). Props identiques à
 * `SiteHeader` (contrat de famille).
 */
type NavItem = { href: string; label: string; active: boolean };
const ANCHOR_FALLBACK: Record<string, string> = { etapes: "Étapes" };

function buildNav(config: SiteConfig, basePath: string, currentPath: string, nav: UIStrings["nav"]): NavItem[] {
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
  const contactBlock = config.blocks.find((b) => b.type === "contact")?.content as ContactContent | undefined;
  if (!config.blocks.some((b) => b.type === "contact")) return null;
  return { href: `${basePath}/#contact`, label: contactBlock?.form ? quote : contactLabel };
}

export function CascadeHeader({
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
  const mega = config.servicesMegaMenu && isMultiPage(config) ? buildServicesMega(config, basePath) : null;
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const cta = ctaTarget(config, basePath, strings);
  const showLangs = locales.length > 1;

  return (
    <header className="sticky top-0 z-50 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-5 px-6 sm:px-10">
        <Logo config={config} href={basePath || "/"} className="min-w-0" />

        <nav className="hidden shrink-0 items-center gap-x-1 lg:flex">
          {nav.map((item) =>
            mega && item.href === mega.href ? (
              <ServicesMega
                key={item.href}
                label={item.label}
                data={mega}
                active={item.active}
                overviewLabel={item.label}
              />
            ) : (
              <a
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  item.active ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                {item.label}
              </a>
            ),
          )}
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
            className="grid size-10 shrink-0 cursor-pointer list-none place-items-center rounded-full text-ink [&::-webkit-details-marker]:hidden"
          >
            <Menu className="open-i size-6" />
            <span className="close-i hidden text-2xl leading-none" aria-hidden>
              ×
            </span>
          </summary>
          <div className="absolute inset-x-0 top-full bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-md">
            <span
              aria-hidden
              className="block h-px w-full"
              style={{ background: "linear-gradient(90deg, var(--brand-500), var(--accent-500))" }}
            />
            <nav className="flex flex-col gap-1 px-6 py-4">
              {nav.map((item) =>
                mega && item.href === mega.href ? (
                  <details
                    key={item.href}
                    className="border-b border-border/60 last:border-0 [&[open]_.chev]:rotate-180"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                      {item.label}
                      <ChevronDown className="chev size-4 shrink-0 text-muted transition-transform" />
                    </summary>
                    <div className="pb-2">
                      <a href={mega.href} className="block py-2 ps-3 text-sm font-semibold text-brand-700">
                        {item.label}
                      </a>
                      {mega.categories.map((c) => (
                        <details key={c.href} className="border-t border-border/40 [&[open]_.chev2]:rotate-180">
                          <summary className="flex cursor-pointer list-none items-center justify-between py-2 ps-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                            {c.label}
                            <ChevronDown className="chev2 size-4 shrink-0 text-muted transition-transform" />
                          </summary>
                          <ul className="pb-1 ps-6">
                            {c.items.map((s) => (
                              <li key={s.href}>
                                <a href={s.href} className="block py-1.5 text-sm text-ink-soft">
                                  {s.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ))}
                    </div>
                  </details>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "border-b border-border/60 py-3 text-sm font-semibold last:border-0",
                      item.active ? "text-brand-700" : "text-ink",
                    )}
                  >
                    {item.label}
                  </a>
                ),
              )}
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
      {/* Liseré dégradé bleu→vert (signature de la famille). */}
      <span
        aria-hidden
        className="block h-px w-full"
        style={{ background: "linear-gradient(90deg, var(--brand-500), var(--accent-500))" }}
      />
    </header>
  );
}
