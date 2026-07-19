"use client";

import { useState } from "react";
import { brandColorStyle } from "@/lib/colors";
import { cn } from "@/lib/utils";

/**
 * NUANCIER — démonstration interactive « votre marque a sa teinte » : chaque
 * pastille recolore le site EN DIRECT en réécrivant les tokens `--brand-*` /
 * `--accent-*` sur le conteneur racine (même génération de palette que le
 * moteur : `brandColorStyle`, harmonie + contrastes garantis). Purement
 * décoratif/argumentaire : rien n'est persisté, un rechargement revient à la
 * palette de la config. Opt-in via `hero.nuancier` (famille fil uniquement).
 */
export function FilNuancier({
  couleurs,
  accent,
  label,
}: {
  couleurs: string[];
  /** Accent (échantillon sable…) conservé tel quel lors du changement de teinte. */
  accent?: string;
  label?: string;
}) {
  const [selected, setSelected] = useState(0);

  const applique = (hex: string, i: number, el: HTMLElement) => {
    const root = el.closest("[data-pack]") as HTMLElement | null;
    if (!root) return;
    const style = brandColorStyle({ brand: hex, accent });
    if (!style) return;
    for (const [k, v] of Object.entries(style)) {
      if (typeof v === "string") root.style.setProperty(k, v);
    }
    setSelected(i);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
          {label}
        </span>
      )}
      <div className="flex items-center gap-3" role="group" aria-label={label ?? "Nuancier"}>
        {couleurs.map((hex, i) => (
          <button
            key={hex}
            type="button"
            aria-pressed={selected === i}
            aria-label={hex}
            onClick={(e) => applique(hex, i, e.currentTarget)}
            style={{ backgroundColor: hex }}
            className={cn(
              "relative size-8 cursor-pointer rounded-full border-2 border-white/85 shadow-md transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              selected === i && "scale-110 ring-[3px] ring-white/40",
            )}
          >
            {selected === i && (
              <span aria-hidden className="absolute inset-[9px] rounded-full bg-white/90" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
