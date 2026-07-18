import Image from "next/image";
import { cn } from "@/lib/utils";
import { miterTR } from "./miter";

/** Ratio d'affichage (object-cover). */
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
    case "16/10":
      return "aspect-[16/10]";
    case "4/3":
    default:
      return "aspect-[4/3]";
  }
}

/**
 * Image ARONDE : cadre à COUPE D'ONGLET (coin haut-droit taillé), fin liseré
 * bois. Sans l'ombre lourde de la famille classic — le relief vient de la coupe,
 * pas d'un flottement. Couleurs 100 % tokens.
 */
export function ArondeImage({
  src,
  alt,
  ratio,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      style={miterTR(22)}
      className={cn(
        "relative overflow-hidden bg-surface-2 ring-1 ring-brand-100",
        ratioClass(ratio),
        className,
      )}
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
