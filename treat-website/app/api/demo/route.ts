/**
 * Demo request handler.
 *
 * Sends the lead to your inbox via Resend (https://resend.com) when configured.
 * To enable real email delivery, set these environment variables (e.g. in
 * a `.env.local` file or your host's dashboard):
 *
 *   RESEND_API_KEY   — your Resend API key
 *   DEMO_TO_EMAIL    — where leads should be delivered (e.g. founder@treat.security)
 *   DEMO_FROM_EMAIL  — a verified sender on your domain (e.g. demos@treat.security)
 *
 * Without a key, the request is accepted and logged server-side so the form
 * still works end-to-end in development.
 */

type DemoLead = {
  name?: string;
  email?: string;
  company?: string;
  title?: string;
  teamSize?: string;
};

export async function POST(request: Request) {
  let lead: DemoLead;
  try {
    lead = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  // Minimal validation
  if (!lead.name || !lead.email || !lead.company) {
    return Response.json(
      { ok: false, error: "Name, email, and company are required." },
      { status: 422 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.DEMO_TO_EMAIL;
  const from = process.env.DEMO_FROM_EMAIL;

  // No email provider configured — accept and log so the flow still works.
  if (!apiKey || !to || !from) {
    console.log("[demo lead] (email not configured, logging only):", lead);
    return Response.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: lead.email,
        subject: `New demo request — ${lead.company}`,
        text: [
          `Name: ${lead.name}`,
          `Email: ${lead.email}`,
          `Company: ${lead.company}`,
          `Title: ${lead.title || "—"}`,
          `Team size: ${lead.teamSize || "—"}`,
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[demo lead] Resend error:", res.status, detail);
      return Response.json({ ok: false, error: "Email delivery failed." }, { status: 502 });
    }

    return Response.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[demo lead] Unexpected error:", err);
    return Response.json({ ok: false, error: "Unexpected server error." }, { status: 500 });
  }
}
