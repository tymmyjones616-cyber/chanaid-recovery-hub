/**
 * Resend-based transactional email service.
 * Workers-compatible: uses fetch directly against the Resend REST API.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = "ChanAidRecovery <support@chanaidrecovery.com>";
const SITE = "https://chanaidrecovery.com";
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

// ─── Shared template shell ────────────────────────────────────────────────────
function shell(opts: {
  preheader?: string;
  heroTitle: string;
  heroSubtitle?: string;
  accentColor?: string;
  body: string;
}): string {
  const accent = opts.accentColor || "#f97316";
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${opts.preheader}</div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>ChanAidRecovery</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
${preheader}

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <!-- Email wrapper -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

        <!-- ── Header logo bar ── -->
        <tr>
          <td style="background:#0f172a;border-radius:16px 16px 0 0;padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;text-decoration:none;">
                    ChanAid<span style="color:${accent};">Recovery</span>
                  </span>
                </td>
                <td align="right">
                  <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:.2em;text-transform:uppercase;">Asset Recovery Hub</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Hero banner ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%);padding:48px 40px 52px;">
            <p style="margin:0 0 12px 0;font-size:11px;font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:${accent};">ChanAidRecovery</p>
            <h1 style="margin:0 0 14px 0;font-size:32px;font-weight:900;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;">${opts.heroTitle}</h1>
            ${opts.heroSubtitle ? `<p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.55);">${opts.heroSubtitle}</p>` : ""}
          </td>
        </tr>

        <!-- ── White body ── -->
        <tr>
          <td style="background:#ffffff;padding:40px;">
            ${opts.body}
          </td>
        </tr>

        <!-- ── Stats bar ── -->
        <tr>
          <td style="background:#0f172a;padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="border-right:1px solid rgba(255,255,255,0.08);padding:0 16px 0 0;">
                  <p style="margin:0;font-size:22px;font-weight:900;color:${accent};">$500M+</p>
                  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Recovered</p>
                </td>
                <td align="center" style="border-right:1px solid rgba(255,255,255,0.08);padding:0 16px;">
                  <p style="margin:0;font-size:22px;font-weight:900;color:${accent};">10K+</p>
                  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Cases Won</p>
                </td>
                <td align="center" style="padding:0 0 0 16px;">
                  <p style="margin:0;font-size:22px;font-weight:900;color:${accent};">98%</p>
                  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Success Rate</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:28px 40px;border-top:1px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#1e293b;">ChanAidRecovery</p>
                  <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">
                    Professional Asset Recovery &amp; Blockchain Forensics<br/>
                    <a href="${SITE}" style="color:${accent};text-decoration:none;">chanaidrecovery.com</a>
                    &nbsp;·&nbsp;
                    <a href="mailto:support@chanaidrecovery.com" style="color:#94a3b8;text-decoration:none;">support@chanaidrecovery.com</a>
                  </p>
                </td>
                <td align="right" valign="top">
                  <p style="margin:0;font-size:10px;color:#cbd5e1;">
                    You received this because you have an account<br/>with ChanAidRecovery.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

// ─── CTA button helper ────────────────────────────────────────────────────────
function ctaButton(text: string, href: string, color = "#f97316"): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:28px auto;">
  <tr>
    <td align="center" style="background:${color};border-radius:12px;">
      <a href="${href}" style="display:inline-block;padding:16px 36px;font-size:14px;font-weight:800;letter-spacing:.02em;color:#ffffff;text-decoration:none;">${text} &rarr;</a>
    </td>
  </tr>
</table>`;
}

// ─── Info row helper ──────────────────────────────────────────────────────────
function infoRow(icon: string, label: string, value: string): string {
  return `<tr>
  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="width:32px;font-size:18px;">${icon}</td>
        <td style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em;width:120px;">${label}</td>
        <td style="font-size:14px;font-weight:600;color:#0f172a;">${value}</td>
      </tr>
    </table>
  </td>
</tr>`;
}

// ─── Welcome email ────────────────────────────────────────────────────────────
export function welcomeEmail(name: string | null | undefined): { subject: string; html: string; text: string } {
  const firstName = name ? name.split(" ")[0] : "there";
  const subject = `Welcome to ChanAidRecovery, ${firstName}!`;

  const body = `
    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#334155;">
      Hi <strong>${firstName}</strong>, your account is live and ready. You now have access to our full suite of asset recovery and blockchain forensics tools.
    </p>

    <!-- Feature cards -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;width:48%;vertical-align:top;">
          <p style="margin:0 0 6px;font-size:18px;">🔍</p>
          <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#0f172a;">Instant Case Review</p>
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">Submit your case and get a specialist response within 24 hours.</p>
        </td>
        <td style="width:4%;"></td>
        <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;width:48%;vertical-align:top;">
          <p style="margin:0 0 6px;font-size:18px;">🛡️</p>
          <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#0f172a;">Forensic Analysis</p>
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">AI-powered blockchain tracing across all major chains.</p>
        </td>
      </tr>
    </table>

    ${ctaButton("Open My Dashboard", `${SITE}/dashboard`)}

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
      Didn't create this account? <a href="mailto:support@chanaidrecovery.com" style="color:#f97316;text-decoration:none;">Contact us immediately.</a>
    </p>
  `;

  const html = shell({
    preheader: `Welcome aboard, ${firstName}! Your recovery dashboard is ready.`,
    heroTitle: `Welcome aboard, ${firstName}!`,
    heroSubtitle: "Your account is active. Start your recovery journey today.",
    body,
  });

  const text = `Hi ${firstName},\n\nWelcome to ChanAidRecovery! Your account is ready.\n\nOpen your dashboard: ${SITE}/dashboard\n\nQuestions? Reply to this email.\n\nChanAidRecovery Team`;
  return { subject, html, text };
}

// ─── Loan verified email ──────────────────────────────────────────────────────
export function loanVerifiedEmail(name: string | null | undefined): { subject: string; html: string; text: string } {
  const firstName = name ? name.split(" ")[0] : "there";
  const subject = "✅ Your loan application has been verified";

  const body = `
    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#334155;">
      Hi <strong>${firstName}</strong>, great news — your ChanAidRecovery loan application has been <strong style="color:#16a34a;">verified and approved</strong>. Your funds are ready to be claimed.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:28px;">
      <tr><td style="font-size:13px;font-weight:800;color:#15803d;margin-bottom:8px;display:block;">✅ Verification Complete</td></tr>
      <tr><td style="font-size:13px;color:#166534;line-height:1.6;">Your identity and application details have been reviewed and approved by our compliance team. Proceed to your secure wallet to claim your funds.</td></tr>
    </table>

    ${ctaButton("Claim My Funds", WALLET_LINK, "#16a34a")}

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
      Button not working? <a href="${WALLET_LINK}" style="color:#f97316;text-decoration:none;">${WALLET_LINK}</a>
    </p>
  `;

  const html = shell({
    preheader: "Your loan is verified — funds are ready to claim.",
    heroTitle: "Your Loan is Verified!",
    heroSubtitle: "Congratulations! Your application passed all compliance checks.",
    accentColor: "#16a34a",
    body,
  });

  const text = `Hi ${firstName},\n\nYour ChanAidRecovery loan has been verified. Claim your funds: ${WALLET_LINK}\n\nChanAidRecovery Team`;
  return { subject, html, text };
}

// ─── Loan status update email ─────────────────────────────────────────────────
export function loanStatusUpdateEmail(name: string | null | undefined, status: string): { subject: string; html: string; text: string } {
  const firstName = name ? name.split(" ")[0] : "there";
  const subject = `Update on your loan application — ${status}`;

  const statusColors: Record<string, string> = {
    under_review: "#f97316",
    pending: "#f97316",
    verified: "#16a34a",
    needs_correction: "#dc2626",
    rejected: "#dc2626",
  };
  const accent = statusColors[status] || "#f97316";

  const statusLabel = status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const body = `
    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#334155;">
      Hi <strong>${firstName}</strong>, your ChanAidRecovery loan application status has been updated.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:28px;">
      ${infoRow("📋", "Status", `<span style="color:${accent};font-weight:800;">${statusLabel}</span>`)}
      ${infoRow("🏦", "Platform", "ChanAidRecovery")}
      ${infoRow("📅", "Updated", new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}
    </table>

    ${ctaButton("View My Application", `${SITE}/dashboard`, accent)}

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
      Questions? Reply to this email or visit <a href="${SITE}" style="color:#f97316;text-decoration:none;">chanaidrecovery.com</a>
    </p>
  `;

  const html = shell({
    preheader: `Your loan status is now: ${statusLabel}`,
    heroTitle: "Loan Application Update",
    heroSubtitle: `Your application status has changed to: ${statusLabel}`,
    accentColor: accent,
    body,
  });

  const text = `Hi ${firstName},\n\nYour loan application status is now: ${statusLabel}.\n\nView your dashboard: ${SITE}/dashboard\n\nChanAidRecovery Team`;
  return { subject, html, text };
}

// ─── Loan rejection email ─────────────────────────────────────────────────────
export function loanRejectionEmail(name: string | null | undefined, reason?: string): { subject: string; html: string; text: string } {
  const firstName = name ? name.split(" ")[0] : "there";
  const subject = "Update on your loan application";

  const body = `
    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#334155;">
      Hi <strong>${firstName}</strong>, after careful review by our compliance team, we are unable to approve your loan application at this time.
    </p>

    ${reason ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <tr><td style="font-size:12px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block;">Reason</td></tr>
      <tr><td style="font-size:14px;color:#7f1d1d;line-height:1.6;">${reason}</td></tr>
    </table>` : ""}

    <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#64748b;">
      If you believe this decision is in error or you have additional documentation to support your case, please contact our support team — we're here to help.
    </p>

    ${ctaButton("Contact Support", `mailto:support@chanaidrecovery.com`, "#0f172a")}
  `;

  const html = shell({
    preheader: "An update on your ChanAidRecovery loan application.",
    heroTitle: "Application Update",
    heroSubtitle: "We've reviewed your application and have an update for you.",
    accentColor: "#dc2626",
    body,
  });

  const text = `Hi ${firstName},\n\nWe were unable to approve your loan application at this time.${reason ? `\n\nReason: ${reason}` : ""}\n\nContact us at support@chanaidrecovery.com\n\nChanAidRecovery Team`;
  return { subject, html, text };
}
