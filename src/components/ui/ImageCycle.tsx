"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ImageRef } from "@/types/config";
import { cn } from "@/lib/utils";

/**
 * Diaporama d'images qui BASCULE automatiquement (fondu enchaîné), avec des
 * puces cliquables. Une seule « carte » présente ainsi plusieurs photos d'un même
 * chantier au lieu d'une carte par image. Respecte `prefers-reduced-motion`
 * (pas d'avance auto, les puces restent utilisables) et se met en pause au survol.
 *
 * - `fill`  : occupe le parent positionné (`relative` + dimensions) — ex. une
 *   cellule avant/après en `aspect-square`.
 * - sinon   : crée sa propre boîte au ratio `ratioClassName`.
 */
export function ImageCycle({
  images,
  fill = false,
  ratioClassName = "aspect-[4/3]",
  sizes = "(max-width: 640px) 100vw, 33vw",
  intervalMs = 2800,
  className,
}: {
  images: ImageRef[];
  fill?: boolean;
  ratioClassName?: string;
  sizes?: string;
  intervalMs?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = images.length;

  useEffect(() => {
    if (n <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % n), intervalMs);
    return () => window.clearInterval(id);
  }, [n, paused, intervalMs]);

  if (n === 0) return null;

  return (
    <div
      className={cn(fill ? "absolute inset-0" : cn("relative overflow-hidden", ratioClassName), className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((img, i) => (
        <Image
          key={i}
          src={img.url}
          alt={img.alt ?? ""}
          fill
          sizes={sizes}
          priority={i === 0}
          className={cn(
            "object-cover transition-opacity duration-700 ease-in-out",
            i === idx ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.6))]">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Image ${i + 1} / ${n}`}
              aria-current={i === idx}
              onClick={() => setIdx(i)}
              className={cn(
                "h-1.5 rounded-full bg-white transition-all",
                i === idx ? "w-5" : "w-1.5 opacity-60 hover:opacity-90",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
