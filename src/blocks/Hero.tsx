import Image from "next/image";
import { ShieldCheck, Star, Sparkles } from "lucide-react";
import type { HeroContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { withBase } from "@/lib/utils";
import { resolveSocials } from "@/lib/social";
import { SocialLinks } from "@/components/layout/SocialLinks";

/**
 * Hero. variant : "carte" (texte + carte de prix flottante) · "split" (texte +
 * image) · "centre" (texte centré) · "plein" (image plein écran + overlay,
 * texte clair) · "asymetrique" (colonnes décalées 7/5, image inclinée). Le H1
 * porte la ville (SEO local) : si le titre ne la contient pas et qu'aucun accent
 * n'est fourni, on ajoute " à <ville>".
 */
export function Hero({ block, config, basePath = "", strings }: BlockComponentProps<HeroContent>) {
  const c = block.content;
  const variant = block.variant ?? (c.card ? "carte" : c.image ? "split" : "centre");
  const ville = config.seo.ville;
  const titleHasVille = ville && c.titre.toLowerCase().includes(ville.toLowerCase());
  const showVilleSuffix = !c.titreAccent && !titleHasVille;

  // Icônes réseaux dans le hero (optionnel, piloté par `content.showSocial`).
  const socials = c.showSocial ? resolveSocials(config) : [];
  const socialRow = (opts: { onDark?: boolean; center?: boolean } = {}) =>
    socials.length > 0 ? (
      <Reveal delay={0.25}>
        <SocialLinks
          socials={socials}
          className={opts.center ? "mt-8 justify-center" : "mt-8"}
          ariaLabel={strings.footer.social}
          linkClassName={
            opts.onDark
              ? "size-10 bg-white/15 text-white hover:bg-white/25"
              : "size-10 bg-surface text-ink-soft ring-1 ring-border hover:text-brand-700"
          }
        />
      </Reveal>
    ) : null;

  const heading = (
    <h1 className="pack-heading font-display text-4xl font-extrabold leading-[1.07] tracking-tight text-ink sm:text-5xl lg:text-6xl">
      {c.titre}
      {c.titreAccent && (
        <>
          {" "}
          <span className="text-gradient">{c.titreAccent}</span>
        </>
      )}
      {showVilleSuffix && <span className="text-gradient"> à {ville}</span>}
    </h1>
  );

  // Bouton « Laissez un avis » : présent uniquement si le site a un lien d'avis
  // Google configuré. Mène à la page dédiée /avis (localisée via basePath).
  const reviewHref = config.googleReviewUrl ? withBase(basePath, "/avis") : null;

  const ctas = (c.ctaPrimaire || c.ctaSecondaire || reviewHref) && (
    <div className="flex flex-col gap-3 sm:flex-row">
      {c.ctaPrimaire && (
        <Button href={withBase(basePath, c.ctaPrimaire.href)} size="lg">
          {c.ctaPrimaire.label}
        </Button>
      )}
      {c.ctaSecondaire && (
        <Button href={withBase(basePath, c.ctaSecondaire.href)} variant="outline" size="lg">
          {c.ctaSecondaire.label}
        </Button>
      )}
      {reviewHref && (
        <Button href={reviewHref} variant="outline" size="lg">
          <Star className="size-4 fill-current" /> {strings.avis.leaveReview}
        </Button>
      )}
    </div>
  );

  const trust = c.trust?.length ? (
    <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
      {c.trust.map((t) => (
        <li key={t.label} className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-brand-600 shadow-sm ring-1 ring-border">
            <Icon name={t.icone} className="size-[18px]" />
          </span>
          <span className="text-sm font-medium text-ink-soft">{t.label}</span>
        </li>
      ))}
    </ul>
  ) : c.badges?.length ? (
    <div className="mt-8 flex flex-wrap gap-2">
      {c.badges.map((b) => (
        <Badge key={b} variant="neutral">
          {b}
        </Badge>
      ))}
    </div>
  ) : null;

  const textColumn = (
    <div>
      {(c.eyebrow || c.sousTitre) && (
        <Reveal>
          <Badge variant="accent" className="mb-5">
            <Sparkles className="size-3.5" />
            {c.eyebrow ?? c.sousTitre}
          </Badge>
        </Reveal>
      )}
      <Reveal delay={0.05}>{heading}</Reveal>
      {c.accroche && (
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{c.accroche}</p>
        </Reveal>
      )}
      {ctas && (
        <Reveal delay={0.15}>
          <div className="mt-8">{ctas}</div>
        </Reveal>
      )}
      <Reveal delay={0.2}>{trust}</Reveal>
      {socialRow()}
    </div>
  );

  // ---- variant "centre" ----
  if (variant === "centre") {
    return (
      <header className="hero-mesh relative overflow-hidden">
        <Container className="py-20 text-center sm:py-28">
          <div className="mx-auto max-w-3xl">
            {(c.eyebrow || c.sousTitre) && (
              <Reveal>
                <Badge variant="accent" className="mb-5">
                  <Sparkles className="size-3.5" />
                  {c.eyebrow ?? c.sousTitre}
                </Badge>
              </Reveal>
            )}
            <Reveal delay={0.05}>{heading}</Reveal>
            {c.accroche && (
              <Reveal delay={0.1}>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                  {c.accroche}
                </p>
              </Reveal>
            )}
            {ctas && (
              <Reveal delay={0.15}>
                <div className="mt-8 flex justify-center">{ctas}</div>
              </Reveal>
            )}
            {c.trust?.length ? (
              <Reveal delay={0.2}>
                <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-3">
                  {c.trust.map((t) => (
                    <li key={t.label} className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                      <Icon name={t.icone} className="size-4 text-brand-600" />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
            {socialRow({ center: true })}
          </div>
        </Container>
      </header>
    );
  }

  // ---- variant "split" (image) ----
  if (variant === "split" && c.image) {
    return (
      <header className="hero-mesh relative overflow-hidden">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          {textColumn}
          <Reveal delay={0.15}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="pack-halo absolute -inset-4 -z-10 rounded-[2.5rem] bg-brand-200/40 blur-2xl" />
              <div className="pack-image relative aspect-[4/5] overflow-hidden border border-white/60">
                <Image
                  src={c.image.url}
                  alt={c.image.alt ?? c.titre}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </Container>
      </header>
    );
  }

  // ---- variant "plein" (image plein écran + overlay, texte clair) ----
  if (variant === "plein" && c.image) {
    return (
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={c.image.url}
            alt={c.image.alt ?? c.titre}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/55 to-ink/25" />
        </div>
        <Container className="flex min-h-[78vh] flex-col justify-end py-20 sm:min-h-[86vh]">
          <div className="max-w-2xl text-white">
            {(c.eyebrow || c.sousTitre) && (
              <Reveal>
                <Badge variant="accent" className="mb-5">
                  <Sparkles className="size-3.5" />
                  {c.eyebrow ?? c.sousTitre}
                </Badge>
              </Reveal>
            )}
            <Reveal delay={0.05}>
              <h1 className="pack-heading font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                {c.titre}
                {c.titreAccent && (
                  <>
                    {" "}
                    <span className="text-accent-500">{c.titreAccent}</span>
                  </>
                )}
                {showVilleSuffix && <span className="text-accent-500"> à {ville}</span>}
              </h1>
            </Reveal>
            {c.accroche && (
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{c.accroche}</p>
              </Reveal>
            )}
            {ctas && (
              <Reveal delay={0.15}>
                <div className="mt-8">{ctas}</div>
              </Reveal>
            )}
            {c.trust?.length ? (
              <Reveal delay={0.2}>
                <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                  {c.trust.map((t) => (
                    <li key={t.label} className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <Icon name={t.icone} className="size-4 text-accent-500" />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
            {socialRow({ onDark: true })}
          </div>
        </Container>
      </header>
    );
  }

  // ---- variant "asymetrique" (colonnes décalées 7/5, image inclinée) ----
  if (variant === "asymetrique") {
    return (
      <header className="hero-mesh relative overflow-hidden">
        <Container className="py-16 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">{textColumn}</div>
            <div className="lg:col-span-5">
              <Reveal delay={0.15}>
                {c.image ? (
                  <div className="relative mx-auto max-w-sm rotate-2 lg:max-w-none">
                    <div className="pack-image relative aspect-[4/5] overflow-hidden border border-white/60">
                      <Image
                        src={c.image.url}
                        alt={c.image.alt ?? c.titre}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pack-card -rotate-1 border border-border bg-surface p-8">
                    <p className="font-display text-2xl font-extrabold text-ink">{c.titreAccent ?? c.titre}</p>
                    {c.accroche && <p className="mt-3 text-sm leading-relaxed text-muted">{c.accroche}</p>}
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </Container>
      </header>
    );
  }

  // ---- variant "carte" (carte de prix flottante) ----
  const card = c.card;
  return (
    <header className="hero-mesh relative overflow-hidden">
      <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        {textColumn}
        {card && (
          <Reveal delay={0.15}>
            <div className="relative mx-auto max-w-md">
              <div className="pack-halo absolute -inset-4 -z-10 rounded-[2.5rem] bg-brand-200/40 blur-2xl" />
              <div className="pack-card overflow-hidden border border-white/60 bg-surface/80 backdrop-blur">
                <div className="bg-brand-gradient p-8 text-brand-contrast">
                  {card.label && <p className="text-sm font-medium opacity-90">{card.label}</p>}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-extrabold">{card.prix}</span>
                    {card.unite && <span className="opacity-90">{card.unite}</span>}
                  </div>
                  {(card.mention || card.prixBarre) && (
                    <p className="mt-1 text-sm opacity-90">
                      {card.mention}
                      {card.prixBarre && (
                        <>
                          {" "}
                          <span className="line-through opacity-70">{card.prixBarre}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
                <div className="space-y-4 p-8">
                  {(card.points ?? []).map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                        <ShieldCheck className="size-4" />
                      </span>
                      <span className="text-sm font-medium text-ink-soft">{item}</span>
                    </div>
                  ))}
                  {card.rating && (
                    <div className="flex items-center gap-1 border-t border-border pt-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-accent-500 text-accent-500" />
                      ))}
                      {card.rating.label && (
                        <span className="ms-2 text-sm text-muted">{card.rating.label}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </Container>
    </header>
  );
}
