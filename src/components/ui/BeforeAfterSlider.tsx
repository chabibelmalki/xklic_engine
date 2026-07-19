"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Comparateur AVANT / APRÈS — une seule image, un CURSEUR que l'on fait glisser
 * pour dévoiler l'état « après » par-dessus l'état « avant ». Pointeur + tactile,
 * et accessible au clavier via un `range` superposé (flèches gauche/droite).
 * Décor 100 % tokens ; réutilisable par n'importe quel site.
 */
export function BeforeAfterSlider({
  before,
  after,
  beforeLabel = "Avant",
  afterLabel = "Après",
  ratioClassName = "aspect-[4/3]",
  className,
}: {
  before: { url: string; alt?: string };
  after: { url: string; alt?: string };
  beforeLabel?: string;
  afterLabel?: string;
  ratioClassName?: string;
  className?: string;
}) {
  const [pos, setPos] = useState(50); // % révélé de l'« après »
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative select-none overflow-hidden rounded-[var(--radius-image)] ring-1 ring-border touch-none",
        ratioClassName,
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* APRÈS — plein cadre, dessous. */}
      <Image src={after.url} alt={after.alt ?? afterLabel} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
      {/* AVANT — au-dessus, rogné à droite selon la position du curseur. */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before.url} alt={before.alt ?? beforeLabel} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
      </div>

      {/* Étiquettes. */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
        {afterLabel}
      </span>

      {/* Ligne + poignée de séparation. */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.35)]" />
        <div className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-700 shadow-lg ring-1 ring-black/5">
          <MoveHorizontal className="size-5" />
        </div>
      </div>

      {/* Contrôle accessible (clavier + lecteurs d'écran), superposé et invisible. */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`${beforeLabel} / ${afterLabel}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
