import { z } from "zod";

/**
 * Schéma unifié des formulaires de contact / demande d'intervention / devis.
 * Partagé client (validation RHF) + serveur (revalidation /api/contact).
 *
 * Les champs requis dépendent du `mode` (voir superRefine) :
 * - simple / contact         : e-mail requis.
 * - demande-intervention / devis : téléphone requis.
 */
export type ContactMode = "simple" | "demande-intervention" | "devis" | "contact";

const phoneRe = /^[0-9+\s().-]{8,20}$/;

export const devisItemSchema = z.object({
  label: z.string(),
  price: z.number().optional(),
  qty: z.number().int().min(1).max(99),
  surDevis: z.boolean().optional(),
});

export const contactSchema = z
  .object({
    mode: z.enum(["simple", "demande-intervention", "devis", "contact"]),
    name: z.string().min(2, "Votre nom est requis"),
    email: z.string().email("E-mail invalide").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(phoneRe, "Numéro de téléphone invalide")
      .optional()
      .or(z.literal("")),
    /** Prestation / service souhaité. */
    service: z.string().optional().or(z.literal("")),
    /** Zone / adresse d'intervention. */
    zone: z.string().optional().or(z.literal("")),
    /** Adresse (n° + rue) — commande/devis produits. */
    address: z.string().max(200).optional().or(z.literal("")),
    /** Code postal — commande/devis produits. */
    postalCode: z.string().max(12).optional().or(z.literal("")),
    /** Ville / commune (champ libre ou sélecteur selon le formulaire). */
    city: z.string().optional().or(z.literal("")),
    /** Date souhaitée (intervention). */
    date: z.string().optional().or(z.literal("")),
    message: z.string().max(4000).optional().or(z.literal("")),
    // Routage serveur :
    site: z.string().optional(),
    siteSlug: z.string().optional(),
    pageUrl: z.string().optional(),
    // Devis-builder :
    items: z.array(devisItemSchema).optional(),
    estimateBilled: z.number().optional(),
    estimateNet: z.number().optional(),
    withCredit: z.boolean().optional(),
    // RGPD + anti-spam :
    consent: z.boolean().refine((v) => v === true, "Veuillez accepter pour continuer"),
    // Honeypot : on ACCEPTE n'importe quelle valeur ici pour pouvoir répondre un
    // faux succès silencieux côté route (ne jamais signaler au bot qu'il a échoué).
    company: z.string().optional(),
    turnstileToken: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    const needEmail = d.mode === "simple" || d.mode === "contact";
    const needPhone = d.mode === "demande-intervention" || d.mode === "devis";
    if (needEmail && !d.email) {
      ctx.addIssue({ path: ["email"], code: z.ZodIssueCode.custom, message: "E-mail requis" });
    }
    if (needPhone && !d.phone) {
      ctx.addIssue({ path: ["phone"], code: z.ZodIssueCode.custom, message: "Téléphone requis" });
    }
  });

export type ContactInput = z.infer<typeof contactSchema>;
