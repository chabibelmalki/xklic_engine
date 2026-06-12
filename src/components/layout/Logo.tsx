import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { SiteConfig } from "@/types/config";
import { cn } from "@/lib/utils";

/**
 * Logo config-driven. Si `branding.logo` est fourni -> image. Sinon, marque
 * dégradée (initiale) + nom + tagline. `variant="light"` pour le footer sombre.
 */
export function Logo({
  config,
  href,
  variant = "default",
  className,
}: {
  config: SiteConfig;
  href: string;
  variant?: "default" | "light";
  className?: string;
}) {
  const { logo, logoAlt, tagline } = config.branding;
  const light = variant === "light";

  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={config.entreprise.nom}
    >
      {logo ? (
        <Image
          src={logo}
          alt={logoAlt ?? config.entreprise.nom}
          width={160}
          height={44}
          className="h-9 w-auto max-w-[160px] shrink-0 object-contain"
          priority
        />
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-brand-contrast shadow-md shadow-brand-600/30 transition-transform group-hover:scale-105">
          <Sparkles className="size-5" strokeWidth={2.4} />
        </span>
      )}
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "truncate font-display text-lg font-extrabold tracking-tight",
            light ? "text-white" : "text-ink",
          )}
        >
          {config.entreprise.nom}
        </span>
        {tagline && (
          <span
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-[0.18em]",
              light ? "text-white/60" : "text-muted-2",
            )}
          >
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
