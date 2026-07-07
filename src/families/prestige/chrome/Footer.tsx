import Link from "next/link";
import { Phone } from "lucide-react";
import type { SiteConfig, ContactContent } from "@/types/config";
import { legalName, siretToSiren } from "@/lib/legal";
import { telHref, waHref } from "@/lib/utils";
import { resolvePages, isMultiPage, findBlock } from "@/lib/pages";
import { resolveSocials } from "@/lib/social";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { ui } from "@/i18n/ui";
import { PrestigeContainer } from "../ui/Container";

/**
 * FOOTER prestige — SOMBRE et affirmé (fond `void`, filets métalliques dorés),
 * cohérent avec le registre de la famille. Conserve les obligations : liens
 * légaux + avis + backlink `xklic.com` (SEO). Props identiques à `SiteFooter`.
 */
export function PrestigeFooter({
  config,
  basePath,
  locale = config.i18n?.default ?? "fr",
}: {
  config: SiteConfig;
  basePath: string;
  currentPath?: string;
  locale?: string;
}) {
  const e = config.entreprise;
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const socials = resolveSocials(config);
  const t = ui(locale);
  const year = new Date().getFullYear();

  const links: { href: string; label: string }[] = [];
  if (isMultiPage(config)) {
    for (const p of resolvePages(config).filter((x) => !x.isHome && !x.navHidden)) {
      links.push({ href: `${basePath}${p.path}`, label: p.label });
    }
  } else {
    const navTypes = t.nav as Record<string, string>;
    const seen = new Set<string>();
    for (const b of config.blocks) {
      if (b.type in navTypes && !seen.has(b.type) && !(b.type === "zone" && b.mode === "aucune")) {
        seen.add(b.type);
        links.push({ href: `${basePath}/#${b.type}`, label: navTypes[b.type] });
      }
    }
  }

  return (
    <footer className="border-t border-[var(--px-hairline)] bg-[var(--px-void)] text-white">
      <PrestigeContainer className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1.2fr]">
          {/* Marque */}
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-white">{e.nom}</p>
            {config.branding.tagline && (
              <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--px-gold)]">
                {config.branding.tagline}
              </p>
            )}
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--px-ink-soft)]">
              {config.meta.description ?? `${e.nom} — ${config.seo.ville}.`}
            </p>
            {socials.length > 0 && (
              <SocialLinks
                socials={socials}
                className="mt-6"
                ariaLabel={t.footer.social}
                linkClassName="size-9 border border-[var(--px-line)] text-white/70 hover:border-[var(--px-gold)] hover:text-[var(--px-gold)]"
              />
            )}
          </div>

          {/* Navigation */}
          <nav aria-label={t.footer.navAria}>
            <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--px-gold)]">
              {t.footer.siteHeading}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-[var(--px-ink-soft)] transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--px-gold)]">
              {t.footer.contactHeading}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-[var(--px-ink-soft)]">
              {contact?.telephone && (
                <li>
                  <a
                    href={telHref(contact.telephone)}
                    className="inline-flex items-center gap-2 font-semibold tabular-nums text-white hover:text-[var(--px-gold)]"
                  >
                    <Phone className="size-4 text-[var(--px-gold)]" strokeWidth={2.2} />
                    {contact.telephone}
                  </a>
                </li>
              )}
              {contact?.adresse && <li>{contact.adresse}</li>}
              {contact?.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-white">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact?.whatsapp && (
                <li>
                  <a
                    href={waHref(contact.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-[var(--px-line)] pt-8 text-xs text-[var(--px-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {legalName(e)} · SIREN {siretToSiren(e.siret)}
            {e.ape ? ` · APE ${e.ape}` : ""}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {config.googleReviewUrl && (
              <Link href={`${basePath}/avis`} className="hover:text-white">
                {t.nav.avis}
              </Link>
            )}
            <Link href={`${basePath}/mentions-legales`} className="hover:text-white">
              {t.footer.legal}
            </Link>
            <Link href={`${basePath}/confidentialite`} className="hover:text-white">
              {t.footer.confidentialite}
            </Link>
            {/* Backlink agence (SEO marque) — obligation conservée. */}
            <span>
              {t.footer.poweredBy}{" "}
              <a
                href="https://xklic.com"
                target="_blank"
                rel="noopener"
                className="font-medium text-[var(--px-ink-soft)] hover:text-white"
              >
                xklic.com
              </a>
            </span>
          </div>
        </div>
      </PrestigeContainer>
    </footer>
  );
}
