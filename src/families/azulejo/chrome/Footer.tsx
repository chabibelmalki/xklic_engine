import Link from "next/link";
import type { SiteConfig, ContactContent } from "@/types/config";
import { Logo } from "@/components/layout/Logo";
import { legalName, legalIdShort, activityCodeShort } from "@/lib/legal";
import { telHref, waHref } from "@/lib/utils";
import { resolvePages, isMultiPage, findBlock } from "@/lib/pages";
import { resolveSocials } from "@/lib/social";
import { resolveAdresse } from "@/lib/adresse";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { ui } from "@/i18n/ui";
import { EditorialContainer } from "../../editorial/ui/Container";
import { AzulejoFrieze, AzulejoWall } from "../ui/Azulejo";

/**
 * FOOTER azulejo — le socle du mur : un pan de faïence ÉMAILLÉE PROFONDE
 * (brand-800) tramé de joints, coiffé de la frise de losanges. Les intitulés de
 * colonne sont en serif haute claire, les réseaux des tomettes à filet.
 *
 * Conserve les obligations : liens légaux, avis, backlink `xklic.com` (SEO).
 * Props identiques à `SiteFooter`.
 */
export function AzulejoFooter({
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

  const heading = (label: string) => (
    <h3 className="font-display text-lg text-white">{label}</h3>
  );

  return (
    <footer className="relative isolate overflow-hidden bg-brand-800 text-white">
      <AzulejoFrieze className="absolute inset-x-0 top-0" />
      <AzulejoWall className="text-white/10" />

      <EditorialContainer className="relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1.2fr]">
          {/* Marque — wordmark rendu en blanc (variant light) sur le pan sombre. */}
          <div>
            <Logo config={config} href={basePath || "/"} variant="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              {config.meta.description ?? `${e.nom} — ${config.seo.ville}.`}
            </p>
            {socials.length > 0 && (
              <SocialLinks
                socials={socials}
                className="mt-6"
                ariaLabel={t.footer.social}
                linkClassName="size-9 rounded-md border border-white/25 text-white hover:border-accent-500 hover:bg-accent-500 hover:text-accent-contrast"
              />
            )}
          </div>

          {/* Navigation */}
          <nav aria-label={t.footer.navAria}>
            {heading(t.footer.siteHeading)}
            <ul className="mt-5 space-y-3 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            {heading(t.footer.contactHeading)}
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              {adresse && <li>{adresse}</li>}
              {contact?.telephone && (
                <li>
                  <a href={telHref(contact.telephone)} className="hover:text-white">
                    {contact.telephone}
                  </a>
                </li>
              )}
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

        <div className="mt-14 flex flex-col gap-4 border-t border-white/20 pt-8 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          {/* Identifiant légal / code d'activité affichés SEULEMENT s'ils existent.
              Le libellé s'adapte au pays (SIREN/APE en France, N° BCE/NACE en Belgique). */}
          <p>
            © {year} {legalName(e)}
            {e.siret ? ` · ${legalIdShort(e).label} ${legalIdShort(e).value}` : ""}
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
                className="font-semibold text-white/75 hover:text-white"
              >
                xklic.com
              </a>
            </span>
          </div>
        </div>
      </EditorialContainer>
    </footer>
  );
}
