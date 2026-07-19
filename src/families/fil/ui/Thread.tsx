"use client";

import { useEffect, useRef, useState } from "react";
import type { EtapeItem } from "@/types/config";
import { cn } from "@/lib/utils";

/**
 * TIMELINE COUSUE — signature de la famille fil : un fil de couture SVG se
 * trace au fil du scroll et « noue » chaque étape à son passage. Composant
 * client (progression liée au scroll), mais SSR complet : tout le texte est
 * rendu côté serveur, le JS ne fait qu'animer. Sans JS ou sous
 * `prefers-reduced-motion`, le fil est entièrement cousu et toutes les étapes
 * nouées (état final, rien n'est masqué). Couleurs 100 % tokens.
 */
export function FilEtapesThread({ items }: { items: EtapeItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<SVGPathElement>(null);
  const knotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // SSR/no-JS : tout est noué (fil plein, nœuds actifs). Le client rembobine
  // puis coud au scroll — l'état n'est mis à jour que depuis les callbacks
  // rAF/scroll, jamais directement dans l'effet.
  const [doneCount, setDoneCount] = useState(items.length);

  useEffect(() => {
    const thread = threadRef.current;
    const root = rootRef.current;
    if (!thread || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const len = thread.getTotalLength();
    thread.style.strokeDasharray = `${len}`;
    thread.style.strokeDashoffset = `${len}`;

    let ticking = false;
    const update = () => {
      ticking = false;
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height - vh * 0.2)));
      thread.style.strokeDashoffset = `${len * (1 - p)}`;
      const threadY = r.top + r.height * p;
      let count = 0;
      for (const k of knotRefs.current) {
        if (!k) continue;
        const kr = k.getBoundingClientRect();
        if (threadY >= kr.top + kr.height / 2) count++;
      }
      setDoneCount(count);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  return (
    <div ref={rootRef} className="relative mx-auto mt-14 max-w-3xl">
      {/* Le fil : tracé pointillé (patron) + tracé plein qui se coud au scroll. */}
      <svg
        aria-hidden
        className="absolute left-[15px] top-0 h-full w-11 overflow-visible sm:left-[27px]"
        viewBox="0 0 44 1000"
        preserveAspectRatio="none"
      >
        <path
          d="M22,0 C34,80 10,160 22,250 C34,340 10,420 22,500 C34,580 10,660 22,750 C34,840 10,920 22,1000"
          fill="none"
          strokeLinecap="round"
          className="stroke-brand-200"
          strokeWidth="1.5"
          strokeDasharray="5 8"
        />
        <path
          ref={threadRef}
          d="M22,0 C34,80 10,160 22,250 C34,340 10,420 22,500 C34,580 10,660 22,750 C34,840 10,920 22,1000"
          fill="none"
          strokeLinecap="round"
          className="stroke-brand-600"
          strokeWidth="2.25"
        />
      </svg>
      <ol>
        {items.map((step, i) => {
          const done = i < doneCount;
          const last = i === items.length - 1;
          return (
            <li key={step.titre} className={cn("relative pl-[4.5rem] sm:pl-24", last ? "pb-0" : "pb-14")}>
              {/* Nœud : pastille cousue qui s'active au passage du fil. */}
              <span
                ref={(el) => {
                  knotRefs.current[i] = el;
                }}
                aria-hidden
                className={cn(
                  "absolute left-[26px] top-1.5 size-[22px] -translate-x-1/2 rounded-full border-[1.5px] bg-bg transition-all duration-500 sm:left-[38px]",
                  done
                    ? "border-brand-600 shadow-[0_0_0_6px_color-mix(in_srgb,var(--brand-600)_12%,transparent)]"
                    : "border-dashed border-accent-500/70",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-[5px] rounded-full bg-brand-600 transition-transform duration-500",
                    done ? "scale-100" : "scale-0",
                  )}
                />
              </span>
              <p
                className={cn(
                  "font-display text-sm tracking-[0.14em] transition-colors duration-500",
                  done ? "text-brand-700" : "text-accent-600",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-display text-xl text-ink sm:text-2xl">{step.titre}</h3>
              <p className="mt-2 max-w-xl leading-relaxed text-muted">{step.texte}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
