import nodemailer from "nodemailer";

// Email distribution via Zoho SMTP. Env-gated: if the Zoho credentials aren't
// set, isEmailConfigured() returns false and the send route reports that
// cleanly rather than failing. Sending is always human-triggered per edition —
// the Editor decides to distribute (the human owns the meaning-making decision).
//
// Required env (see SETUP_MANUAL_STEPS.md):
//   ZOHO_SMTP_USER  — the Zoho mailbox the newsletter sends from
//   ZOHO_SMTP_PASS  — an app-specific password (Zoho → Security → App Passwords)
//   EMAIL_FROM      — optional "Name <addr>"; defaults to ZOHO_SMTP_USER
//   ZOHO_SMTP_HOST  — optional; defaults to smtp.zoho.com

export function isEmailConfigured(): boolean {
  return Boolean(process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASS);
}

function transport() {
  // Microsoft 365 SMTP client submission: smtp.office365.com on port 587 with
  // STARTTLS. Requires "Authenticated SMTP" enabled on the sending mailbox and
  // an app password (basic auth). The ZOHO_SMTP_* env var names are retained for
  // compatibility, but the values now point at Microsoft 365.
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.office365.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.ZOHO_SMTP_USER,
      pass: process.env.ZOHO_SMTP_PASS,
    },
  });
}

export interface SendResult {
  sent: number;
  failed: number;
}

/**
 * Send one HTML email to many recipients, each addressed individually via BCC
 * so subscribers don't see each other. The unsubscribe link is per-recipient,
 * so we send in small batches keyed by a footer template.
 */
export async function sendToSubscribers(
  recipients: { email: string; unsubscribeUrl: string }[],
  subject: string,
  htmlBody: string
): Promise<SendResult> {
  if (!isEmailConfigured()) return { sent: 0, failed: recipients.length };
  const from =
    process.env.EMAIL_FROM || (process.env.ZOHO_SMTP_USER as string);
  const tx = transport();

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const html = `${htmlBody}<hr style="margin:32px 0;border:none;border-top:1px solid #ddd"/><p style="font:12px sans-serif;color:#888">You're receiving this because you subscribed. <a href="${r.unsubscribeUrl}">Unsubscribe</a>.</p>`;
    try {
      await tx.sendMail({ from, to: r.email, subject, html });
      sent++;
    } catch (err) {
      console.error(`Email to ${r.email} failed:`, err);
      failed++;
    }
  }
  return { sent, failed };
}
