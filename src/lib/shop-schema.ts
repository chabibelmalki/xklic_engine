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
        /**
         * Choix du client par groupe d'options (menus/formules) : ids DB
         * uniquement — les prix des suppléments sont relus en base comme le
         * reste. Répéter un id de choix = le prendre plusieurs fois.
         */
        options: z
          .array(
            z.object({
              groupId: z.string().min(1).max(64),
              choiceIds: z.array(z.string().min(1).max(64)).max(99),
            }),
          )
          .max(10)
          .optional(),
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
  /**
   * Adresse de livraison. Facultative ici (le back-office l'exige selon le mode :
   * requise pour un mode qui livre, ignorée pour un retrait) et REVALIDÉE contre
   * la zone côté serveur. line1/complement sont libres ; city/postcode/country/
   * region/lat/lon proviennent de l'autocomplétion géo (matching de zone).
   */
  address: z
    .object({
      line1: z.string().trim().max(200).optional().or(z.literal("")),
      complement: z.string().trim().max(200).optional().or(z.literal("")),
      city: z.string().trim().max(120).optional().or(z.literal("")),
      postcode: z.string().trim().max(20).optional().or(z.literal("")),
      country: z.string().trim().max(2).optional().or(z.literal("")),
      region: z.string().trim().max(120).optional().or(z.literal("")),
      lat: z.number().optional(),
      lon: z.number().optional(),
    })
    .optional(),
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
  /** Honeypot anti-bot (doit rester vide). Nom neutre : un champ nommé "company"
   *  était rempli par l'autofill/les gestionnaires de mots de passe, bloquant de
   *  vrais clients. On tolère encore l'ancienne clé le temps que les onglets
   *  ouverts se rechargent. */
  ref_code: z.string().optional(),
  company: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export type ShopCheckoutInput = z.infer<typeof shopCheckoutSchema>;
