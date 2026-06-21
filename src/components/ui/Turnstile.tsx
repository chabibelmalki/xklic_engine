"use client";

import { useEffect, useRef } from "react";

// Widget Cloudflare Turnstile auto-contenu. Charge le script Cloudflare (une
// fois par page), monte le widget quand il apparaît, et injecte automatiquement
// un champ caché `cf-turnstile-response` DANS le <form> parent — récupérable via
// FormData côté handler. `onVerify` reste disponible pour les formulaires gérés
// par état React. Rendu uniquement si `siteKey` est fourni (repli gracieux).

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

export function Turnstile({
  siteKey,
  onVerify,
  className,
}: {
  siteKey?: string;
  onVerify?: (token: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Callback gardé à jour hors render : le widget n'est monté qu'une fois mais
  // doit toujours appeler la dernière version du handler.
  const cb = useRef(onVerify);
  useEffect(() => {
    cb.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    const el = ref.current;
    if (!siteKey || !el) return;
    let cancelled = false;

    function mount() {
      if (cancelled || !window.turnstile || !el || el.childElementCount) return;
      widgetId.current = window.turnstile.render(el, {
        sitekey: siteKey,
        callback: (t: string) => cb.current?.(t),
        "error-callback": () => cb.current?.(""),
        "expired-callback": () => cb.current?.(""),
      });
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = mount;
      document.head.appendChild(s);
    } else {
      mount();
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={ref} className={className} />;
}
