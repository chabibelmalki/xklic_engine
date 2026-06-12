"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { localeLabel, localeFlagSrc } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Sélecteur de langue : menu déroulant avec DRAPEAU (SVG auto-hébergé) + libellé.
 * Pas un `<select>` natif (impossible d'y afficher des images, et les emojis
 * drapeaux ne s'affichent pas sous Windows). Préserve la page courante au
 * changement : `/en/tarifs` → FR donne `/tarifs`, AR donne `/ar/tarifs`. Marche en
 * prod (basePath "") comme en preview ("/preview/<slug>"). Helpers PURS uniquement.
 */
function Flag({ loc }: { loc: string }) {
  const src = localeFlagSrc(loc);
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={20}
      height={15}
      className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10"
    />
  );
}

export function LanguageSwitcher({
  locales,
  current,
  defaultLocale,
  basePath,
  ariaLabel,
  className,
}: {
  locales: string[];
  current: string;
  defaultLocale: string;
  /** basePath public, langue COMPRISE (ex. "", "/en", "/preview/x/ar"). */
  basePath: string;
  ariaLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Préfixe de base SANS la langue (ex. "" ou "/preview/x").
  const base =
    current === defaultLocale ? basePath : basePath.replace(new RegExp(`/${current}$`), "");

  function target(loc: string): string {
    let rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
    for (const l of locales) {
      if (l === defaultLocale) continue;
      if (rest === `/${l}` || rest.startsWith(`/${l}/`)) {
        rest = rest.slice(l.length + 1) || "/";
        break;
      }
    }
    const prefix = loc === defaultLocale ? "" : `/${loc}`;
    const tail = rest === "/" ? "" : rest;
    return `${base}${prefix}${tail}` || "/";
  }

  // Fermeture au clic extérieur / Échap.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function go(loc: string) {
    setOpen(false);
    if (loc !== current) router.push(target(loc));
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? "Language"}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 ps-2.5 pe-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Flag loc={current} />
        <span>{localeLabel(current)}</span>
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 min-w-full overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg"
        >
          {locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === current}>
              <button
                type="button"
                onClick={() => go(loc)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-2",
                  loc === current ? "font-semibold text-brand-700" : "text-ink",
                )}
              >
                <Flag loc={loc} />
                <span className="whitespace-nowrap">{localeLabel(loc)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
