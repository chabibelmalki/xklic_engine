import Link from "next/link";
import type { SiteConfig, ContactContent } from "@/types/config";
import { Logo } from "@/components/layout/Logo";
import { legalName, siretToSiren } from "@/lib/legal";
import { telHref, waHref } from "@/lib/utils";
import { resolvePages, isMultiPage, findBlock } from "@/lib/pages";
import { resolveSocials } from "@/lib/social";
import { resolveAdresse } from "@/lib/adresse";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { ui } from "@/i18n/ui";
import { CascadeContainer } from "../ui/Container";
import { CascadeSeal } from "../ui/Seal";

/**
 * FOOTER cascade — CLAIR et frais (cohérent avec la famille de jour) : bande
 * dégradée bleu→vert en tête, fond lavis de marque très pâle, SCEAU de marque en
 * filigrane, filets fins. Conserve les obligations : liens légaux + avis +
 * backlink `xklic.com`. Props identiques à `SiteFooter`. 100 % tokens.
 */
export function CascadeFooter({
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
  const adresse = resolveAdresse(config, contact);
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
    <footer className="relative overflow-hidden bg-[color-mix(in_srgb,var(--brand-500)_5%,var(--bg))] text-ink">
      {/* Bande dégradée (signature). */}
      <span
        aria-hidden
        className="block h-1 w-full"
        style={{ background: "linear-gradient(90deg, var(--brand-500), var(--accent-500))" }}
      />
      <CascadeSeal
        label={config.branding.tagline ?? config.entreprise.nom}
        seed="footer"
        tone="brand"
        className="pointer-events-none absolute -right-16 -top-10 size-72 opacity-[0.07]"
      />

      <CascadeContainer className="relative z-10 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1.2fr]">
          <div>
            <Logo config={config} href={basePath || "/"} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {config.meta.description ?? `${e.nom} — ${config.seo.ville}.`}
            </p>
            {socials.length > 0 && (
              <SocialLinks
                socials={socials}
                className="mt-6"
                ariaLabel={t.footer.social}
                linkClassName="size-9 border border-border text-ink-soft hover:border-brand-300 hover:text-brand-700"
              />
            )}
          </div>

          <nav aria-label={t.footer.navAria}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {t.footer.siteHeading}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-ink-soft transition-colors hover:text-brand-700">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {t.footer.contactHeading}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-ink-soft">
              {adresse && <li>{adresse}</li>}
              {contact?.telephone && (
                <li>
                  <a href={telHref(contact.telephone)} className="hover:text-brand-700">
                    {contact.telephone}
                  </a>
                </li>
              )}
              {contact?.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-brand-700">
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
                    className="hover:text-brand-700"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {legalName(e)}
            {siretToSiren(e.siret) ? ` · SIREN ${siretToSiren(e.siret)}` : ""}
            {e.ape ? ` · APE ${e.ape}` : ""}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {config.googleReviewUrl && (
              <Link href={`${basePath}/avis`} className="hover:text-ink">
                {t.nav.avis}
              </Link>
            )}
            <Link href={`${basePath}/mentions-legales`} className="hover:text-ink">
              {t.footer.legal}
            </Link>
            <Link href={`${basePath}/confidentialite`} className="hover:text-ink">
              {t.footer.confidentialite}
            </Link>
            <span>
              {t.footer.poweredBy}{" "}
              <a
                href="https://xklic.com"
                target="_blank"
                rel="noopener"
                className="font-medium text-ink-soft hover:text-ink"
              >
                xklic.com
              </a>
            </span>
          </div>
        </div>
      </CascadeContainer>
    </footer>
  );
}
