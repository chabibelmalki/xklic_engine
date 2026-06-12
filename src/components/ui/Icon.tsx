import { icons } from "lucide-react";
import { Sparkles } from "lucide-react";

/**
 * Icône lucide par nom (PascalCase, ex. "Wrench", "Sparkles"). Nom inconnu ou
 * absent -> Sparkles par défaut : un bloc avec une icône non reconnue dégrade
 * proprement.
 */
export function Icon({ name, className }: { name?: string; className?: string }) {
  const Cmp = (name && (icons as Record<string, typeof Sparkles>)[name]) || Sparkles;
  return <Cmp className={className} aria-hidden />;
}
