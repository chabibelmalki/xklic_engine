import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import type { ContactContent } from "@/types/config";
import type { ContactMode } from "@/lib/contact-schema";
import type { BlockComponentProps } from "./types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { telHref, waHref, withBase } from "@/lib/utils";
import { resolveSocials } from "@/lib/social";

/**
 * Contact. Coordonnées cliquables (tel/mail/WhatsApp) + horaires + carte, et —
 * si `content.form` est vrai — un FORMULAIRE opérationnel (POST /api/contact).
 * Le mode (`simple` | `demande-intervention` | `devis` | `contact`) pilote les
 * champs affichés.
 * variant : `split-form-carte` (défaut) · `coordonnees-cartes` · `centre` ·
 * `panneau-sombre` (coordonnées rose gold sur panneau noir + formulaire, carte
 * pleine largeur dessous — façon carte de visite).
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
  const variant = block.variant ?? "split-form-carte";

  // Lien de confidentialité résolu par rapport au basePath (preview vs prod).
  const rawConf = c.confidentialiteHref ?? "/confidentialite";
  const confidentialiteHref = rawConf.startsWith("http") ? rawConf : `${basePath}${rawConf}`;

  // Cliquer l'adresse ouvre la FICHE Google du client quand elle est connue
  // (lien social « google », sinon dérivé de googleReviewUrl) : une recherche
  // Maps sur le texte de l'adresse part en vrille dès que `adresse` n'est pas
  // une voie postale exacte (accroche marketing, libellé de zone…).
  const googleProfile =
    resolveSocials(config).find((s) => s.platform === "google")?.href ??
    config.googleReviewUrl?.replace(/\/review\/?$/, "");
  const adresseHref =
    googleProfile ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.adresse ?? "")}`;

  const rows = [
    c.telephone && { icon: Phone, label: c.telephone, href: telHref(c.telephone) },
    c.whatsapp && { icon: MessageCircle, label: strings.contact.whatsapp, href: waHref(c.whatsapp) },
    c.email && { icon: Mail, label: c.email, href: `mailto:${c.email}` },
    c.adresse && { icon: MapPin, label: c.adresse, href: adresseHref },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href?: string }[];

  const infoCard = (
    <div className="space-y-6">
      <div className="rounded-theme border border-border bg-surface p-6 shadow-sm">
        <ul className="space-y-4">
          {rows.map((r, i) => {
            const Inner = (
              <span className="flex min-w-0 items-center gap-3 text-ink">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <r.icon className="size-5" />
                </span>
                <span className="min-w-0 break-words font-medium">{r.label}</span>
              </span>
            );
            return (
              <li key={i}>
                {r.href ? (
                  <a
                    href={r.href}
                    className="transition-opacity hover:opacity-80"
                    {...(r.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
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
          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
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
      </div>

      {c.mapEmbedUrl && (
        <div className="overflow-hidden rounded-theme border border-border shadow-sm">
          <iframe
            src={c.mapEmbedUrl}
            title={`Localisation — ${config.entreprise.nom}`}
            loading="lazy"
            className="block w-full border-0"
            style={{ minHeight: 300, aspectRatio: "16 / 10" }}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );

  const form = (
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
  );

  // Cartes de coordonnées (variant "coordonnees-cartes").
  const coordCards = (
    <div className="mt-12 grid grid-cols-1 gap-5 [&>*]:min-w-0 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((r, i) => {
        const Inner = (
          <>
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <r.icon className="size-5" />
            </span>
            <p className="mt-3 break-words font-medium text-ink">{r.label}</p>
          </>
        );
        const cls =
          "block rounded-theme border border-border bg-surface p-6 text-center shadow-sm transition-shadow hover:shadow-md";
        return r.href ? (
          <Reveal key={i} delay={(i % 4) * 0.05}>
            <a
              href={r.href}
              className={cls}
              {...(r.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {Inner}
            </a>
          </Reveal>
        ) : (
          <Reveal key={i} delay={(i % 4) * 0.05}>
            <div className={cls}>{Inner}</div>
          </Reveal>
        );
      })}
    </div>
  );

  const header = (
    <Reveal>
      <SectionHeading
        eyebrow={strings.nav.contact}
        title={c.titre ?? "Parlons de votre projet"}
        intro={c.intro}
      />
    </Reveal>
  );

  // Panneau sombre "carte de visite" (variant "panneau-sombre") : coordonnées en
  // rose gold sur fond noir, à côté du formulaire ; carte pleine largeur dessous.
  if (variant === "panneau-sombre") {
    return (
      <Section id="contact" tone={tone}>
        {header}
        <div className="mt-12 grid grid-cols-1 gap-6 [&>*]:min-w-0 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="flex h-full flex-col gap-8 rounded-theme bg-ink p-7 text-white sm:p-9">
              <ul className="space-y-5">
                {rows.map((r, i) => {
                  const Inner = (
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-300 ring-1 ring-inset ring-white/15">
                        <r.icon className="size-5" />
                      </span>
                      <span className="min-w-0 break-words font-medium text-white/90">{r.label}</span>
                    </span>
                  );
                  return (
                    <li key={i}>
                      {r.href ? (
                        <a
                          href={r.href}
                          className="transition-colors hover:text-brand-300"
                          {...(r.href.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
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
                <div className="border-t border-white/15 pt-6">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Clock className="size-4 text-brand-300" /> {strings.contact.hours}
                  </p>
                  <ul className="space-y-1.5 text-sm text-white/65">
                    {c.horaires.map((h) => (
                      <li key={h.jour} className="flex justify-between gap-4">
                        <span>{h.jour}</span>
                        <span className="text-white">{h.heures}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {c.whatsapp && (
                <a
                  href={waHref(c.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle className="size-4" /> {strings.contact.whatsapp}
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {c.form ? (
              form
            ) : (
              <div className="flex h-full flex-col justify-center rounded-theme border border-border bg-surface p-8 shadow-sm">
                {c.cta && (
                  <Button href={withBase(basePath, c.cta.href)} size="lg">
                    {c.cta.label}
                  </Button>
                )}
              </div>
            )}
          </Reveal>
        </div>

        {c.mapEmbedUrl && (
          <Reveal delay={0.15}>
            <div className="mt-6 overflow-hidden rounded-theme border border-border shadow-sm">
              <iframe
                src={c.mapEmbedUrl}
                title={`Localisation — ${config.entreprise.nom}`}
                loading="lazy"
                className="block w-full border-0"
                style={{ minHeight: 260, aspectRatio: "21 / 8" }}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        )}
      </Section>
    );
  }

  if (variant === "coordonnees-cartes") {
    return (
      <Section id="contact" tone={tone}>
        {header}
        {coordCards}
        {(c.horaires?.length || c.mapEmbedUrl || c.form) && (
          <div className="mt-10 grid grid-cols-1 gap-8 [&>*]:min-w-0 lg:grid-cols-2">
            <Reveal>{infoCard}</Reveal>
            {c.form && <Reveal delay={0.1}>{form}</Reveal>}
          </div>
        )}
      </Section>
    );
  }

  if (variant === "centre") {
    return (
      <Section id="contact" tone={tone}>
        {header}
        {c.form ? (
          <Reveal delay={0.05}>
            <div className="mx-auto mt-12 max-w-xl">{form}</div>
          </Reveal>
        ) : (
          <div className="mx-auto mt-10 max-w-xl">
            <Reveal>{infoCard}</Reveal>
            {c.cta && (
              <Reveal delay={0.1}>
                <div className="mt-8 text-center">
                  <Button href={withBase(basePath, c.cta.href)} size="lg">
                    {c.cta.label}
                  </Button>
                </div>
              </Reveal>
            )}
          </div>
        )}
      </Section>
    );
  }

  // split-form-carte (défaut)
  return (
    <Section id="contact" tone={tone}>
      {header}
      {c.form ? (
        <div className="mt-12 grid grid-cols-1 gap-8 [&>*]:min-w-0 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>{infoCard}</Reveal>
          <Reveal delay={0.1}>{form}</Reveal>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 items-start gap-10 [&>*]:min-w-0 lg:grid-cols-2">
          <Reveal>
            <div>
              {c.cta && (
                <Button href={withBase(basePath, c.cta.href)} size="lg">
                  {c.cta.label}
                </Button>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>{infoCard}</Reveal>
        </div>
      )}
    </Section>
  );
}
