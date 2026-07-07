import Image from "next/image";
import { cn } from "@/lib/utils";

/** Ratio de cadre (traitement NET, sans radius — bords carrés du pack). */
function ratioClass(ratio?: string) {
  switch (ratio) {
    case "1/1":
      return "aspect-square";
    case "4/5":
      return "aspect-[4/5]";
    case "3/4":
      return "aspect-[3/4]";
    case "3/2":
      return "aspect-[3/2]";
    case "16/9":
      return "aspect-[16/9]";
    case "21/9":
      return "aspect-[21/9]";
    case "16/10":
      return "aspect-[16/10]";
    case "4/3":
    default:
      return "aspect-[4/3]";
  }
}

/**
 * Image PRESTIGE : plein cadre, `object-cover`, bords carrés (pas de radius). Un
 * voile sombre en dégradé (`scrim`) assombrit l'image pour maintenir le registre
 * nocturne et garantir le contraste AA de tout texte surimprimé — c'est de
 * l'infrastructure de lisibilité (noir non-marque), la marque reste dans l'or et
 * la typo. Filet métallique optionnel autour du cadre.
 */
export function PrestigeImage({
  src,
  alt,
  ratio,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  scrim = false,
  framed = false,
  className,
}: {
  src: string;
  alt: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  scrim?: boolean;
  framed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-[var(--px-void)]",
        ratioClass(ratio),
        framed && "ring-1 ring-[var(--px-hairline)]",
        className,
      )}
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {scrim && (
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,5,7,0.85)_0%,rgba(4,5,7,0.35)_55%,rgba(4,5,7,0.15)_100%)]" />
      )}
    </div>
  );
}
