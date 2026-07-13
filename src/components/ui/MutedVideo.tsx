"use client";

/**
 * Vidéo DÉFINITIVEMENT muette : rendue `muted`, elle se re-mute immédiatement si
 * l'utilisateur tente de réactiver le son via les contrôles natifs. Le son ne
 * peut donc jamais être entendu (à défaut de pouvoir retirer la piste audio du
 * fichier). Garde les contrôles (lecture/pause/plein écran).
 */
export function MutedVideo({
  src,
  poster,
  ariaLabel,
  className,
}: {
  src: string;
  poster?: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <video
      src={src}
      poster={poster}
      controls
      muted
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
