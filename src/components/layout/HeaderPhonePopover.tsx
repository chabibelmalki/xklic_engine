"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Copy, Check } from "lucide-react";
import { cn, telHrefIntl, telIndicatif, telNeedsIndicatif } from "@/lib/utils";

/**
 * Icône téléphone du header : au clic, popup avec le numéro (cliquable) et un
 * bouton pour le copier. Alternative compacte à l'affichage du numéro en clair
 * (voir `contact.telephoneHeader` dans la config du site).
 */
export function HeaderPhonePopover({
  telephone,
  callLabel,
  copyLabel,
  copiedLabel,
  className,
}: {
  telephone: string;
  callLabel: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(telephone);
      setCopied(true);
    } catch {
      // Presse-papiers indisponible (permissions / contexte non sécurisé) : on ignore.
    }
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={callLabel}
        className="grid size-10 place-items-center rounded-full text-brand-600 transition-colors hover:bg-surface-2"
      >
        <Phone className="size-5" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={callLabel}
          className="absolute right-0 top-full z-50 mt-2 flex items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-bg px-3 py-2.5 shadow-lg"
        >
          <a
            href={telHrefIntl(telephone)}
            className="text-sm font-semibold text-ink transition-colors hover:text-brand-700"
          >
            {telNeedsIndicatif(telephone) && (
              <span className="text-[0.8em] font-medium text-muted">{telIndicatif()}</span>
            )}{" "}
            {telephone}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? copiedLabel : copyLabel}
            className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
