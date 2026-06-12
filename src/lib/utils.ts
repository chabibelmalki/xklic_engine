import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind sans conflit. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formate un montant en euros (français). */
export function formatEUR(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** Slugifie un libellé (accents -> ascii, espaces -> tirets). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Nettoie un numéro de téléphone pour un lien tel:/wa.me (chiffres + indicatif). */
export function telHref(phone: string): string {
  return "tel:" + phone.replace(/[^+0-9]/g, "");
}

export function waHref(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "").replace(/^0/, "33");
  return `https://wa.me/${digits}`;
}

/**
 * Préfixe un lien INTERNE par le `basePath` (ex. "/preview/<slug>"). Laisse
 * intacts les liens externes (http, tel, mailto), les ancres (#) et les liens
 * déjà absolus de protocole. "/" devient `basePath` (ou "/").
 */
export function withBase(basePath: string | undefined, href: string): string {
  if (!href) return href;
  if (/^(https?:|tel:|mailto:|#)/.test(href) || href.startsWith("//")) return href;
  if (!href.startsWith("/")) return href;
  const bp = basePath ?? "";
  if (href === "/") return bp || "/";
  return `${bp}${href}`;
}
