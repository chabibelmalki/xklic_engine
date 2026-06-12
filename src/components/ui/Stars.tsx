import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Rangée d'étoiles (note /5). Demi-étoile arrondie au plus proche. */
export function Stars({ note = 5, className }: { note?: number; className?: string }) {
  const full = Math.round(note);
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-amber-500", className)} aria-label={`${note}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i < full ? "currentColor" : "none"}
          strokeWidth={i < full ? 0 : 1.5}
        />
      ))}
    </span>
  );
}
