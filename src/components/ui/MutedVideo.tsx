"use client";

import { useEffect, useRef } from "react";

/**
 * Vidéo DÉFINITIVEMENT muette : rendue `muted`, elle se re-mute immédiatement si
 * l'utilisateur tente de réactiver le son via les contrôles natifs. Le son ne
 * peut donc jamais être entendu (à défaut de pouvoir retirer la piste audio du
 * fichier). Garde les contrôles (lecture/pause/plein écran).
 *
 * `autoPlayInView` (opt-in) : la vidéo se LANCE (muette, en boucle) quand elle
 * devient suffisamment visible à l'écran et se MET EN PAUSE quand on la quitte —
 * si plusieurs vidéos se suivent, celle qu'on quitte s'arrête et celle qu'on
 * atteint démarre. Respecte `prefers-reduced-motion` (pas de lecture auto).
 */
export function MutedVideo({
  src,
  poster,
  ariaLabel,
  className,
  autoPlayInView = false,
}: {
  src: string;
  poster?: string;
  ariaLabel?: string;
  className?: string;
  autoPlayInView?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoPlayInView) return;
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: [0, 0.6] },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [autoPlayInView]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      controls
      muted
      loop={autoPlayInView}
      playsInline
      preload="metadata"
      aria-label={ariaLabel}
      className={className}
      onVolumeChange={(e) => {
        const v = e.currentTarget;
        if (!v.muted) v.muted = true;
      }}
    />
  );
}
