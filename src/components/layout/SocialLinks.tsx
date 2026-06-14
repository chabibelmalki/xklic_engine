import { SocialIcon } from "@/components/ui/SocialIcon";
import type { ResolvedSocial } from "@/lib/social";
import { cn } from "@/lib/utils";

/**
 * Rangée d'icônes réseaux sociaux. Config-driven : ne rend RIEN si la liste est
 * vide (pas de section morte). Chaque lien : nouvel onglet, `rel` sûr,
 * `aria-label` par réseau. Le style des pastilles est passé via `linkClassName`
 * pour s'adapter au contexte (footer sombre, hero clair…).
 */
export function SocialLinks({
  socials,
  className,
  linkClassName,
  iconClassName = "size-[18px]",
  ariaLabel,
}: {
  socials: ResolvedSocial[];
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
  ariaLabel: string;
}) {
  if (!socials.length) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-2.5", className)} aria-label={ariaLabel}>
      {socials.map((s) => (
        <li key={`${s.platform}-${s.href}`}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={cn(
              "grid place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              linkClassName,
            )}
          >
            <SocialIcon platform={s.platform} className={iconClassName} />
          </a>
        </li>
      ))}
    </ul>
  );
}
