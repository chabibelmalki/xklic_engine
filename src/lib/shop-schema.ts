import { z } from "zod";

/**
 * Schéma du POST /api/shop/checkout (panier -> paiement). Le client n'envoie
 * AUCUN prix : uniquement des ids produits + quantités. Les prix sont relus en
 * base par le back-office (source de vérité), puis revérifiés par Stripe.
 * `successPath`/`cancelPath` sont des CHEMINS relatifs (pas d'URL absolue :
 * anti open-redirect) — l'origin est déduit de la requête côté serveur.
 */
export const shopCheckoutSchema = z.object({
  siteSlug: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  deliveryMethodId: z.string().min(1),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
  }),
  successPath: z
    .string()
    .startsWith("/")
    .max(300)
    .refine((p) => !p.includes("//") && !p.includes(":"), "chemin relatif uniquement"),
  cancelPath: z
    .string()
    .startsWith("/")
    .max(300)
    .refine((p) => !p.includes("//") && !p.includes(":"), "chemin relatif uniquement"),
  /** Honeypot anti-bot (doit rester vide). */
  company: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export type ShopCheckoutInput = z.infer<typeof shopCheckoutSchema>;
