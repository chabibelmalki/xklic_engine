"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CreditCard,
  Check,
  X,
  Settings2,
  Search,
  Phone,
} from "lucide-react";
import type { CatalogueContent } from "@/types/config";
import type { BlockComponentProps } from "./types";
import { findBlock } from "@/lib/pages";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";
import { cn, formatEUR, telHrefIntl } from "@/lib/utils";
import {
  type DeliveryZone,
  type GeoPlace,
  isInZone,
  isZoneRestricted,
} from "@/lib/delivery-zone";

/**
 * Catalogue — boutique en ligne LIVE. Les produits, prix et stocks viennent du
 * back-office à CHAQUE affichage (fetch client → proxy /api/shop/catalog), et le
 * paiement passe par /api/shop/checkout → session Stripe hosted du marchand.
 *
 * Distinct du bloc `boutique` (articles statiques, sortie en demande de devis) :
 * ici le client PAIE. Le prix affiché est informatif — la source de vérité reste
 * le back-office, qui recalcule tout au moment du checkout.
 *
 * Produits à OPTIONS (menus, formules : « 2 accompagnements au choix ») : la
 * carte ouvre un configurateur ; chaque composition distincte devient une ligne
 * de panier à part. Le client n'envoie que des ids — les suppléments sont relus
 * en base par le back-office.
 */

interface ShopOptionChoice {
  id: string;
  name: string;
  price_delta_cents: number;
  /** Choix lié à un produit du catalogue (image + disponibilité en découlent). */
  product_id?: string | null;
  image?: string;
  /** false si le produit lié est inactif/épuisé — choix non sélectionnable. */
  available?: boolean;
}
interface ShopOptionGroup {
  id: string;
  name: string;
  min: number;
  max: number;
  choices: ShopOptionChoice[];
}
interface ShopProduct {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price_cents: number;
  images: string[];
  stock: number | null; // null = stock illimité
  in_stock: boolean;
  options?: ShopOptionGroup[];
}
interface ShopCategory {
  id: string;
  name: string;
}
interface ShopDelivery {
  id: string;
  kind: string;
  label: string;
  price_cents: number;
  details: string;
  /** Zone de livraison (back-office). Filtre les communes proposées au checkout. */
  zone?: DeliveryZone;
  /** Sous-total (centimes) à partir duquel la livraison devient gratuite. 0 = jamais. */
  free_over_cents?: number;
}
interface ShopCatalog {
  tenant: { name: string; checkout_enabled: boolean };
  categories: ShopCategory[];
  products: ShopProduct[];
  delivery_methods: ShopDelivery[];
}

/** Choix retenus dans le configurateur : groupId → liste d'ids (répétitions OK). */
type Selection = Record<string, string[]>;

/** Une ligne de panier : un produit + UNE composition (les compositions
 *  différentes du même produit font des lignes distinctes). */
interface CartLine {
  key: string;
  productId: string;
  sel: Selection;
  qty: number;
}

const euros = (cents: number) => formatEUR(cents / 100);

/** Stock exploitable côté UI : null = illimité. */
const stockOf = (p: ShopProduct) => (p.stock == null ? Number.POSITIVE_INFINITY : p.stock);

/** Normalise pour la recherche : minuscules + sans accents (« Poêlée » ~ « poelee »). */
const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Classe de fond correspondant au ton de la section (barre de recherche sticky). */
function toneBgClass(tone?: string): string {
  switch (tone) {
    case "alt":
      return "bg-alt";
    case "surface":
      return "bg-surface";
    case "surface-2":
      return "bg-surface-2";
    case "brand":
      return "bg-brand-50";
    default:
      return "bg-bg";
  }
}

/** Clé stable d'une composition (produit + choix triés par groupe). */
function selKey(productId: string, sel: Selection): string {
  const parts = Object.keys(sel)
    .filter((g) => sel[g].length > 0)
    .sort()
    .map((g) => `${g}=${[...sel[g]].sort().join(",")}`);
  return `${productId}|${parts.join("|")}`;
}

/** Prix unitaire affiché = base + suppléments des choix (indicatif : le
 *  back-office recalcule depuis la DB au paiement). */
function unitPriceCents(p: ShopProduct, sel: Selection): number {
  let total = p.price_cents;
  for (const g of p.options ?? []) {
    for (const id of sel[g.id] ?? []) {
      const c = g.choices.find((x) => x.id === id);
      if (c) total += c.price_delta_cents;
    }
  }
  return total;
}

/** Composition valide = chaque groupe entre min et max choix. */
function selValid(p: ShopProduct, sel: Selection): boolean {
  return (p.options ?? []).every((g) => {
    const n = (sel[g.id] ?? []).length;
    return n >= g.min && n <= g.max;
  });
}

/** Résumé lisible d'une composition, pour le panier (« Accompagnements : Riz… »). */
function selSummary(p: ShopProduct, sel: Selection): string[] {
  const out: string[] = [];
  for (const g of p.options ?? []) {
    const ids = sel[g.id] ?? [];
    if (!ids.length) continue;
    const names = ids.map((id) => g.choices.find((c) => c.id === id)?.name ?? "?");
    out.push(`${g.name} : ${names.join(", ")}`);
  }
  return out;
}

/** Un choix est-il sélectionnable ? (libre = toujours ; lié = selon dispo produit) */
const isAvail = (c: ShopOptionChoice) => c.available !== false;

/** La composition référence-t-elle uniquement des groupes/choix encore existants,
 *  disponibles et valides ? (le marchand a pu éditer le menu / un composant a pu
 *  passer en rupture entre-temps) */
function selStillValid(p: ShopProduct, sel: Selection): boolean {
  for (const gid of Object.keys(sel)) {
    const g = (p.options ?? []).find((x) => x.id === gid);
    if (!g) return false;
    for (const cid of sel[gid]) {
      const c = g.choices.find((x) => x.id === cid);
      if (!c || !isAvail(c)) return false;
    }
  }
  return selValid(p, sel);
}

function ShopProductCard({
  product,
  qty,
  onAdd,
  onDec,
}: {
  product: ShopProduct;
  qty: number;
  onAdd: () => void;
  onDec: () => void;
}) {
  const out = !product.in_stock;
  const maxed = qty >= stockOf(product);
  const hasOptions = (product.options?.length ?? 0) > 0;
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-theme border bg-surface shadow-sm transition-all duration-300",
        out
          ? "border-border opacity-70"
          : "hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/5",
        qty > 0 ? "border-brand-500 ring-1 ring-brand-500" : "border-border hover:border-brand-200",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-6xl">
            <span aria-hidden>🛍️</span>
          </div>
        )}
        {out && (
          <span className="absolute start-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-surface shadow-sm">
            Épuisé
          </span>
        )}
        {!out && product.stock != null && product.stock <= 3 && (
          <span className="absolute start-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-accent-contrast shadow-sm">
            Plus que {product.stock}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-display text-lg font-bold text-ink">{product.name}</h4>
        {product.description && (
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{product.description}</p>
        )}
        {hasOptions && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700">
            <Settings2 className="size-3.5" />
            {product.options!.map((g) => g.name).join(" · ")} au choix
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="font-display text-lg font-extrabold text-brand-700">
            {euros(product.price_cents)}
          </span>

          {out ? (
            <span className="text-sm font-medium text-muted">Indisponible</span>
          ) : hasOptions ? (
            /* Produit à composer : le configurateur gère les quantités ; le
               badge indique combien sont déjà au panier (toutes compositions). */
            <div className="flex items-center gap-2">
              {qty > 0 && (
                <span className="grid size-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-brand-contrast">
                  {qty}
                </span>
              )}
              <Button type="button" onClick={onAdd} size="sm" variant={qty > 0 ? "outline" : undefined} disabled={maxed}>
                <Plus className="size-4" /> {qty > 0 ? "Encore un" : "Composer"}
              </Button>
            </div>
          ) : qty > 0 ? (
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
              <button
                type="button"
                aria-label="Retirer un exemplaire"
                onClick={onDec}
                className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-7 text-center text-sm font-bold tabular-nums text-ink">{qty}</span>
              <button
                type="button"
                aria-label="Ajouter un exemplaire"
                onClick={onAdd}
                disabled={maxed}
                className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2 disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <Button type="button" onClick={onAdd} size="sm" variant="outline">
              <Plus className="size-4" /> Ajouter
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Ligne compacte — layout « menu » (carte de restaurant) : vignette carrée à
 * gauche, nom + description au centre, prix + action à droite. Dense : on voit
 * beaucoup d'articles sans scroller. Même logique d'ajout que la carte.
 */
function ShopProductRow({
  product,
  qty,
  onAdd,
  onDec,
}: {
  product: ShopProduct;
  qty: number;
  onAdd: () => void;
  onDec: () => void;
}) {
  const out = !product.in_stock;
  const maxed = qty >= stockOf(product);
  const hasOptions = (product.options?.length ?? 0) > 0;
  const lowStock = !out && product.stock != null && product.stock <= 3;
  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-theme border bg-surface p-3 shadow-sm transition-colors sm:gap-4",
        out
          ? "border-border opacity-70"
          : qty > 0
            ? "border-brand-500 ring-1 ring-brand-500"
            : "border-border hover:border-brand-200",
      )}
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-[4.5rem]">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="72px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100 font-display text-2xl font-bold text-brand-700/70">
            {(product.name || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h4 className="truncate font-display text-base font-bold text-ink">{product.name}</h4>
        {product.description && (
          <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted">
            {product.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-display text-sm font-extrabold text-brand-700">
            {euros(product.price_cents)}
          </span>
          {hasOptions && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
              <Settings2 className="size-3" /> à composer
            </span>
          )}
          {lowStock && (
            <span className="text-xs font-medium text-accent-600">Plus que {product.stock}</span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {out ? (
          <span className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted">
            Épuisé
          </span>
        ) : hasOptions ? (
          <div className="flex items-center gap-2">
            {qty > 0 && (
              <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-brand-contrast">
                {qty}
              </span>
            )}
            <Button
              type="button"
              onClick={onAdd}
              size="sm"
              variant={qty > 0 ? "outline" : undefined}
              disabled={maxed}
            >
              <Plus className="size-4" /> Composer
            </Button>
          </div>
        ) : qty > 0 ? (
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            <button
              type="button"
              aria-label="Retirer un exemplaire"
              onClick={onDec}
              className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center text-sm font-bold tabular-nums text-ink">{qty}</span>
            <button
              type="button"
              aria-label="Ajouter un exemplaire"
              onClick={onAdd}
              disabled={maxed}
              className="grid size-8 place-items-center rounded-full text-ink hover:bg-surface-2 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Ajouter ${product.name}`}
            className="grid size-9 place-items-center rounded-full bg-brand-600 text-brand-contrast transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="size-5" />
          </button>
        )}
      </div>
    </article>
  );
}

/**
 * Configurateur d'un produit à options (modal) : un bloc par groupe — boutons
 * exclusifs quand le groupe attend UN choix, compteurs sinon (répéter un choix
 * est permis : 2× le même accompagnement). Prix mis à jour en direct.
 */
function ProductConfigurator({
  product,
  onConfirm,
  onClose,
}: {
  product: ShopProduct;
  onConfirm: (sel: Selection) => void;
  onClose: () => void;
}) {
  const [sel, setSel] = useState<Selection>({});
  const groups = product.options ?? [];
  const valid = selValid(product, sel);
  const price = unitPriceCents(product, sel);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function countOf(g: ShopOptionGroup, choiceId: string): number {
    return (sel[g.id] ?? []).filter((id) => id === choiceId).length;
  }
  function groupCount(g: ShopOptionGroup): number {
    return (sel[g.id] ?? []).length;
  }
  function pickOne(g: ShopOptionGroup, choiceId: string) {
    setSel((prev) => {
      const cur = prev[g.id] ?? [];
      // Groupe à choix unique : re-cliquer désélectionne (si facultatif).
      if (cur[0] === choiceId && g.min === 0) return { ...prev, [g.id]: [] };
      return { ...prev, [g.id]: [choiceId] };
    });
  }
  function inc(g: ShopOptionGroup, choiceId: string) {
    setSel((prev) => {
      const cur = prev[g.id] ?? [];
      if (cur.length >= g.max) return prev;
      return { ...prev, [g.id]: [...cur, choiceId] };
    });
  }
  function dec(g: ShopOptionGroup, choiceId: string) {
    setSel((prev) => {
      const cur = [...(prev[g.id] ?? [])];
      const i = cur.indexOf(choiceId);
      if (i === -1) return prev;
      cur.splice(i, 1);
      return { ...prev, [g.id]: cur };
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Composer ${product.name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-theme bg-surface shadow-2xl sm:rounded-theme">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">{product.name}</h3>
            <p className="text-sm text-muted">Composez votre choix</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {groups.map((g) => {
            const n = groupCount(g);
            const done = n >= g.min && n <= g.max;
            const hint =
              g.min === g.max
                ? `Choisissez-en ${g.max}`
                : g.min === 0
                  ? `Jusqu'à ${g.max} (facultatif)`
                  : `Entre ${g.min} et ${g.max}`;
            return (
              <fieldset key={g.id}>
                <legend className="flex w-full items-center justify-between gap-3">
                  <span className="font-display text-base font-bold text-ink">{g.name}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      done ? "bg-brand-50 text-brand-700" : "bg-surface-2 text-muted",
                    )}
                  >
                    {done && n > 0 && <Check className="size-3.5" />}
                    {g.max > 1 ? `${n}/${g.max} · ${hint}` : hint}
                  </span>
                </legend>
                <div className="mt-3 space-y-2">
                  {g.choices.map((c) => {
                    const cnt = countOf(g, c.id);
                    const selected = cnt > 0;
                    const avail = isAvail(c);
                    const groupFull = groupCount(g) >= g.max;
                    const thumb = c.image ? (
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-lg">
                        <Image src={c.image} alt="" fill sizes="36px" className="object-cover" />
                      </span>
                    ) : null;
                    const nameEl = (
                      <span className="flex min-w-0 items-center gap-2 font-medium text-ink">
                        <span className="truncate">{c.name}</span>
                        {c.price_delta_cents > 0 && (
                          <span className="shrink-0 text-xs font-semibold text-muted">
                            +{euros(c.price_delta_cents)}
                          </span>
                        )}
                      </span>
                    );
                    return (
                      <div
                        key={c.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-xl border p-2.5 text-sm transition-colors",
                          !avail
                            ? "border-border opacity-55"
                            : selected
                              ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500"
                              : "border-border hover:border-brand-200",
                        )}
                      >
                        {!avail ? (
                          <>
                            <span className="flex min-w-0 items-center gap-2.5">
                              {thumb}
                              {nameEl}
                            </span>
                            <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">
                              Épuisé
                            </span>
                          </>
                        ) : g.max === 1 ? (
                          <button
                            type="button"
                            onClick={() => pickOne(g, c.id)}
                            className="flex flex-1 items-center justify-between gap-3 text-start"
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span
                                className={cn(
                                  "grid size-4.5 shrink-0 place-items-center rounded-full border",
                                  selected ? "border-brand-600 bg-brand-600" : "border-border",
                                )}
                              >
                                {selected && <Check className="size-3 text-brand-contrast" />}
                              </span>
                              {thumb}
                              {nameEl}
                            </span>
                          </button>
                        ) : (
                          <>
                            <span className="flex min-w-0 items-center gap-2.5">
                              {thumb}
                              {nameEl}
                            </span>
                            {selected ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface p-0.5">
                                <button
                                  type="button"
                                  aria-label={`Retirer ${c.name}`}
                                  onClick={() => dec(g, c.id)}
                                  className="grid size-7 place-items-center rounded-full text-ink hover:bg-surface-2"
                                >
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold tabular-nums">{cnt}</span>
                                <button
                                  type="button"
                                  aria-label={`Ajouter ${c.name}`}
                                  onClick={() => inc(g, c.id)}
                                  disabled={groupFull}
                                  className="grid size-7 place-items-center rounded-full text-ink hover:bg-surface-2 disabled:opacity-40"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => inc(g, c.id)}
                                disabled={groupFull}
                                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
                              >
                                Choisir
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <div className="border-t border-border p-5">
          <Button
            type="button"
            size="lg"
            disabled={!valid}
            onClick={() => valid && onConfirm(sel)}
            className="h-auto min-h-13 w-full whitespace-normal py-3 text-center leading-tight"
          >
            <ShoppingBag className="size-5" />
            Ajouter au panier — {euros(price)}
          </Button>
          {!valid && (
            <p className="mt-2 text-center text-xs text-muted">
              Complétez les choix ci-dessus pour continuer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CatalogueLive({
  block,
  config,
  tone,
  basePath = "",
  turnstileSiteKey,
}: BlockComponentProps<CatalogueContent>) {
  const c = block.content;

  const [catalog, setCatalog] = useState<ShopCatalog | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [configuring, setConfiguring] = useState<ShopProduct | null>(null);
  const [deliveryId, setDeliveryId] = useState<string>("");
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  // Nom ALÉATOIRE du honeypot anti-bot, posé après le montage (voir plus bas) :
  // aucun gestionnaire de mots de passe / autofill ne remplit un champ au nom
  // inconnu — ce qui bloquait silencieusement de vrais clients. Vide avant le
  // montage ⇒ le champ n'est pas rendu (pas de mismatch d'hydratation).
  const [hpName, setHpName] = useState("");
  // Adresse de livraison (étape 2, modes qui livrent). `commune` est résolue par
  // l'autocomplétion géo (sert au matching de zone) ; line1/complement sont libres.
  const [addrLine1, setAddrLine1] = useState("");
  const [addrComplement, setAddrComplement] = useState("");
  const [commune, setCommune] = useState<GeoPlace | null>(null);
  const [communeQuery, setCommuneQuery] = useState("");
  const [communeResults, setCommuneResults] = useState<GeoPlace[]>([]);
  const [communeOpen, setCommuneOpen] = useState(false);
  const [communeSearching, setCommuneSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const stepTopRef = useRef<HTMLDivElement>(null);
  const catBarRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const rawConf = c.confidentialiteHref ?? "/confidentialite";
  const confidentialiteHref = rawConf.startsWith("http") ? rawConf : `${basePath}${rawConf}`;

  // Téléphone du site (bloc contact) : pour le lien discret « Appelez-nous » à
  // l'étape paiement, où l'on masque les boutons flottants (voir data-checkout).
  const contactPhone = findBlock<{ telephone?: string }>(config, "contact")?.content?.telephone;

  async function loadCatalog() {
    try {
      const res = await fetch(`/api/shop/catalog?site=${encodeURIComponent(config.slug)}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as ShopCatalog;
      setCatalog(data);
      setLoadError(false);
      // panier ↦ catalogue frais : lignes dont le produit/la composition a
      // disparu retirées, quantités écrêtées sur le stock CUMULÉ par produit.
      setCart((prev) => {
        const next: CartLine[] = [];
        const used: Record<string, number> = {};
        for (const line of prev) {
          const p = data.products.find((x) => x.id === line.productId);
          if (!p || !p.in_stock || !selStillValid(p, line.sel)) continue;
          const left = stockOf(p) - (used[p.id] ?? 0);
          const qty = Math.min(line.qty, left);
          if (qty <= 0) continue;
          used[p.id] = (used[p.id] ?? 0) + qty;
          next.push({ ...line, qty });
        }
        return next;
      });
      if (data.delivery_methods.length > 0) {
        setDeliveryId((cur) =>
          data.delivery_methods.some((d) => d.id === cur) ? cur : data.delivery_methods[0].id,
        );
      }
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    // loadCatalog ne pose l'état qu'APRÈS `await fetch` (microtâche) : pas de
    // rendu en cascade synchrone, la règle set-state-in-effect est ici un faux
    // positif (chargement asynchrone légitime au montage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.slug]);

  // ── Panier persistant : survit au rechargement de page (localStorage, par
  // site). Restauré au montage puis réconcilié contre le catalogue frais par
  // loadCatalog (lignes périmées retirées, stock écrêté). Clé par slug pour ne
  // jamais mélanger deux boutiques du parc. ─────────────────────────────────
  const cartKey = `xklic:cart:${config.slug}`;
  useEffect(() => {
    let saved: CartLine[] | null = null;
    try {
      const raw = localStorage.getItem(cartKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) saved = parsed as CartLine[];
      }
    } catch {
      /* localStorage indisponible (navigation privée, quota) : panier éphémère */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setCart(saved);
  }, [cartKey]);

  // Sauvegarde à chaque changement. On saute le tout premier rendu (panier vide
  // initial) pour ne pas écraser la sauvegarde avant que la restauration ait eu lieu.
  const cartPersistReady = useRef(false);
  useEffect(() => {
    if (!cartPersistReady.current) {
      cartPersistReady.current = true;
      return;
    }
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, cartKey]);

  // Honeypot : nom aléatoire posé au montage (côté client uniquement). Un champ
  // au nom imprévisible n'est rempli par aucun autofill/gestionnaire de mots de
  // passe ; un bot qui remplit tout le remplira quand même.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHpName("hp_" + Math.random().toString(36).slice(2, 10));
  }, []);

  // Toute erreur de validation/paiement est ramenée à l'écran : fini le « rien ne
  // se passe » quand le message s'affichait hors de vue au-dessus du bouton.
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  // DEBUG TEMPORAIRE : logge l'élément RÉELLEMENT cliqué (phase capture). Si un
  // clic sur « Payer » remonte une autre cible (overlay, bouton flottant…), on
  // tient le coupable qui intercepte le clic. À retirer une fois diagnostiqué.
  useEffect(() => {
    const h = (ev: MouseEvent) => {
      const t = ev.target as HTMLElement | null;
      const btn = t?.closest?.("button,a");
      console.log(
        "[checkout] clic →",
        t?.tagName,
        typeof t?.className === "string" ? t.className.slice(0, 70) : "",
        btn ? `| bouton: "${(btn.textContent || "").trim().slice(0, 30)}"` : "| (aucun bouton)",
        `@${ev.clientX},${ev.clientY}`,
      );
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, []);

  const products = useMemo(() => catalog?.products ?? [], [catalog]);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const anyImage = useMemo(() => products.some((p) => (p.images?.length ?? 0) > 0), [products]);
  // Layout : explicite dans la config, sinon auto — « menu » compact si aucune
  // photo (typique resto), sinon grille de cartes (boutique visuelle).
  const layout: "cards" | "menu" = c.layout ?? (anyImage ? "cards" : "menu");

  // Regroupement par catégorie + filtre recherche (nom / description, sans accents).
  // Catégories nommées d'abord (dans l'ordre back-office), puis le reste.
  const groups = useMemo(() => {
    if (!catalog) return [];
    const q = norm(query.trim());
    const match = (p: ShopProduct) =>
      !q || norm(p.name).includes(q) || norm(p.description ?? "").includes(q);
    const out: { id: string; name: string | null; items: ShopProduct[] }[] = [];
    for (const cat of catalog.categories) {
      const items = products.filter((p) => p.category_id === cat.id && match(p));
      if (items.length) out.push({ id: cat.id, name: cat.name, items });
    }
    const rest = products.filter(
      (p) =>
        (!p.category_id || !catalog.categories.some((cc) => cc.id === p.category_id)) && match(p),
    );
    if (rest.length) out.push({ id: "__rest__", name: out.length ? "Autres" : null, items: rest });
    return out;
  }, [catalog, products, query]);

  // Onglets de catégories (scroll-spy) : seulement s'il y a plusieurs sections nommées.
  const navCats = useMemo(() => groups.filter((g) => g.name), [groups]);
  const showTabs = navCats.length > 1;

  function jumpTo(id: string) {
    const el = sectionRefs.current[id];
    if (!el) return;
    const headerH = window.matchMedia("(min-width: 1024px)").matches ? 80 : 64;
    const barH = catBarRef.current?.offsetHeight ?? 0;
    const y = window.scrollY + el.getBoundingClientRect().top - headerH - barH - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveId(id);
  }

  /** Quantité totale d'un produit dans le panier, toutes compositions. */
  function productQty(productId: string): number {
    return cart.reduce((n, l) => n + (l.productId === productId ? l.qty : 0), 0);
  }

  /** Ajoute une composition (ou +1 sur la ligne identique existante). */
  function addLine(p: ShopProduct, sel: Selection) {
    if (!p.in_stock || productQty(p.id) >= stockOf(p)) return;
    const key = selKey(p.id, sel);
    setCart((prev) => {
      const i = prev.findIndex((l) => l.key === key);
      if (i === -1) return [...prev, { key, productId: p.id, sel, qty: 1 }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + 1 };
      return next;
    });
  }

  function onCardAdd(p: ShopProduct) {
    if ((p.options?.length ?? 0) > 0) setConfiguring(p);
    else addLine(p, {});
  }
  function incLine(key: string) {
    const line = cart.find((l) => l.key === key);
    const p = line && byId.get(line.productId);
    if (!line || !p || productQty(p.id) >= stockOf(p)) return;
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l)));
  }
  function decLine(key: string) {
    setCart((prev) =>
      prev.flatMap((l) => (l.key === key ? (l.qty <= 1 ? [] : [{ ...l, qty: l.qty - 1 }]) : [l])),
    );
  }
  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }
  /** − sur la CARTE d'un produit simple : décrémente sa ligne unique. */
  function onCardDec(p: ShopProduct) {
    decLine(selKey(p.id, {}));
  }

  const lines = cart
    .map((l) => ({ ...l, product: byId.get(l.productId) }))
    .filter((l): l is CartLine & { product: ShopProduct } => !!l.product);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + unitPriceCents(l.product, l.sel) * l.qty, 0);
  const delivery = catalog?.delivery_methods.find((d) => d.id === deliveryId);
  // Frais de livraison effectifs : 0 si le mode a un seuil de gratuité atteint par
  // le sous-total. Miroir du back-office (qui refait le calcul, source de vérité).
  const effectiveDeliveryCents = (d?: ShopDelivery) => {
    if (!d) return 0;
    if (d.free_over_cents && d.free_over_cents > 0 && subtotal >= d.free_over_cents) return 0;
    return d.price_cents;
  };
  const deliveryCents = effectiveDeliveryCents(delivery);
  const total = subtotal + deliveryCents;
  const checkoutEnabled = catalog?.tenant.checkout_enabled ?? false;
  // Un mode qui achemine (≠ retrait) réclame une adresse ; si sa zone est
  // restreinte, on ne propose que les communes qui y tombent.
  const needsAddress = !!delivery && delivery.kind !== "pickup";
  const zoneRestricted = isZoneRestricted(delivery?.zone);

  // ── Sélection des modes : on GROUPE par type (retrait / livraison — fini le
  // retrait au milieu). Pour un type à UN seul mode : radio, comme aujourd'hui.
  // Pour un type à PLUSIEURS modes (plusieurs points de retrait, ou plusieurs
  // zones de livraison) : une seule entrée + un select, au lieu de N entrées
  // indistinctes. ────────────────────────────────────────────────────────────
  const pickups = catalog?.delivery_methods.filter((d) => d.kind === "pickup") ?? [];
  const deliveries = catalog?.delivery_methods.filter((d) => d.kind !== "pickup") ?? [];
  // Libellé lisible d'une livraison depuis sa zone (« Osny +5 km », « Paris »).
  const zoneLabel = (d: ShopDelivery): string => {
    const z = d.zone;
    if (z?.worldwide) return "Partout";
    if (!z?.rules || z.rules.length === 0) return "Livraison";
    return z.rules
      .map((r) => (r.type === "radius" ? `${r.label} +${r.radius_km ?? 0} km` : r.label))
      .filter(Boolean)
      .join(", ");
  };
  const priceLabel = (d: ShopDelivery) =>
    effectiveDeliveryCents(d) > 0 ? euros(d.price_cents) : "Gratuit";
  // Ce qui DISTINGUE deux modes d'un même type : un point de retrait par son
  // adresse (details), une livraison par sa zone (+ prix).
  const optionLabel = (d: ShopDelivery): string =>
    d.kind === "pickup"
      ? d.details?.trim() || d.label || "Retrait sur place"
      : `${zoneLabel(d)} — ${priceLabel(d)}`;
  const groupSelected = (items: ShopDelivery[]) => items.some((d) => d.id === deliveryId);
  // Choisir un groupe (radio parent) : garde le mode déjà sélectionné du groupe
  // s'il y en a un, sinon prend le premier.
  const chooseGroup = (items: ShopDelivery[]) => {
    const target = items.find((d) => d.id === deliveryId) ?? items[0];
    if (target) selectDelivery(target);
  };

  if (step === 2 && lines.length === 0) setStep(1);

  // Autocomplétion de la commune (debounce) : /api/shop/geo → communes filtrées
  // sur la zone du mode choisi. Ne cherche que pour un mode qui livre. Tous les
  // setState vivent dans le callback (jamais synchrones dans le corps de l'effet).
  useEffect(() => {
    if (!needsAddress) return;
    const term = communeQuery.trim();
    let cancelled = false;
    const t = setTimeout(async () => {
      if (term.length < 2 || (commune && commune.label === term)) {
        setCommuneResults([]);
        return;
      }
      setCommuneSearching(true);
      try {
        const res = await fetch(`/api/shop/geo?q=${encodeURIComponent(term)}`);
        const data = (await res.json().catch(() => ({ places: [] }))) as { places?: GeoPlace[] };
        if (cancelled) return;
        const cities = (data.places ?? [])
          .filter((p) => p.type === "city")
          .filter((p) => isInZone(p, delivery?.zone));
        setCommuneResults(cities);
        setCommuneOpen(true);
      } catch {
        if (!cancelled) setCommuneResults([]);
      } finally {
        if (!cancelled) setCommuneSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [communeQuery, needsAddress, delivery, commune]);

  useEffect(() => {
    if (step === 2) stepTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Étape paiement : on masque les boutons flottants (appel / WhatsApp) du chrome
  // pour ne pas concurrencer le « Payer » ni sortir du tunnel. Marqueur sur <html>,
  // les FloatingActions se cachent via CSS (globals.css : :root[data-checkout]).
  useEffect(() => {
    const root = document.documentElement;
    if (step === 2) root.setAttribute("data-checkout", "");
    else root.removeAttribute("data-checkout");
    return () => root.removeAttribute("data-checkout");
  }, [step]);

  // Scroll-spy : surligne l'onglet de la catégorie affichée en haut de liste.
  useEffect(() => {
    if (step !== 1 || !showTabs) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = vis[0]?.target.getAttribute("data-cat");
        if (id) setActiveId(id);
      },
      { rootMargin: "-160px 0px -65% 0px", threshold: 0 },
    );
    for (const g of groups) {
      const el = sectionRefs.current[g.id];
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [step, showTabs, groups]);

  // Garde l'onglet actif visible dans la barre horizontale (mobile).
  useEffect(() => {
    if (!activeId || !chipsRef.current) return;
    chipsRef.current
      .querySelector<HTMLElement>(`[data-chip="${activeId}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeId]);

  // Sélection d'un mode : invalide une commune déjà choisie mais hors de la
  // nouvelle zone (on ne garde jamais une commune non livrable). Fait dans le
  // handler plutôt qu'un effet (pas de setState en cascade dans un effet).
  function selectDelivery(d: ShopDelivery) {
    setDeliveryId(d.id);
    if (commune && !isInZone(commune, d.zone)) {
      setCommune(null);
      setCommuneQuery("");
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    // Debug temporaire : trace chaque étape du checkout en console (préfixe
    // [checkout]) pour diagnostiquer un « rien ne se passe » chez le client.
    const dbg = (...a: unknown[]) => console.log("[checkout]", ...a);
    dbg("submit() appelé — le clic atteint bien le handler");
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const consent = fd.get("consent") === "on";
    dbg("valeurs", {
      name,
      email,
      consent,
      deliveryId,
      needsAddress,
      hpName,
      honeypotValue: hpName ? fd.get(hpName) : "(pas de honeypot)",
      commune: commune?.label ?? null,
      addrLine1,
    });
    if (name.length < 2) {
      dbg("STOP: nom manquant");
      return setError("Indiquez votre nom.");
    }
    if (!email.includes("@")) {
      dbg("STOP: email invalide");
      return setError("Indiquez un e-mail valide (reçu de commande).");
    }
    if (!consent) {
      dbg("STOP: consentement non coché");
      return setError("Merci d'accepter la politique de confidentialité.");
    }
    if (hpName && String(fd.get(hpName) ?? "")) {
      dbg("STOP: honeypot rempli (autofill ?) — champ", hpName, "=", fd.get(hpName));
      return; // honeypot (champ caché à nom aléatoire)
    }
    const turnstileToken = String(fd.get("cf-turnstile-response") ?? "");
    if (turnstileSiteKey && !turnstileToken) {
      dbg("STOP: turnstile requis mais token absent");
      return setError("Vérification anti-robot requise.");
    }
    if (!deliveryId) {
      dbg("STOP: aucun mode de livraison sélectionné");
      return setError("Choisissez un mode de retrait/livraison.");
    }
    // Adresse requise pour les modes qui livrent (revalidée côté serveur).
    if (needsAddress) {
      if (!commune) {
        dbg("STOP: commune non choisie (mode qui livre)");
        return setError("Choisissez votre commune de livraison.");
      }
      if (zoneRestricted && !isInZone(commune, delivery?.zone)) {
        dbg("STOP: commune hors zone");
        return setError("Cette commune n'est pas dans la zone de livraison de ce mode.");
      }
      if (addrLine1.trim().length < 3) {
        dbg("STOP: adresse (rue) trop courte");
        return setError("Indiquez votre adresse (n° et rue).");
      }
    }
    dbg("validations OK → envoi de la requête /api/shop/checkout");
    const address = needsAddress
      ? {
          line1: addrLine1.trim(),
          complement: addrComplement.trim(),
          city: commune?.city || commune?.label || "",
          postcode: commune?.postcode || "",
          country: commune?.country || "",
          region: commune?.region || "",
          lat: commune?.lat ?? 0,
          lon: commune?.lon ?? 0,
        }
      : undefined;

    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSlug: config.slug,
          items: lines.map((l) => ({
            productId: l.product.id,
            quantity: l.qty,
            options: Object.entries(l.sel)
              .filter(([, ids]) => ids.length > 0)
              .map(([groupId, choiceIds]) => ({ groupId, choiceIds })),
          })),
          deliveryMethodId: deliveryId,
          customer: { name, email, phone },
          address,
          successPath: `${basePath}/merci`,
          cancelPath: `${basePath}/annulation`,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        checkout_url?: string;
        error?: string;
        code?: string;
      };
      dbg("réponse /api/shop/checkout", { status: res.status, ok: res.ok, data });
      if (!res.ok || !data.checkout_url) {
        // stock/menu modifié entre-temps : on rafraîchit le catalogue
        if (
          data.code === "out_of_stock" ||
          data.code === "product_unavailable" ||
          data.code === "options_invalid"
        ) {
          void loadCatalog();
        }
        throw new Error(data.error ?? "Le paiement a échoué, réessayez.");
      }
      dbg("redirection vers Stripe", data.checkout_url);
      window.location.assign(data.checkout_url);
    } catch (err) {
      dbg("ERREUR fetch/redirection", err);
      setError(err instanceof Error ? err.message : "Le paiement a échoué, réessayez.");
      setSubmitting(false);
    }
  }

  const recapCard = (footer?: React.ReactNode) => (
    <div className="rounded-theme border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <ShoppingBag className="size-5 text-brand-600" /> Votre panier
        </h3>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
          {itemCount}
        </span>
      </div>

      {lines.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Ajoutez des articles depuis le catalogue.</p>
      ) : (
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pe-1">
          {lines.map((l) => (
            <li key={l.key} className="flex items-start justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="text-ink">{l.product.name}</p>
                {selSummary(l.product, l.sel).map((s, i) => (
                  <p key={i} className="text-xs leading-snug text-muted">
                    {s}
                  </p>
                ))}
                <p className="text-xs text-muted">{euros(unitPriceCents(l.product, l.sel) * l.qty)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Retirer un exemplaire"
                  onClick={() => decLine(l.key)}
                  className="grid size-6 place-items-center rounded-full hover:bg-surface-2"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-5 text-center text-xs font-bold tabular-nums">{l.qty}</span>
                <button
                  type="button"
                  aria-label="Ajouter un exemplaire"
                  onClick={() => incLine(l.key)}
                  className="grid size-6 place-items-center rounded-full hover:bg-surface-2"
                >
                  <Plus className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Retirer du panier"
                  onClick={() => removeLine(l.key)}
                  className="ms-1 grid size-6 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {lines.length > 0 && (
        <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Sous-total</span>
            <span>{euros(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>{delivery?.label ?? "Livraison"}</span>
            <span>{deliveryCents > 0 ? euros(deliveryCents) : "Gratuit"}</span>
          </div>
          <div className="flex justify-between font-display text-base font-extrabold text-ink">
            <span>Total</span>
            <span>{euros(total)}</span>
          </div>
        </div>
      )}

      {footer}
    </div>
  );

  return (
    <Section id="catalogue" tone={tone}>
      {(c.titre || c.intro || c.eyebrow) && (
        <Reveal>
          <SectionHeading eyebrow={c.eyebrow} title={c.titre ?? "Notre boutique"} intro={c.intro} />
        </Reveal>
      )}

      {/* Configurateur (produit à options) */}
      {configuring && (
        <ProductConfigurator
          product={configuring}
          onClose={() => setConfiguring(null)}
          onConfirm={(sel) => {
            addLine(configuring, sel);
            setConfiguring(null);
          }}
        />
      )}

      {/* Barre panier épinglée (mobile) */}
      {step === 1 && lines.length > 0 && (
        <button
          type="button"
          onClick={() => setStep(2)}
          aria-label="Passer commande"
          className="fixed bottom-5 start-4 end-[5.5rem] z-40 flex items-center justify-between gap-3 rounded-full bg-brand-600 px-5 py-3 text-brand-contrast shadow-xl transition-transform active:scale-95 sm:end-[6rem] lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-6 place-items-center rounded-full bg-white/20 text-xs font-bold tabular-nums">
              {itemCount}
            </span>
            {itemCount > 1 ? "articles" : "article"}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-bold">
            {euros(total)}
            <ArrowRight className="size-4" />
          </span>
        </button>
      )}

      {loadError ? (
        <p className="mt-10 rounded-theme border border-border bg-surface p-6 text-center text-sm text-muted">
          La boutique est momentanément indisponible. Réessayez dans quelques instants.
        </p>
      ) : !catalog ? (
        <div className="mt-10 grid place-items-center p-10 text-muted">
          <Loader2 className="size-6 animate-spin" aria-label="Chargement du catalogue" />
        </div>
      ) : products.length === 0 ? (
        <p className="mt-10 rounded-theme border border-border bg-surface p-6 text-center text-sm text-muted">
          {c.emptyMessage ?? "La boutique ouvre bientôt — repassez nous voir !"}
        </p>
      ) : step === 1 ? (
        /* Étape 1 — catalogue live + panier */
        <div className="mt-10 grid grid-cols-1 gap-8 pb-20 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-0">
          <div className="min-w-0">
            {/* Barre sticky : recherche + onglets de catégories (scroll-spy) */}
            <div
              ref={catBarRef}
              className={cn("sticky top-16 z-20 mb-6 pb-3 pt-2 lg:top-20", toneBgClass(tone))}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={c.searchPlaceholder ?? "Rechercher…"}
                  aria-label="Rechercher un produit"
                  className="w-full rounded-full border border-border bg-surface py-2.5 ps-11 pe-10 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Effacer la recherche"
                    className="absolute end-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              {showTabs && (
                <div
                  ref={chipsRef}
                  className="mt-2.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {navCats.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      data-chip={g.id}
                      onClick={() => jumpTo(g.id)}
                      className={cn(
                        "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        activeId === g.id
                          ? "border-ink bg-ink text-surface"
                          : "border-border bg-surface text-ink hover:border-brand-200",
                      )}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {groups.length === 0 ? (
              <p className="rounded-theme border border-border bg-surface p-6 text-center text-sm text-muted">
                Aucun résultat pour «&nbsp;{query.trim()}&nbsp;».{" "}
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Réinitialiser
                </button>
              </p>
            ) : (
              <div className="space-y-10">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    ref={(el) => {
                      sectionRefs.current[group.id] = el;
                    }}
                    data-cat={group.id}
                  >
                    {group.name && (
                      <Reveal>
                        <div className="mb-5 border-s-2 border-brand-200 ps-4">
                          <h3 className="font-display text-xl font-bold text-ink">{group.name}</h3>
                        </div>
                      </Reveal>
                    )}
                    {layout === "menu" ? (
                      <div className="space-y-3">
                        {group.items.map((p) => (
                          <ShopProductRow
                            key={p.id}
                            product={p}
                            qty={productQty(p.id)}
                            onAdd={() => onCardAdd(p)}
                            onDec={() => onCardDec(p)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2">
                        {group.items.map((p, pi) => (
                          <Reveal key={p.id} delay={(pi % 2) * 0.05}>
                            <ShopProductCard
                              product={p}
                              qty={productQty(p.id)}
                              onAdd={() => onCardAdd(p)}
                              onDec={() => onCardDec(p)}
                            />
                          </Reveal>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {c.notes?.length ? (
                  <ul className="space-y-1.5 text-sm text-muted">
                    {c.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {recapCard(
              lines.length > 0 && (
                <div className="mt-5 space-y-3">
                  {!checkoutEnabled ? (
                    <p className="rounded-xl bg-surface-2 px-4 py-2.5 text-xs text-muted">
                      Le paiement en ligne arrive bientôt pour cette boutique.
                    </p>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      size="lg"
                      className="h-auto min-h-14 w-full whitespace-normal py-3 text-center leading-tight"
                    >
                      Passer commande
                      <ArrowRight className="size-5" />
                    </Button>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        /* Étape 2 — livraison + coordonnées + paiement */
        <div ref={stepTopRef} className="mt-10 scroll-mt-24">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="size-4" /> Modifier mon panier
          </button>

          {contactPhone && (
            <p className="mt-3">
              <a
                href={telHrefIntl(contactPhone)}
                className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-brand-700"
              >
                <Phone className="size-3.5" /> Une question ? Appelez-nous au {contactPhone}
              </a>
            </p>
          )}

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="lg:order-1">
              <div className="rounded-theme border border-border bg-surface p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 font-display text-lg font-bold text-ink">
                  {pickups.length && deliveries.length
                    ? "Retrait ou livraison"
                    : deliveries.length
                      ? "Livraison"
                      : "Retrait"}
                </h3>
                <div className="space-y-2.5">
                  {/* Un groupe par type — retrait puis livraison. 1 mode → radio ;
                      plusieurs → une entrée + un select (points de retrait / zones). */}
                  {(
                    [
                      { items: pickups, title: "Retrait sur place", sub: "Choisissez votre point de retrait" },
                      { items: deliveries, title: "Livraison", sub: "Choisissez votre zone de livraison" },
                    ] as const
                  ).map((g) => {
                    if (g.items.length === 0) return null;

                    // Un seul mode de ce type : radio direct (comme aujourd'hui).
                    if (g.items.length === 1) {
                      const d = g.items[0];
                      return (
                        <label
                          key={d.id}
                          className={cn(
                            "flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3.5 text-sm transition-colors",
                            deliveryId === d.id
                              ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500"
                              : "border-border hover:border-brand-200",
                          )}
                        >
                          <span className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="delivery"
                              checked={deliveryId === d.id}
                              onChange={() => selectDelivery(d)}
                              className="mt-0.5 size-4 text-brand-600 focus:ring-brand-500"
                            />
                            <span>
                              <span className="font-semibold text-ink">{g.title}</span>
                              {d.kind !== "pickup" && (
                                <span className="block text-xs text-muted">{zoneLabel(d)}</span>
                              )}
                              {d.details && (
                                <span className="block text-xs text-muted">{d.details}</span>
                              )}
                              {d.free_over_cents != null && d.free_over_cents > 0 && (
                                <span className="block text-xs font-medium text-brand-700">
                                  {subtotal >= d.free_over_cents
                                    ? "🎉 Livraison offerte"
                                    : `Gratuite dès ${euros(d.free_over_cents)} de commande`}
                                </span>
                              )}
                            </span>
                          </span>
                          <span className="shrink-0 font-semibold text-ink">{priceLabel(d)}</span>
                        </label>
                      );
                    }

                    // Plusieurs modes de ce type : UNE entrée + un select.
                    const sel = groupSelected(g.items);
                    return (
                      <div
                        key={g.title}
                        className={cn(
                          "rounded-xl border p-3.5 text-sm transition-colors",
                          sel
                            ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500"
                            : "border-border hover:border-brand-200",
                        )}
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            checked={sel}
                            onChange={() => chooseGroup(g.items)}
                            className="mt-0.5 size-4 text-brand-600 focus:ring-brand-500"
                          />
                          <span>
                            <span className="font-semibold text-ink">{g.title}</span>
                            <span className="block text-xs text-muted">{g.sub}</span>
                          </span>
                        </label>

                        {sel && (
                          <div className="mt-3 pl-7">
                            <select
                              value={deliveryId}
                              onChange={(e) => {
                                const d = g.items.find((x) => x.id === e.target.value);
                                if (d) selectDelivery(d);
                              }}
                              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink shadow-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                            >
                              {g.items.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {optionLabel(d)}
                                </option>
                              ))}
                            </select>
                            {delivery?.free_over_cents != null && delivery.free_over_cents > 0 && (
                              <span className="mt-1.5 block text-xs font-medium text-brand-700">
                                {subtotal >= delivery.free_over_cents
                                  ? "🎉 Livraison offerte pour cette commande"
                                  : `Gratuite dès ${euros(delivery.free_over_cents)} de commande`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {needsAddress && (
                  <div className="mt-8">
                    <h3 className="mb-1 font-display text-lg font-bold text-ink">
                      Adresse de livraison
                    </h3>
                    <p className="mb-4 text-xs text-muted">
                      {zoneRestricted
                        ? "Seules les communes desservies par ce mode sont proposées."
                        : "Indiquez où livrer votre commande."}
                    </p>
                    <div className="space-y-3">
                      <div className="relative">
                        <label
                          htmlFor="shop-commune"
                          className="block text-sm font-medium text-ink-soft"
                        >
                          Commune *
                        </label>
                        <input
                          id="shop-commune"
                          autoComplete="off"
                          value={communeQuery}
                          placeholder="Ville ou code postal…"
                          onChange={(e) => {
                            setCommuneQuery(e.target.value);
                            setCommune(null);
                            setCommuneOpen(true);
                          }}
                          onFocus={() => communeResults.length > 0 && setCommuneOpen(true)}
                          onBlur={() => setTimeout(() => setCommuneOpen(false), 150)}
                          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                        />
                        {commune && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                            <Check className="size-3.5" /> {commune.label}
                            {commune.sub ? ` · ${commune.sub}` : ""}
                          </span>
                        )}
                        {communeOpen && !commune && communeQuery.trim().length >= 2 && (
                          <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-surface shadow-lg">
                            {communeResults.length > 0 ? (
                              communeResults.map((p) => (
                                <button
                                  key={`${p.osm_id ?? p.label}-${p.postcode ?? ""}`}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setCommune(p);
                                    setCommuneQuery(p.label);
                                    setCommuneOpen(false);
                                  }}
                                  className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-brand-50/60"
                                >
                                  <span className="font-medium text-ink">{p.label}</span>
                                  {p.sub && <span className="text-xs text-muted">{p.sub}</span>}
                                </button>
                              ))
                            ) : (
                              <p className="px-4 py-3 text-sm text-muted">
                                {communeSearching
                                  ? "Recherche…"
                                  : zoneRestricted
                                    ? "Aucune commune desservie ne correspond."
                                    : "Aucun résultat."}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="shop-line1" className="block text-sm font-medium text-ink-soft">
                          Adresse (n° et rue) *
                        </label>
                        <input
                          id="shop-line1"
                          autoComplete="street-address"
                          value={addrLine1}
                          onChange={(e) => setAddrLine1(e.target.value)}
                          placeholder="12 avenue des Genottes"
                          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="shop-complement"
                          className="block text-sm font-medium text-ink-soft"
                        >
                          Complément (étage, bâtiment, code…)
                        </label>
                        <input
                          id="shop-complement"
                          value={addrComplement}
                          onChange={(e) => setAddrComplement(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="mb-4 mt-8 font-display text-lg font-bold text-ink">Vos coordonnées</h3>
                <form onSubmit={submit} noValidate className="space-y-3">
                  {/* Honeypot anti-bot à nom ALÉATOIRE (posé au montage) : aucun
                      gestionnaire de mots de passe / autofill ne remplit un champ
                      au nom inconnu — un nom fixe ("company", "ref_code"…) finissait
                      par être rempli et bloquait silencieusement de vrais clients. */}
                  {hpName && (
                    <div className="sr-only" aria-hidden>
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        name={hpName}
                        data-1p-ignore
                        data-lpignore="true"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="shop-name" className="block text-sm font-medium text-ink-soft">
                      Nom et prénom *
                    </label>
                    <input
                      id="shop-name"
                      name="name"
                      autoComplete="name"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="shop-email" className="block text-sm font-medium text-ink-soft">
                      E-mail (reçu de commande) *
                    </label>
                    <input
                      id="shop-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="shop-phone" className="block text-sm font-medium text-ink-soft">
                      Téléphone
                    </label>
                    <input
                      id="shop-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      name="consent"
                      className="mt-0.5 size-4 rounded border-border text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                      J’accepte que mes coordonnées soient utilisées pour traiter ma commande —{" "}
                      <a
                        href={confidentialiteHref}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        politique de confidentialité
                      </a>
                      . *
                    </span>
                  </label>

                  <Turnstile siteKey={turnstileSiteKey} className="pt-1" />

                  {error && (
                    <p
                      ref={errorRef}
                      className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600"
                    >
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    onClick={() =>
                      console.log("[checkout] clic sur le bouton Payer (disabled=" + submitting + ")")
                    }
                    className="h-auto min-h-14 w-full whitespace-normal py-3 text-center leading-tight"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" /> Redirection vers le paiement…
                      </>
                    ) : (
                      <>
                        <CreditCard className="size-5" />
                        {c.submitLabel ?? "Payer ma commande"} — {euros(total)}
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted">
                    Paiement sécurisé par Stripe. Vous allez être redirigé.
                  </p>
                </form>
              </div>
            </div>

            <div className="lg:order-2 lg:sticky lg:top-24 lg:self-start">{recapCard()}</div>
          </div>
        </div>
      )}
    </Section>
  );
}
