import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import type { ContactContent } from "@/types/config";
import type { ContactMode } from "@/lib/contact-schema";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/ContactForm";
import { telHref, waHref, withBase } from "@/lib/utils";
import { EditorialSection } from "../ui/Section";
import { EditorialContainer } from "../ui/Container";
import { EditorialHeading } from "../ui/Heading";
import { resolveAdresse } from "@/lib/adresse";

/**
 * Contact — éditorial : coordonnées à PLAT (liste à filets, pas de carte à ombre)
 * + formulaire (ContactForm, client par nécessité). Le mode/turnstile/consentement
 * restent gérés par ContactForm (partagé).
 */
export function Contact({
  block,
  config,
  tone,
  basePath = "",
  strings,
  turnstileSiteKey,
}: BlockComponentProps<ContactContent>) {
  const c = block.content;
  const mode: ContactMode = (c.formMode ?? c.formType ?? "simple") as ContactMode;
  const rawConf = c.confidentialiteHref ?? "/confidentialite";
  const confidentialiteHref = rawConf.startsWith("http") ? rawConf : `${basePath}${rawConf}`;

  const adresse = resolveAdresse(config, c);

  const rows = [
    c.telephone && { icon: Phone, label: c.telephone, href: telHref(c.telephone) },
    c.whatsapp && { icon: MessageCircle, label: strings.contact.whatsapp, href: waHref(c.whatsapp) },
    c.email && { icon: Mail, label: c.email, href: `mailto:${c.email}` },
    adresse && {
      icon: MapPin,
      label: adresse,
      // Cliquer l'adresse ouvre Google Maps sur cette adresse (nouvel onglet).
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href?: string }[];

  const coords = (
    <div>
      <ul className="border-t border-border">
        {rows.map((r, i) => {
          const Inner = (
            <span className="flex items-center gap-4 py-4 text-ink">
              <r.icon className="size-5 shrink-0 text-brand-600" />
              <span className="min-w-0 break-words font-medium">{r.label}</span>
            </span>
          );
          return (
            <li key={i} className="border-b border-border">
              {r.href ? (
                <a
                  href={r.href}
                  className="block transition-colors hover:text-brand-700"
                  {...(r.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {Inner}
                </a>
              ) : (
                Inner
              )}
            </li>
          );
        })}
      </ul>

      {c.horaires?.length ? (
        <div className="mt-6">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <Clock className="size-4 text-brand-600" /> {strings.contact.hours}
          </p>
          <ul className="space-y-1.5 text-sm text-muted">
            {c.horaires.map((h) => (
              <li key={h.jour} className="flex justify-between gap-4">
                <span>{h.jour}</span>
                <span className="text-ink">{h.heures}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {c.mapEmbedUrl && (
        <div className="mt-6 overflow-hidden border border-border">
          <iframe
            src={c.mapEmbedUrl}
            title={`Localisation — ${config.entreprise.nom}`}
            loading="lazy"
            className="block w-full border-0"
            style={{ minHeight: 280, aspectRatio: "16 / 10" }}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );

  return (
    <EditorialSection id="contact" tone={tone}>
      <EditorialContainer>
        <EditorialHeading kicker={strings.nav.contact} title={c.titre ?? "Parlons de votre projet"} lede={c.intro} />
        {c.form ? (
          <div className="mt-12 grid grid-cols-1 gap-12 [&>*]:min-w-0 lg:grid-cols-[0.8fr_1.2fr]">
            {coords}
            <ContactForm
              mode={mode}
              site={config.entreprise.nom}
              siteSlug={config.slug}
              services={c.services}
              villes={c.villes}
              telephone={c.telephone}
              whatsapp={c.whatsapp}
              confidentialiteHref={confidentialiteHref}
              turnstileSiteKey={turnstileSiteKey}
              strings={strings.form}
            />
          </div>
        ) : (
          <div className="mt-12 max-w-xl">
            {coords}
            {c.cta && (
              <div className="mt-8">
                <Button href={withBase(basePath, c.cta.href)} size="lg">
                  {c.cta.label}
                </Button>
              </div>
            )}
          </div>
        )}
      </EditorialContainer>
    </EditorialSection>
  );
}
