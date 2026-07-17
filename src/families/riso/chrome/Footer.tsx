import Link from "next/link";
import type { SiteConfig, ContactContent } from "@/types/config";
import { Logo } from "@/components/layout/Logo";
import { legalName, legalIdShort, activityCodeShort } from "@/lib/legal";
import { telHref, waHref } from "@/lib/utils";
import { resolvePages, isMultiPage, findBlock } from "@/lib/pages";
import { resolveSocials } from "@/lib/social";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { ui } from "@/i18n/ui";
import { EditorialContainer } from "../../editorial/ui/Container";
import { Halftone, InkBar, RegistrationMark } from "../ui/Riso";

/**
 * FOOTER riso — le dos de l'affiche : un aplat d'ENCRE PROFONDE (brand-800) coiffé
 * de la barre de contrôle couleur, tramé, avec une mire de repérage en marge. Les
 * intitulés de colonne sont des étiquettes d'encre (mono en capitales), les
 * réseaux des puces carrées à filet.
 *
 * Conserve les obligations : liens légaux, avis, backlink `xklic.com` (SEO).
 * Props identiques à `SiteFooter`.
 */
export function RisoFooter({
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

  const heading = (label: string) => (
    <h3 className="riso-mono inline-block bg-accent-500 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent-contrast">
      {label}
    </h3>
  );

  return (
    <footer className="relative isolate overflow-hidden bg-brand-800 text-white">
      <InkBar className="absolute inset-x-0 top-0" />
      <Halftone className="text-white/15" />
      <RegistrationMark className="absolute bottom-6 right-6 hidden text-white/25 sm:block" />

      <EditorialContainer className="relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1.2fr]">
          {/* Marque — le logo est posé sur un RECTANGLE DE PAPIER, comme une
              étiquette collée sur l'affiche. Sans lui, l'encre bleue du logotype
              se noierait dans l'aplat brand-800 du footer (deux bleus voisins). */}
          <div>
            <div className="inline-block bg-bg p-3">
              <Logo config={config} href={basePath || "/"} />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              {config.meta.description ?? `${e.nom} — ${config.seo.ville}.`}
            </p>
            {socials.length > 0 && (
              <SocialLinks
                socials={socials}
                className="mt-6"
                ariaLabel={t.footer.social}
                linkClassName="size-9 border-2 border-white/35 text-white hover:border-accent-500 hover:bg-accent-500 hover:text-accent-contrast"
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
              {contact?.adresse && <li>{contact.adresse}</li>}
              {contact?.telephone && (
                <li>
                  <a href={telHref(contact.telephone)} className="riso-mono hover:text-white">
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

        <div className="riso-mono mt-14 flex flex-col gap-4 border-t-2 border-white/20 pt-8 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          {/* Identifiant légal / code d'activité affichés SEULEMENT s'ils existent :
              un dossier sans identifiant imprimerait sinon un libellé suivi de rien.
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
                className="font-bold text-white/75 hover:text-white"
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
