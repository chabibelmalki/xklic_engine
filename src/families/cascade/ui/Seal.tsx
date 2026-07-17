import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SCEAU circulaire — SIGNATURE de la famille CASCADE. Reprend la promesse du
 * client (ex. « PROTÉGER AUJOURD'HUI · PRÉSERVER DEMAIN ») en texte courant sur un
 * cercle, avec une goutte au centre. Décor pur (aria-hidden). Tourne lentement
 * (classe scopée `.cascade-seal-spin`, coupée si `prefers-reduced-motion`).
 *
 * `seed` rend l'`id` du chemin UNIQUE (plusieurs sceaux sur une même page :
 * hero + cta + footer) — sinon deux `<textPath href>` pointeraient le même id.
 */
export function CascadeSeal({
  label,
  seed,
  tone = "light",
  className,
}: {
  label: string;
  seed: string;
  /** `light` : traits clairs (posé sur un dégradé sombre). `brand` : traits de marque (sur clair). */
  tone?: "light" | "brand";
  className?: string;
}) {
  const pathId = `cascade-seal-${seed}`;
  // Répète le libellé pour boucler proprement autour du cercle.
  const ring = `${label} · ${label} · `;
  const stroke = tone === "light" ? "rgba(255,255,255,0.9)" : "var(--brand-600)";
  const textColor = tone === "light" ? "rgba(255,255,255,0.92)" : "var(--brand-700)";

  return (
    <div className={cn("relative grid place-items-center", className)} aria-hidden>
      <svg viewBox="0 0 200 200" className="cascade-seal-spin size-full">
        <defs>
          <path id={pathId} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" fill="none" />
        </defs>
        <circle cx="100" cy="100" r="88" fill="none" stroke={stroke} strokeOpacity="0.35" strokeWidth="1" />
        <circle cx="100" cy="100" r="60" fill="none" stroke={stroke} strokeOpacity="0.25" strokeWidth="1" />
        <text fill={textColor} style={{ fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.18em" }}>
          <textPath href={`#${pathId}`} startOffset="0">
            {ring.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <Droplet
        className={cn(
          "absolute size-7",
          tone === "light" ? "fill-white/85 text-white/85" : "fill-accent-500 text-accent-500",
        )}
      />
    </div>
  );
}
