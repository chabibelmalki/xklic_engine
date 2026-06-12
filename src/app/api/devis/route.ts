import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead-schema";

/**
 * Réception des leads (devis / contact). Repli gracieux : sans `RESEND_API_KEY`,
 * on log côté serveur et on renvoie OK (le parcours marche sans config e-mail).
 *
 * Mutualisé entre tous les sites : `RESEND_FROM` (domaine d'agence) est commun ;
 * `LEAD_TO` peut être surchargé par site via la variable d'env du déploiement.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Formulaire invalide", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // Honeypot : un bot a rempli le champ caché -> on ignore silencieusement.
  if (data.company && data.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const siteName = data.site || "Site";
  const subject =
    data.type === "devis"
      ? `Nouvelle demande de devis — ${data.name} (${siteName})`
      : `Nouveau message — ${data.name} (${siteName})`;

  const lines = [
    `Type : ${data.type === "devis" ? "Demande de devis" : "Message de contact"}`,
    `Site : ${siteName}`,
    `Nom : ${data.name}`,
    `Téléphone : ${data.phone}`,
    data.email ? `E-mail : ${data.email}` : null,
    data.city ? `Ville : ${data.city}` : null,
    data.service ? `Prestation : ${data.service}` : null,
    data.message ? `\nMessage :\n${data.message}` : null,
  ].filter(Boolean) as string[];

  const text = lines.join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#0f172a">
    <h2 style="color:#0d9488">${subject}</h2>
    ${lines.map((l) => `<p style="margin:4px 0;white-space:pre-line">${l}</p>`).join("")}
    <p style="color:#64748b;font-size:13px;margin-top:16px">Lead envoyé depuis le site ${siteName}.</p>
  </div>`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[devis] (aucune clé Resend — e-mail non envoyé)\n${text}`);
    return NextResponse.json({ ok: true, delivered: false });
  }

  const fromEnv = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const from = fromEnv.includes("<") ? fromEnv : `${siteName} <${fromEnv}>`;
  const to = process.env.LEAD_TO ?? process.env.RESEND_FROM ?? "onboarding@resend.dev";

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
    if (error) {
      console.error("[devis] Resend error", error);
      return NextResponse.json(
        { error: "L'envoi a échoué, réessayez ou appelez-nous." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[devis] exception", err);
    return NextResponse.json({ error: "Erreur serveur, réessayez plus tard." }, { status: 500 });
  }
}
