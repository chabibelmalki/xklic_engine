import Image from "next/image";
import { Menu, Phone } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import type { UIStrings } from "@/i18n/ui";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { telHrefIntl, telIndicatif, telNeedsIndicatif, cn } from "@/lib/utils";
import { navPages, isMultiPage, resolvePages, findBlock } from "@/lib/pages";

/**
 * HEADER prestige — SERVER pur, registre nocturne : fond `void`, filet MÉTALLIQUE
 * doré en bas, wordmark maison (display Bodoni). Sobre mais affirmé, avec la
 * RÉSERVATION toujours visible (numéro + bouton or). Menu mobile natif `<details>`
 * (zéro JS). Props identiques à `SiteHeader` (contrat de famille).
 */

type NavItem = { href: string; label: string; active: boolean };
const ANCHOR_FALLBACK: Record<string, string> = { etapes: "Étapes" };

function buildNav(
  config: SiteConfig,
  basePath: string,
  currentPath: string,
  nav: UIStrings["nav"],
  excludeSlug?: string,
): NavItem[] {
  if (isMultiPage(config)) {
    // On EXCLUT la page cible du CTA (déjà présente en bouton OR à droite) pour
    // ne pas afficher deux fois le même lien (ex. « Contact »).
    return navPages(config)
      .filter((p) => !p.isHome && p.slug !== excludeSlug)
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
    return {
      href: `${basePath}${target.path}`,
      label: target.slug === "devis" ? quote : contactLabel,
      slug: target.slug,
    };
  }
  const contactBlock = config.blocks.find((b) => b.type === "contact")?.content as
    | ContactContent
    | undefined;
  if (!config.blocks.some((b) => b.type === "contact")) return null;
  return { href: `${basePath}/#contact`, label: contactBlock?.form ? quote : contactLabel, slug: "contact" };
}

/**
 * Wordmark maison : emblème (logo rogné, fond transparent) À GAUCHE + nom en
 * display et sous-titre en capitales orangées empilés à droite. Sans logo, le
 * texte seul (repli propre).
 */
function Wordmark({ config, href }: { config: SiteConfig; href: string }) {
  const { logo, logoAlt, tagline } = config.branding;
  return (
    <a href={href} aria-label={config.entreprise.nom} className="group flex min-w-0 items-center gap-3 sm:gap-4">
      {logo && (
        <Image
          src={logo}
          alt={logoAlt ?? config.entreprise.nom}
          width={128}
          height={128}
          priority
          className="h-11 w-auto shrink-0 object-contain sm:h-14"
        />
      )}
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {config.entreprise.nom}
        </span>
        {tagline && (
          <span className="mt-1.5 truncate text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--px-gold)]">
            {tagline}
          </span>
        )}
      </span>
    </a>
  );
}

export function PrestigeHeader({
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
  const cta = ctaTarget(config, basePath, strings);
  const nav = buildNav(config, basePath, currentPath, strings.nav, cta?.slug);
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const showLangs = locales.length > 1;
  const tel = contact?.telephone;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--px-hairline)] bg-[var(--px-void)]/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-8 px-6 sm:px-10">
        <Wordmark config={config} href={basePath || "/"} />

        <nav className="hidden shrink-0 items-center gap-x-7 lg:flex xl:gap-x-9">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--px-gold)]",
                item.active ? "text-[var(--px-gold)]" : "text-white/70 hover:text-white",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-6 lg:flex">
          {showLangs && (
            <LanguageSwitcher
              locales={locales}
              current={locale}
              defaultLocale={defaultLocale}
              basePath={basePath}
              ariaLabel={strings.header.language}
            />
          )}
          {tel && (
            <a
              href={telHrefIntl(tel)}
              className="inline-flex items-center gap-2 text-sm font-semibold tabular-nums tracking-tight text-white transition-colors hover:text-[var(--px-gold)]"
            >
              <Phone className="size-4 text-[var(--px-gold)]" strokeWidth={2.2} />
              <span className="inline-flex items-baseline gap-1.5">
                {telNeedsIndicatif(tel) && (
                  <span className="text-[0.72em] font-medium text-white/45">{telIndicatif()}</span>
                )}
                {tel}
              </span>
            </a>
          )}
          {cta && (
            <a
              href={cta.href}
              className="inline-flex h-11 items-center justify-center bg-[var(--px-gold)] px-6 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--px-void)] transition-opacity hover:opacity-90"
            >
              {cta.label}
            </a>
          )}
        </div>

        {/* Menu mobile : <details> natif — zéro JS, accessible clavier. */}
        <details className="group lg:hidden [&_.open-i]:block [&_.close-i]:hidden [&[open]_.open-i]:hidden [&[open]_.close-i]:block">
          <summary
            aria-label={strings.header.openMenu}
            className="grid size-10 shrink-0 cursor-pointer list-none place-items-center text-white [&::-webkit-details-marker]:hidden"
          >
            <Menu className="open-i size-6" />
            <span className="close-i hidden text-2xl leading-none" aria-hidden>
              ×
            </span>
          </summary>
          <div className="absolute inset-x-0 top-full border-b border-[var(--px-hairline)] bg-[var(--px-void)]">
            <nav className="flex flex-col gap-1 px-6 py-4">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "border-b border-[var(--px-line)] py-3 text-sm font-semibold uppercase tracking-[0.16em] last:border-0",
                    item.active ? "text-[var(--px-gold)]" : "text-white",
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
                {tel && (
                  <a
                    href={telHrefIntl(tel)}
                    className="inline-flex h-12 items-center justify-center gap-2 border border-[var(--px-line)] text-sm font-semibold tabular-nums text-white"
                  >
                    <Phone className="size-4 text-[var(--px-gold)]" />
                    {telNeedsIndicatif(tel) && (
                      <span className="text-[0.72em] font-medium text-white/45">{telIndicatif()}</span>
                    )}{" "}
                    {tel}
                  </a>
                )}
                {cta && (
                  <a
                    href={cta.href}
                    className="inline-flex h-12 items-center justify-center bg-[var(--px-gold)] text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--px-void)]"
                  >
                    {cta.label}
                  </a>
                )}
              </div>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
