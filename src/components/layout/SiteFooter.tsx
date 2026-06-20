import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import type { SiteConfig, ContactContent, ServicesContent } from "@/types/config";
import { Logo } from "./Logo";
import { statutLabel, legalName, siretToSiren } from "@/lib/legal";
import { telHref, waHref } from "@/lib/utils";
import { resolvePages, isMultiPage, findBlock } from "@/lib/pages";
import { resolveSocials } from "@/lib/social";
import { SocialLinks } from "./SocialLinks";
import { ui } from "@/i18n/ui";

export function SiteFooter({
  config,
  basePath,
  currentPath = "/",
  locale = config.i18n?.default ?? "fr",
}: {
  config: SiteConfig;
  basePath: string;
  currentPath?: string;
  locale?: string;
}) {
  const e = config.entreprise;
  const contact = findBlock<ContactContent>(config, "contact")?.content;
  const services = findBlock<ServicesContent>(config, "services")?.content;
  const socials = resolveSocials(config);
  const t = ui(locale);
  const year = new Date().getFullYear();

  // Liens du footer scindés : pages principales (« Le site ») d'un côté, pages
  // de prestation (champ `service`) de l'autre — évite une colonne unique
  // démesurée quand le site a beaucoup de pages services.
  const mainLinks: { href: string; label: string }[] = [];
  const serviceLinks: { href: string; label: string }[] = [];
  if (isMultiPage(config)) {
    for (const p of resolvePages(config).filter((x) => !x.isHome)) {
      (p.service ? serviceLinks : mainLinks).push({ href: `${basePath}${p.path}`, label: p.label });
    }
  } else {
    const navTypes = t.nav as Record<string, string>;
    const seen = new Set<string>();
    for (const b of config.blocks) {
      if (b.type in navTypes && !seen.has(b.type) && !(b.type === "zone" && b.mode === "aucune")) {
        seen.add(b.type);
        mainLinks.push({ href: `${basePath}/#${b.type}`, label: navTypes[b.type] });
      }
    }
  }
  void currentPath;

  const description =
    config.meta.description ??
    `${e.nom} — ${config.seo.ville}.`;

  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div
          className={
            serviceLinks.length
              ? "grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]"
              : "grid gap-12 lg:grid-cols-[1.5fr_1fr_1.2fr]"
          }
        >
          {/* Marque */}
          <div>
            <Logo config={config} href={basePath || "/"} variant="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              {description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                {statutLabel(e.statut).split(" (")[0]}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                {config.seo.ville}
              </span>
            </div>
            {socials.length > 0 && (
              <SocialLinks
                socials={socials}
                className="mt-6"
                ariaLabel={t.footer.social}
                linkClassName="size-9 bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
              />
            )}
          </div>

          {/* Le site */}
          <nav aria-label={t.footer.navAria}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.siteHeading}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {mainLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/55 transition-colors hover:text-brand-300">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            {!serviceLinks.length && services?.items.length ? (
              <ul className="mt-5 space-y-2 text-xs text-white/40">
                {services.items.slice(0, 5).map((s) => (
                  <li key={s.nom}>{s.nom}</li>
                ))}
              </ul>
            ) : null}
          </nav>

          {/* Nos prestations : pages services dédiées (colonne séparée) */}
          {serviceLinks.length > 0 && (
            <nav aria-label={t.nav.services}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                {t.nav.services}
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {serviceLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-white/55 transition-colors hover:text-brand-300">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.contactHeading}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {contact?.adresse && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" />
                  <span className="text-white/55">{contact.adresse}</span>
                </li>
              )}
              {contact?.telephone && (
                <li className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-brand-400" />
                  <a href={telHref(contact.telephone)} className="hover:text-brand-300">
                    {contact.telephone}
                  </a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-brand-400" />
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-brand-300">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact?.horaires?.length ? (
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-brand-400" />
                  <span className="text-white/55">
                    {contact.horaires.map((h) => `${h.jour} : ${h.heures}`).join(" · ")}
                  </span>
                </li>
              ) : null}
            </ul>
            {contact?.whatsapp && (
              <a
                href={waHref(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {legalName(e)} · SIREN {siretToSiren(e.siret)}
            {e.ape ? ` · APE ${e.ape}` : ""}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {config.googleReviewUrl && (
              <Link href={`${basePath}/avis`} className="hover:text-white/80">
                {t.nav.avis}
              </Link>
            )}
            <Link href={`${basePath}/mentions-legales`} className="hover:text-white/80">
              {t.footer.legal}
            </Link>
            <Link href={`${basePath}/confidentialite`} className="hover:text-white/80">
              {t.footer.confidentialite}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
