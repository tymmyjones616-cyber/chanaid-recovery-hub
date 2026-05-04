/**
 * Resend-based transactional email service.
 * Workers-compatible: uses fetch directly against the Resend REST API.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = "ChanAidRecovery <support@minerhaolan.shop>";
const WALLET_LINK = "https://wiscewallet.com";

function getResendKey(): string | undefined {
  return (
    (globalThis as any).RESEND_API_KEY ||
    process.env.RESEND_API_KEY ||
    undefined
  );
}

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const key = getResendKey();
  if (!key) {
    console.warn("[email] RESEND_API_KEY not configured; skipping send to", args.to);
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  if (!args.to) return { ok: false, error: "missing recipient" };

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error:", res.status, body);
      return { ok: false, error: `${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err: any) {
    console.error("[email] send failed:", err);
    return { ok: false, error: err?.message ?? "unknown" };
  }
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:24px;padding:40px;box-shadow:0 10px 40px rgba(0,0,0,0.2);">
      <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#64748b;font-weight:800;margin-bottom:8px;">ChanAidRecovery</div>
      <h1 style="margin:0 0 16px 0;font-size:26px;font-weight:900;letter-spacing:-0.02em;">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#334155;">${bodyHtml}</div>
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;">
        ChanAidRecovery · Asset Recovery & Forensic Services<br/>
        This email was sent from a notification-only address.
      </div>
    </div>
  </div>
</body></html>`;
}

export function loanVerifiedEmail(name: string | null | undefined): { subject: string; html: string; text: string } {
  const greet = name ? `Hi ${name},` : "Hello,";
  const subject = "Your loan application has been verified";
  const html = shell(
    "Your loan is verified",
    `
      <p>${greet}</p>
      <p>Great news — your ChanAidRecovery loan application has been <strong>verified</strong>. Your funds are ready to be claimed.</p>
      <p>Continue to your secure wallet to access them:</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${WALLET_LINK}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:800;letter-spacing:.02em;">Open WiseWallet →</a>
      </p>
      <p style="font-size:13px;color:#64748b;">If the button doesn't work, copy this link: <a href="${WALLET_LINK}">${WALLET_LINK}</a></p>
    `
  );
  const text = `${greet}\n\nYour ChanAidRecovery loan has been verified. Open your wallet to claim funds: ${WALLET_LINK}`;
  return { subject, html, text };
}

export function loanStatusUpdateEmail(name: string | null | undefined, status: string): { subject: string; html: string; text: string } {
  const greet = name ? `Hi ${name},` : "Hello,";
  const subject = `Your loan application status: ${status}`;
  const html = shell(
    "Loan application update",
    `
      <p>${greet}</p>
      <p>Your loan application status has been updated to <strong>${status}</strong>.</p>
      <p>You can review the latest details in your account at any time.</p>
    `
  );
  const text = `${greet}\n\nYour loan application status is now: ${status}.`;
  return { subject, html, text };
}

export function loanRejectionEmail(name: string | null | undefined, reason?: string): { subject: string; html: string; text: string } {
  const greet = name ? `Hi ${name},` : "Hello,";
  const subject = "Update on your loan application";
  const html = shell(
    "Loan application update",
    `
      <p>${greet}</p>
      <p>After review, we are unable to approve your loan application at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>If you believe this is in error, reply to this email and our team will look into it.</p>
    `
  );
  const text = `${greet}\n\nWe were unable to approve your loan application.${reason ? ` Reason: ${reason}` : ""}`;
  return { subject, html, text };
}
