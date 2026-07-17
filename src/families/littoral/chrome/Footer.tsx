import Link from "next/link";
import type { SiteConfig, ContactContent } from "@/types/config";
import { legalName, legalIdShort, activityCodeShort } from "@/lib/legal";
import { telHref, waHref } from "@/lib/utils";
import { resolvePages, isMultiPage, findBlock } from "@/lib/pages";
import { resolveSocials } from "@/lib/social";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { ui } from "@/i18n/ui";
import { LittoralContainer } from "../ui/Container";

/**
 * FOOTER littoral — NUIT MARINE (navy `brand-800`), à l'opposé du footer clair
 * editorial : clôt le site sur le même registre immersif que le hero/CTA. Filets
 * dorés fins, titres de colonnes MAJUSCULES, hover or. Conserve les obligations
 * (liens légaux + avis + backlink `xklic.com`). Contraste AA (clairs sur navy).
 */
export function LittoralFooter({
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
    <footer className="bg-brand-800 text-white">
      {/* Filet doré de tête (rappel du soleil du logo). */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />
      <LittoralContainer wide className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1.2fr]">
          {/* Marque — wordmark typographique (le logo raster a un fond blanc,
              illisible sur navy : on rend le nom en display, comme prestige). */}
          <div>
            <Link
              href={basePath || "/"}
              aria-label={e.nom}
              className="inline-flex flex-col leading-none"
            >
              <span className="font-display text-2xl font-semibold tracking-tight text-white">
                {e.nom}
              </span>
              {config.branding.tagline && (
                <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-accent-50">
                  {config.branding.tagline}
                </span>
              )}
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              {config.meta.description ?? `${e.nom} — ${config.seo.ville}.`}
            </p>
            {socials.length > 0 && (
              <SocialLinks
                socials={socials}
                className="mt-6"
                ariaLabel={t.footer.social}
                linkClassName="size-9 border border-white/20 text-white/80 hover:border-accent-500 hover:text-accent-50"
              />
            )}
          </div>

          {/* Navigation */}
          <nav aria-label={t.footer.navAria}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-50">
              {t.footer.siteHeading}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/75 transition-colors hover:text-accent-50">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-50">
              {t.footer.contactHeading}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              {contact?.adresse && <li>{contact.adresse}</li>}
              {contact?.telephone && (
                <li>
                  <a href={telHref(contact.telephone)} className="hover:text-accent-50">
                    {contact.telephone}
                  </a>
                </li>
              )}
              {contact?.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-accent-50">
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
                    className="hover:text-accent-50"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {legalName(e)} · {legalIdShort(e).label} {legalIdShort(e).value}
            {e.ape ? ` · ${activityCodeShort(e)} ${e.ape}` : ""}
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
            <span>
              {t.footer.poweredBy}{" "}
              <a
                href="https://xklic.com"
                target="_blank"
                rel="noopener"
                className="font-medium text-white/75 hover:text-white"
              >
                xklic.com
              </a>
            </span>
          </div>
        </div>
      </LittoralContainer>
    </footer>
  );
}
