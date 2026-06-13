import { z } from "zod";

/** Schéma partagé client + serveur pour les demandes de devis / contact. */
export const leadSchema = z.object({
  type: z.enum(["devis", "contact"]),
  name: z.string().min(2, "Votre nom est requis"),
  phone: z
    .string()
    .min(8, "Numéro de téléphone invalide")
    .regex(/^[0-9+\s().-]{8,20}$/, "Numéro de téléphone invalide"),
  email: z.string().email("E-mail invalide").optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  service: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  // Nom de l'entreprise du site (affichage) + slug (pour router le lead vers le
  // destinataire du site via config.forms.to côté serveur).
  site: z.string().optional(),
  siteSlug: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, "Veuillez accepter pour continuer"),
  // Anti-spam (honeypot) : doit rester vide.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;
