import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import type { SiteConfig } from "@/types/config";
import { cn } from "@/lib/utils";

/**
 * Logo config-driven. Si `branding.logo` est fourni -> image. Sinon, marque
 * dégradée (initiale) + nom + tagline. `variant="light"` pour le footer sombre.
 *
 * `layout` : « inline » (défaut) = emblème à gauche, nom + tagline empilés à
 * droite. « stacked » = emblème + nom sur une ligne, tagline CENTRÉE en dessous
 * sur toute la largeur de l'ensemble (utilisé pour un header centré en mobile).
 */
export function Logo({
  config,
  href,
  variant = "default",
  layout = "inline",
  className,
}: {
  config: SiteConfig;
  href: string;
  variant?: "default" | "light";
  layout?: "inline" | "stacked";
  className?: string;
}) {
  const { logo, logoLight, logoAlt, logoTwoTone, logoScale, logoTextHidden, logoTaglineHidden } =
    config.branding;
  // Tagline masquable indépendamment (garder le nom, retirer la tagline).
  const tagline = logoTaglineHidden ? undefined : config.branding.tagline;
  const light = variant === "light";
  // Sur fond clair/sombre (footer, header en overlay), on préfère la variante
  // CLAIRE du logo si elle existe — un logo de couleur y manquerait de contraste.
  const logoSrc = light && logoLight ? logoLight : logo;
  const stacked = layout === "stacked";

  // Échelle du logo PROPRE AU SITE (défaut 1 = rendu historique h-9/max-w-160).
  // Appliquée en style inline pour ne toucher aucun autre site.
  const scale = logoScale && logoScale > 0 ? logoScale : 1;
  const scaledStyle =
    scale !== 1 ? { height: `${2.25 * scale}rem`, maxWidth: `${160 * scale}px` } : undefined;

  // Wordmark deux tons (couleurs de marque exactes, ex. « SANAD CLEAN » de l'OG) :
  // 1er mot dans `first`, le reste dans `rest`. Réservé au rendu clair (le footer
  // sombre garde le nom en blanc, lisible).
  let nameNode: ReactNode = config.entreprise.nom;
  if (logoTwoTone && !light) {
    const parts = config.entreprise.nom.trim().split(/\s+/);
    const first = parts.shift() ?? "";
    nameNode = (
      <>
        <span style={{ color: logoTwoTone.first }}>{first}</span>
        {parts.length > 0 && (
          <span style={{ color: logoTwoTone.rest }}>{` ${parts.join(" ")}`}</span>
        )}
      </>
    );
  }

  // Sur fond sombre (footer), un logo sombre/transparent disparaît : on le pose
  // dans une pastille ronde blanche (opt-in `branding.logoDarkBadge`).
  const darkBadge = light && !!logo && !!config.branding.logoDarkBadge;

  const emblem = logoSrc ? (
    darkBadge ? (
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white shadow-md ring-1 ring-black/5">
        <Image
          src={logoSrc}
          alt={logoAlt ?? config.entreprise.nom}
          width={160}
          height={160}
          className="size-9 object-contain"
          priority
        />
      </span>
    ) : (
      <Image
        src={logoSrc}
        alt={logoAlt ?? config.entreprise.nom}
        width={160}
        height={44}
        style={scaledStyle}
        className={cn(
          "w-auto shrink-0 object-contain",
          scale === 1 && "h-9 max-w-[160px]",
        )}
        priority
      />
    )
  ) : (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-brand-contrast shadow-md shadow-brand-600/30 transition-transform group-hover:scale-105">
      <Sparkles className="size-5" strokeWidth={2.4} />
    </span>
  );

  // Logo image contenant DÉJÀ le nom : n'afficher que l'emblème (anti-redondance
  // + garde-fou anti-débordement horizontal sur mobile). Reste cliquable.
  if (logoTextHidden && logoSrc) {
    return (
      <Link
        href={href}
        className={cn("group inline-flex items-center", className)}
        aria-label={config.entreprise.nom}
      >
        {emblem}
      </Link>
    );
  }

  const nameClass = cn(
    "font-display tracking-tight",
    // Layout empilé : titre légèrement réduit pour mieux s'aligner à l'emblème.
    stacked ? "text-base" : "text-lg",
    logoTwoTone ? "font-semibold" : "font-extrabold",
    light ? "text-white" : "text-ink",
  );
  const taglineClass = cn(
    "truncate text-[10px] font-medium uppercase tracking-[0.18em]",
    light ? "text-white/60" : "text-muted-2",
  );

  // Layout empilé : emblème + nom sur une ligne, tagline centrée en dessous sur
  // toute la largeur de l'ensemble (`w-full text-center`).
  if (stacked) {
    return (
      <Link
        href={href}
        className={cn("group inline-flex flex-col items-center gap-1.5 leading-none", className)}
        aria-label={config.entreprise.nom}
      >
        <span className="inline-flex items-center gap-4">
          {emblem}
          <span className={nameClass}>{nameNode}</span>
        </span>
        {tagline && <span className={cn("w-full text-center", taglineClass)}>{tagline}</span>}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-4", className)}
      aria-label={config.entreprise.nom}
    >
      {emblem}
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn("truncate", nameClass)}>{nameNode}</span>
        {tagline && <span className={cn("mt-1", taglineClass)}>{tagline}</span>}
      </span>
    </Link>
  );
}
