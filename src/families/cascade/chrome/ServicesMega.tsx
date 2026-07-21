"use client";

import { useRef, useState, useCallback, useId } from "react";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServicesMegaData } from "./services-menu";

/**
 * Méga-menu « Services » (desktop, ≥ lg) : déclencheur en pilule (comme les
 * autres liens du nav) qui ouvre au SURVOL et au CLIC un panneau à deux colonnes
 * — onglets de catégories à gauche, sous-services de la catégorie active à
 * droite. Clavier : le lien reste focusable (ouvre au focus), Échap ferme.
 * Décor 100 % tokens. Le lien pointe vers /services (SSR + sans JS).
 */
export function ServicesMega({
  label,
  data,
  active,
  overviewLabel,
}: {
  label: string;
  data: ServicesMegaData;
  active: boolean;
  overviewLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const panelId = useId();

  const openNow = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }, []);
  const closeSoon = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 140);
  }, []);

  const cats = data.categories;
  const current = cats[tab] ?? cats[0];

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <a
        href={data.href}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onFocus={openNow}
        onClick={(e) => {
          // Clic desktop : ouvrir/fermer le panneau plutôt que naviguer.
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          active || open ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
        )}
      >
        {label}
        <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
      </a>

      {open && (
        <div
          id={panelId}
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
          className="absolute start-0 top-full z-50 mt-2 w-[42rem] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)]"
        >
          <span
            aria-hidden
            className="block h-1 w-full"
            style={{ background: "linear-gradient(90deg, var(--brand-500), var(--accent-500))" }}
          />
          <div className="grid grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            {/* Onglets = catégories */}
            <ul className="border-e border-border bg-[color-mix(in_srgb,var(--brand-500)_4%,var(--bg))] p-2.5">
              {cats.map((c, i) => (
                <li key={c.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setTab(i)}
                    onFocus={() => setTab(i)}
                    aria-current={i === tab ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition-colors",
                      i === tab
                        ? "bg-surface text-brand-700 shadow-sm"
                        : "text-ink-soft hover:bg-surface/70 hover:text-brand-700",
                    )}
                  >
                    <span className="truncate">{c.label}</span>
                    <ChevronRight className="size-4 shrink-0 opacity-50" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Sous-services de la catégorie active */}
            <div className="min-w-0 p-3.5">
              <a
                href={current.href}
                className="group mb-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-ink hover:text-brand-700"
              >
                {current.label}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              {current.items.length > 0 ? (
                <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {current.items.map((s) => (
                    <li key={s.href} className="min-w-0">
                      <a
                        href={s.href}
                        className="block truncate rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
                        title={s.label}
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <a
                  href={current.href}
                  className="block rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700"
                >
                  {overviewLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
