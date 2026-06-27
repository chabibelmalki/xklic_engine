import { NextResponse } from "next/server";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { getConfig } from "@/lib/config-loader";
import { insertRow, BASEROW_TABLES } from "@/lib/baserow";
import { normalizePagePath, trackEvent } from "@/lib/events";
import { isLocalTestMode, isDeliveryEnabled } from "@/lib/runtime";
import type { SiteConfig } from "@/types/config";

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

/**
 * Capture Baserow Tier 1 : écrit le lead (avec PII) dans la table `leads` ET
 * émet l'event `form_submit` (sans PII) dans `events`. Sink ADDITIONNEL, à côté
 * de Resend/webhook : fire-and-forget, n'altère jamais la réponse ni la livraison
 * e-mail existante. PII (nom/tél/e-mail/message) → `leads` UNIQUEMENT, jamais
 * dans `events`.
 */
async function captureLead(data: ContactInput, config: SiteConfig | null): Promise<void> {
  const page = normalizePagePath(config, data.pageUrl);

  const itemsSummary = data.items?.length
    ? data.items
        .map((it) => {
          const price = it.surDevis || it.price == null ? "Sur devis" : `${it.price} €`;
          return `${it.label} × ${it.qty} : ${price}`;
        })
        .join("\n")
    : "";

  // leads : avec PII.
  await insertRow(BASEROW_TABLES.leads(), {
    name: data.name,
    phone: data.phone ?? "",
    email: data.email ?? "",
    mode: data.mode,
    service: data.service ?? "",
    city: data.city ?? "",
    message: data.message ?? "",
    site: data.siteSlug ?? "",
    site_name: data.site ?? "",
    page,
    session: data.session ?? "",
    estimate: typeof data.estimateBilled === "number" ? data.estimateBilled : null,
    items: itemsSummary,
  });

  // events : sans PII (funnel form_submit), dédupliqué par session.
  await trackEvent({
    type: "form_submit",
    siteSlug: data.siteSlug ?? "",
    pagePath: page,
    session: data.session,
  });
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
  // Désactivé en LOCAL/TEST (le widget n'est pas rendu côté client non plus,
  // cf. resolveTurnstileSiteKey) pour ne pas friter les tests.
  if (config?.forms?.turnstile && !isLocalTestMode()) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    if (!(await verifyTurnstile(data.turnstileToken, ip))) {
      return NextResponse.json({ error: "Vérification anti-robot échouée." }, { status: 403 });
    }
  }
  // Capture Baserow (leads + form_submit) — sink additionnel, fire-and-forget.
  await captureLead(data, config);

  const { subject, lines } = formatLead(data);
  const text = lines.join("\n");

  const delivered = { email: false, webhook: false };
  const errors: string[] = [];

  // GARDE-FOU TEST : en LOCAL on ne livre JAMAIS au client (pas d'e-mail Resend,
  // pas de webhook) — éviter de spammer la vraie adresse client (config.forms.to)
  // pendant les tests. La capture Baserow ci-dessus reste active. Override
  // ponctuel possible via DEV_ALLOW_DELIVERY=true.
  const deliveryEnabled = isDeliveryEnabled();

  // 1) Webhook (n8n / Make).
  const webhookUrl = deliveryEnabled
    ? (config?.forms?.webhookUrl ?? process.env.LEAD_WEBHOOK_URL?.trim())
    : undefined;
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
  const apiKey = deliveryEnabled ? process.env.RESEND_API_KEY?.trim() : undefined;
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

  // Aucun canal de livraison actif (non configuré, OU désactivé en local/test) :
  // repli gracieux (succès, on log). La capture Baserow a déjà eu lieu.
  if (!webhookUrl && !apiKey) {
    const reason = deliveryEnabled
      ? "aucun canal configuré"
      : "mode local/test — livraison client désactivée";
    console.info(`[contact] (${reason} — e-mail/webhook non envoyés)\n${text}`);
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
