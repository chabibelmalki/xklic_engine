"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Apparition douce au scroll, en CSS + IntersectionObserver.
 *
 * Robuste par construction :
 * - SSR et premier rendu client produisent EXACTEMENT le même markup
 *   (classe `reveal`, jamais de style inline) -> aucun mismatch d'hydratation.
 * - L'animation n'existe que sous `prefers-reduced-motion: no-preference`.
 *   En mouvement réduit, le contenu est rendu visible d'emblée.
 * - Si le JS échoue, un override `<noscript>` (voir layout) force la visibilité :
 *   le contenu n'est jamais bloqué à `opacity:0`.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Mouvement réduit : le CSS rend déjà `.reveal` visible (la règle opacity:0
    // est gated derrière `prefers-reduced-motion: no-preference`). Rien à faire.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", shown && "is-revealed", className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
