import { cn } from "@/lib/utils";

/**
 * Vignettes « carte bancaire » (Visa / Mastercard / American Express) en SVG
 * inline — aucune requête réseau, nettes sur fond clair comme sombre (chaque
 * marque est posée sur sa propre carte, coins arrondis). Usage nominatif :
 * indiquer les moyens de paiement acceptés. Une marque inconnue est ignorée.
 */

const CARD = "h-6 w-auto shrink-0 rounded-[3px] shadow-sm ring-1 ring-black/5";

function Visa() {
  return (
    <svg viewBox="0 0 48 32" role="img" aria-label="Visa" className={CARD}>
      <rect width="48" height="32" rx="4" fill="#ffffff" />
      <text
        x="24"
        y="21"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13"
        fontStyle="italic"
        fontWeight="700"
        letterSpacing="0.5"
        fill="#1434CB"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 48 32" role="img" aria-label="Mastercard" className={CARD}>
      <rect width="48" height="32" rx="4" fill="#ffffff" />
      <circle cx="20" cy="16" r="8.5" fill="#EB001B" />
      <circle cx="28" cy="16" r="8.5" fill="#F79E1B" />
      {/* Zone de recouvrement (orange foncé) pour l'effet Mastercard. */}
      <path
        d="M24 9.6a8.5 8.5 0 0 1 0 12.8 8.5 8.5 0 0 1 0-12.8Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function Amex() {
  return (
    <svg viewBox="0 0 48 32" role="img" aria-label="American Express" className={CARD}>
      <rect width="48" height="32" rx="4" fill="#1F72CD" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="9"
        fontWeight="700"
        letterSpacing="0.3"
        fill="#ffffff"
      >
        AMEX
      </text>
    </svg>
  );
}

const MARKS: Record<string, () => React.ReactElement> = {
  visa: Visa,
  mastercard: Mastercard,
  amex: Amex,
  americanexpress: Amex,
};

export function PaymentMarks({ ids, className }: { ids?: string[]; className?: string }) {
  const marks = (ids ?? [])
    .map((id) => MARKS[id.toLowerCase().replace(/[\s._-]/g, "")])
    .filter(Boolean) as (() => React.ReactElement)[];
  if (!marks.length) return null;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {marks.map((Mark, i) => (
        <Mark key={i} />
      ))}
    </div>
  );
}
