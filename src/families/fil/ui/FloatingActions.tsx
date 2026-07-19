"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { EditorialFloatingActions } from "../../editorial/chrome/FloatingActions";
import { cn } from "@/lib/utils";

/**
 * Boutons flottants FIL — même rendu que la version editorial (contrat
 * identique), mais MASQUÉS tant que le visiteur n'a pas quitté le hero : la
 * barre appel/WhatsApp n'apparaît qu'après un vrai scroll, pour laisser le
 * hero plein cadre respirer. Fondu en opacité uniquement (pas de transform :
 * un ancêtre transformé casserait le `position: fixed` des boutons).
 */
export function FilFloatingActions(props: ComponentProps<typeof EditorialFloatingActions>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "transition-opacity duration-500",
        !visible && "pointer-events-none opacity-0",
      )}
    >
      <EditorialFloatingActions {...props} />
    </div>
  );
}
