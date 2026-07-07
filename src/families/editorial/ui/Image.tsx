import Image from "next/image";
import { cn } from "@/lib/utils";

/** Classe de ratio (traitement NET, sans radius ni ombre — anti-grammaire classic). */
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
 * Image éditoriale : plein cadre, `object-cover`, traitée NET — PAS de radius ni
 * d'ombre (à l'opposé de `.pack-image` de la famille classic).
 */
export function EditorialImage({
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
    <div className={cn("relative overflow-hidden bg-surface-2", ratioClass(ratio), className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
