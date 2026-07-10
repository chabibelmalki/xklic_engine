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

/**
 * Lien tel: au format INTERNATIONAL (défaut France = +33). On retire le 0 de
 * tête national et on préfixe l'indicatif — un lien +33… se compose depuis
 * n'importe quel pays (indispensable pour un client qui appelle de l'étranger).
 * Entrée attendue : numéro national FR ("06-58-660-660"). Idempotent si le
 * numéro est déjà international.
 */
export function telHrefIntl(phone: string, cc = "33"): string {
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  else if (digits.startsWith(cc)) digits = digits.slice(cc.length);
  return `tel:+${cc}${digits}`;
}

/** Indicatif d'affichage entre parenthèses (« (+33) ») à poser en discret devant
 *  le numéro national. Présentation voulue par le client (plus propre). */
export function telIndicatif(cc = "33"): string {
  return `(+${cc})`;
}

/**
 * Faut-il afficher l'indicatif « (+33) » devant CE numéro ? Non si le numéro
 * porte DÉJÀ un indicatif international (« +33 … » ou « 0033 … ») — sinon on
 * doublonne. Oui pour un numéro national (« 06 … »). Le lien tel: reste géré à
 * part par `telHrefIntl` (idempotent). */
export function telNeedsIndicatif(phone: string): boolean {
  return !/^\s*(\+|00)/.test(phone);
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
