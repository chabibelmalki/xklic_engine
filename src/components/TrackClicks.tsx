"use client";

import { useEffect } from "react";
import { getSessionId } from "@/lib/session";

/**
 * Îlot d'instrumentation UNIQUE : un seul listener de clic délégué, monté une
 * fois par `SiteRenderer`, qui capte les intentions de contact pour TOUS les
 * sites — sans toucher aux N composants qui rendent des liens tel/WhatsApp/
 * mailto/itinéraire (header, footer, bouton flottant, bloc Contact…).
 *
 * Ne capte PAS `form_submit` : il est émis côté serveur depuis /api/contact (au
 * succès réel du lead), pour un compteur aligné 1:1 sur la table `leads`.
 *
 * Garde-fous : POST seul, beacon (l'event part même si la page navigue), dédup
 * double-clic local (le serveur re-déduplique aussi), `pagePath` = pathname seul
 * (jamais de query string).
 */

type ClickType = "tel" | "whatsapp" | "mailto" | "directions";

/** WhatsApp = canal de contact (wa.me / api.whatsapp.com), pas un mot quelconque. */
const WHATSAPP_RE = /(?:wa\.me|api\.whatsapp\.com)/i;
/** Itinéraire = Google Maps (le lien d'AVIS g.page / writereview est exclu : pas de "/maps"). */
const MAPS_RE = /(?:google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.)/i;

const DEDUP_WINDOW_MS = 30_000;
const lastSent = new Map<string, number>();

function classify(href: string, dataTrack: string | undefined): ClickType | null {
  if (dataTrack === "tel" || dataTrack === "whatsapp" || dataTrack === "mailto" || dataTrack === "directions") {
    return dataTrack;
  }
  if (href.startsWith("tel:")) return "tel";
  if (href.startsWith("mailto:")) return "mailto";
  if (WHATSAPP_RE.test(href)) return "whatsapp";
  if (MAPS_RE.test(href)) return "directions";
  return null;
}

export function TrackClicks({ siteSlug }: { siteSlug: string }) {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const type = classify(href, (anchor as HTMLElement).dataset?.track);
      if (!type) return;

      const session = getSessionId();

      // Dédup local : évite même d'émettre un double-clic (le serveur re-vérifie).
      if (session) {
        const key = `${type}|${siteSlug}|${session}`;
        const now = Date.now();
        const prev = lastSent.get(key);
        if (prev !== undefined && now - prev < DEDUP_WINDOW_MS) return;
        lastSent.set(key, now);
      }

      const payload = JSON.stringify({
        type,
        siteSlug,
        pagePath: window.location.pathname, // pathname SEUL — jamais query/hash.
        session: session || undefined,
      });

      // Beacon : survit à la navigation (le clic peut quitter la page).
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon && navigator.sendBeacon("/api/track", blob)) return;
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }

    // Capture : on voit le clic même si un handler descendant fait stopPropagation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [siteSlug]);

  return null;
}
