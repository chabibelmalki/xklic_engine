import type { BlockComponentProps } from "./types";

/**
 * Rendu de repli pour un type de bloc non enregistré. En production : rien
 * (dégradation propre, on n'affiche jamais d'erreur au visiteur). En dev : un
 * encart visible pour repérer le bloc manquant.
 */
export function Unknown({ block }: BlockComponentProps) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="mx-auto my-4 max-w-3xl rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      ⚠️ Bloc <code className="font-mono font-bold">{block.type}</code> inconnu — aucun composant
      enregistré dans <code className="font-mono">catalog.ts</code>. Le bloc est ignoré en
      production.
    </div>
  );
}
