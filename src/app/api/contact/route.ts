import { NextResponse } from "next/server";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { getConfig } from "@/lib/config-loader";

/**
 * Réception unifiée des leads : contact, demande d'intervention, devis.
 *
 * Livraison configurable, dans cet ordre, sans backend :
 *  1. E-mail transactionnel via Resend (si RESEND_API_KEY).
 *  2. Webhook n8n / Make en POST (si config.forms.webhookUrl ou LEAD_WEBHOOK_URL).
 * Les deux peuvent être actifs simultanément (ET). Destinataire e-mail et URL de
 * webhook surchargeables PAR SITE via `config.forms` (sinon variables d'env).
 *
 * Anti-spam : honeypot `company` + Cloudflare Turnstile optionnel.
 * Repli gracieux : si rien n'est configuré, on log et on renvoie OK (le parcours
 * fonctionne en dev sans configuration).
 */

const MODE_LABELS: Record<string, string> = {
  simple: "Message de contact",
  contact: "Message de contact",
  "demande-intervention": "Demande d'intervention",
  devis: "Demande de devis",
};

async function verifyTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true; // Turnstile non activé -> on laisse passer.
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function formatLead(data: ContactInput): { subject: string; lines: string[] } {
  const siteName = data.site || "Site";
  const modeLabel = MODE_LABELS[data.mode] ?? "Lead";
  const subject = `${modeLabel} — ${data.name} (${siteName})`;

  const lines = [
    `Type : ${modeLabel}`,
    `Site : ${siteName}`,
    `Nom : ${data.name}`,
    data.phone ? `Téléphone : ${data.phone}` : null,
    data.email ? `E-mail : ${data.email}` : null,
    data.service ? `Prestation : ${data.service}` : null,
    data.address ? `Adresse : ${data.address}` : null,
    data.postalCode ? `Code postal : ${data.postalCode}` : null,
    data.city ? `Ville : ${data.city}` : null,
    data.zone ? `Zone / adresse : ${data.zone}` : null,
    data.date ? `Date souhaitée : ${data.date}` : null,
    data.message ? `\nMessage :\n${data.message}` : null,
  ].filter(Boolean) as string[];

  if (data.items?.length) {
    lines.push("");
    lines.push("Sélection :");
    for (const it of data.items) {
      const price = it.surDevis || it.price == null ? "Sur devis" : `${it.price} €`;
      lines.push(`- ${it.label} × ${it.qty} : ${price}`);
    }
    if (typeof data.estimateBilled === "number") {
      lines.push(`Total estimé (facturé) : ${data.estimateBilled} €`);
    }
    if (typeof data.estimateNet === "number" && data.withCredit) {
      lines.push(`Reste à charge après crédit d'impôt : ${data.estimateNet} €`);
    }
  }

  return { subject, lines };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Formulaire invalide", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // Honeypot : champ caché rempli => bot, on ignore silencieusement.
  if (data.company && data.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Config du site (surcharge destinataire / webhook + activation Turnstile).
  const config = data.siteSlug ? getConfig(data.siteSlug) : null;

  // Turnstile : vérifié seulement si le site l'a activé (forms.turnstile). Ainsi
  // définir la clé secrète globalement ne casse pas les sites non opt-in.
  if (config?.forms?.turnstile) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    if (!(await verifyTurnstile(data.turnstileToken, ip))) {
      return NextResponse.json({ error: "Vérification anti-robot échouée." }, { status: 403 });
    }
  }
  const { subject, lines } = formatLead(data);
  const text = lines.join("\n");

  const delivered = { email: false, webhook: false };
  const errors: string[] = [];

  // 1) Webhook (n8n / Make).
  const webhookUrl = config?.forms?.webhookUrl ?? process.env.LEAD_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, company: undefined, turnstileToken: undefined, subject }),
      });
      delivered.webhook = res.ok;
      if (!res.ok) errors.push(`webhook ${res.status}`);
    } catch (e) {
      errors.push(`webhook ${(e as Error).message}`);
    }
  }

  // 2) E-mail (Resend).
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    const siteName = data.site || "Site";
    const fromEnv = process.env.RESEND_FROM ?? "onboarding@resend.dev";
    const from = fromEnv.includes("<") ? fromEnv : `${siteName} <${fromEnv}>`;
    const to =
      config?.forms?.to ?? process.env.LEAD_TO ?? process.env.RESEND_FROM ?? "onboarding@resend.dev";
    const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#0f172a">
      <h2 style="color:#0d9488">${subject}</h2>
      ${lines.map((l) => `<p style="margin:4px 0;white-space:pre-line">${l}</p>`).join("")}
      <p style="color:#64748b;font-size:13px;margin-top:16px">Lead envoyé depuis ${siteName}.</p>
    </div>`;
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: data.email || undefined,
        subject,
        text,
        html,
      });
      if (error) errors.push(`resend ${error.message ?? "error"}`);
      else delivered.email = true;
    } catch (e) {
      errors.push(`resend ${(e as Error).message}`);
    }
  }

  // Aucun canal configuré : repli dev (succès, on log).
  if (!webhookUrl && !apiKey) {
    console.info(`[contact] (aucun canal configuré — lead non envoyé)\n${text}`);
    return NextResponse.json({ ok: true, delivered });
  }

  // Si au moins un canal a réussi -> succès. Sinon -> erreur.
  if (delivered.email || delivered.webhook) {
    return NextResponse.json({ ok: true, delivered });
  }
  console.error("[contact] échec de livraison", errors);
  return NextResponse.json(
    { error: "L'envoi a échoué, réessayez ou appelez-nous." },
    { status: 502 },
  );
}
