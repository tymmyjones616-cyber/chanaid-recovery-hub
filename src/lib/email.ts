/**
 * Resend-based transactional email service.
 * Workers-compatible: uses fetch directly against the Resend REST API.
 *
 * ─── Brand palette (matches the live site) ───────────────────────────────────
 *  Outer bg      #f5f3ff   purple-50 / soft lavender
 *  Dark header   #1a0a2e   deep purple-black
 *  Gradient CTA  135deg, #7c3aed → #c026d3 → #ec4899  (violet → fuchsia → pink)
 *  Primary       #c026d3   fuchsia-600 = oklch(0.62 0.22 320)
 *  Violet        #7c3aed   violet-700
 *  Pink          #ec4899   pink-500
 *  Body text     #334155   slate-700
 *  Muted text    #94a3b8   slate-400
 * ─────────────────────────────────────────────────────────────────────────────
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = "ChanAidRecovery <support@chanaidrecovery.com>";
const SITE = "https://chanaidrecovery.com";
const WALLET_LINK = "https://wiscewallet.com";

// Brand tokens (hex — safe for all email clients)
const C = {
  outerBg:    "#f5f3ff",
  dark:       "#1a0a2e",
  darkMid:    "#2d1257",
  primary:    "#c026d3",   // fuchsia-600
  violet:     "#7c3aed",   // violet-700
  pink:       "#ec4899",   // pink-500
  bodyBg:     "#ffffff",
  bodyText:   "#334155",
  mutedText:  "#94a3b8",
  border:     "#e9d5ff",   // purple-200
  lightPurple:"#faf5ff",   // purple-50 highlight
  successBg:  "#f0fdf4",
  successBorder:"#bbf7d0",
  warningBg:  "#fdf4ff",
  warningBorder:"#e9d5ff",
  errorBorder:"#fecaca",
  accentEmerald: "#10b981",
} as const;

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
  const accent = opts.accentColor || C.primary;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.heroTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: ${C.outerBg}; margin: 0; padding: 0; color: ${C.bodyText}; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: ${C.outerBg}; padding-bottom: 40px; padding-top: 40px; }
    .content { max-width: 600px; margin: 0 auto; background-color: ${C.bodyBg}; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background-color: ${C.dark}; padding: 32px 40px; text-align: left; }
    .logo { height: 32px; width: auto; vertical-align: middle; }
    .hero { padding: 48px 40px; background-color: ${C.bodyBg}; border-bottom: 1px solid ${C.border}; }
    .hero-h1 { margin: 0; font-size: 28px; font-weight: 800; color: ${C.dark}; letter-spacing: -0.5px; line-height: 1.2; }
    .hero-p { margin: 12px 0 0; font-size: 16px; color: ${C.mutedText}; line-height: 1.5; }
    .main { padding: 40px; font-size: 16px; line-height: 1.6; color: ${C.bodyText}; }
    .footer { padding: 32px 40px; text-align: center; font-size: 12px; color: ${C.mutedText}; }
    .btn { display: inline-block; padding: 14px 32px; border-radius: 12px; background: linear-gradient(135deg, ${C.violet} 0%, ${C.primary} 50%, ${C.pink} 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25); }
    .divider { height: 1px; background-color: ${C.border}; margin: 32px 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
    @media screen and (max-width: 600px) {
      .content { border-radius: 0; }
      .hero, .main, .footer { padding-left: 24px; padding-right: 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!--[if (gte mso 9)|(IE)]><table width="600" align="center"><tr><td><![endif]-->
    <div class="content">
      <div class="header">
        <img src="${SITE}/favicon.png" alt="ChanAidRecovery" class="logo">
      </div>
      <div class="hero">
        ${opts.preheader ? `<div class="badge" style="background-color: ${C.lightPurple}; color: ${accent}; border: 1px solid ${accent}40;">${opts.preheader}</div>` : ""}
        <h1 class="hero-h1">${opts.heroTitle}</h1>
        ${opts.heroSubtitle ? `<p class="hero-p">${opts.heroSubtitle}</p>` : ""}
      </div>
      <div class="main">
        ${opts.body}
      </div>
      <div class="footer">
        <p>&copy; 2024 ChanAidRecovery Hub. All rights reserved.</p>
        <p>128 City Road, London, EC1V 2NX, United Kingdom</p>
        <p style="margin-top: 12px; font-weight: 700; color: ${C.dark};">Tip: Add support@chanaidrecovery.com to your contacts to ensure our updates reach your inbox.</p>
        <p style="margin-top: 8px;">Check your <strong>Spam</strong> or <strong>Promotions</strong> folder if you don't see our emails.</p>
        <p style="margin-top: 16px;"><a href="${SITE}/privacy-policy" style="color: ${C.mutedText}; text-decoration: underline;">Privacy Policy</a> &bull; <a href="${SITE}/terms" style="color: ${C.mutedText}; text-decoration: underline;">Terms of Service</a></p>
      </div>
    </div>
    <!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
  </div>
</body>
</html>
  `;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export function welcomeEmail(name: string | null) {
  return {
    subject: "Welcome to ChanAidRecovery Hub",
    html: shell({
      preheader: "Account Created",
      heroTitle: `Hello, ${name || "there"}!`,
      heroSubtitle: "Your recovery journey starts here.",
      body: `
        <p>Thank you for choosing ChanAidRecovery Hub. We've received your registration and our team is ready to help you recover your lost digital assets.</p>
        <p>You can now log in to your dashboard to complete your profile and start your recovery application.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${SITE}/dashboard" class="btn">Access Your Dashboard</a>
        </div>
        <p>If you have any questions, simply reply to this email.</p>
      `,
    }),
  };
}

export function loanSubmittedEmail(name: string | null) {
  return {
    subject: "Application Received | ChanAidRecovery",
    html: shell({
      preheader: "Application Received",
      heroTitle: "We've got it!",
      heroSubtitle: "Your recovery application has been successfully submitted.",
      body: `
        <p>Hello ${name || "Valued Client"},</p>
        <p>Our compliance and technical teams have received your application. We will now begin the identity verification and case assessment process.</p>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Our forensic analysts will review your case details.</li>
          <li>Identity documents will be verified within 24-48 hours.</li>
          <li>You will receive an update via email once the review is complete.</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${SITE}/dashboard" class="btn">Track Application Progress</a>
        </div>
      `,
    }),
  };
}

export function loanVerifiedEmail(name: string | null) {
  return {
    subject: "Identity Verified & Case Approved | ChanAidRecovery",
    html: shell({
      preheader: "Identity Verified",
      heroTitle: "Verification Successful!",
      heroSubtitle: "Your identity has been confirmed and your case is moving to settlement.",
      accentColor: "#10b981", // emerald-500
      body: `
        <p>Hello ${name || "Valued Client"},</p>
        <p>Great news! Your identity verification is complete. Our team has approved your recovery file, and we are now moving to the final settlement phase.</p>
        <div style="background-color: ${C.successBg}; border: 1px solid ${C.successBorder}; padding: 24px; border-radius: 16px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 16px;">Action Required: Initialize Fund Transfer</h3>
          <p style="margin-bottom: 0; color: #166534; font-size: 14px;">To receive your recovered assets, you must create and activate an account at <strong>WisceWallet</strong>. This is our secure partner for large-scale digital asset distribution.</p>
          <p style="margin-top: 12px; color: #166534; font-size: 14px; font-weight: 700;">Once your WisceWallet account is created, your funds will be initialized for transfer after the standard compliance cooldown period.</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${WALLET_LINK}" class="btn">Create WisceWallet Account</a>
        </div>
        <p>If you have already created an account, please ensure it is fully verified to avoid delays in settlement.</p>
      `,
    }),
  };
}

export function loanRejectionEmail(name: string | null, reason?: string) {
  return {
    subject: "Update Regarding Your Application | ChanAidRecovery",
    html: shell({
      preheader: "Status Update",
      heroTitle: "Application Update",
      heroSubtitle: "We require more information or cannot proceed at this time.",
      accentColor: "#ef4444", // red-500
      body: `
        <p>Hello ${name || "Valued Client"},</p>
        <p>After reviewing your application, we are unable to proceed with the recovery at this stage.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>If you believe this is an error or would like to provide additional evidence, please reply to this email or visit your dashboard.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${SITE}/dashboard" class="btn">Review Application Details</a>
        </div>
      `,
    }),
  };
}

export function loanStatusUpdateEmail(name: string | null, status: string, reason?: string) {
  return {
    subject: `Application Status Update | ChanAidRecovery`,
    html: shell({
      preheader: "Status Update",
      heroTitle: "Progress Report",
      heroSubtitle: `Your application is now: ${status.replace(/_/g, " ").toUpperCase()}`,
      body: `
        <p>Hello ${name || "Valued Client"},</p>
        <p>We are writing to inform you that the status of your recovery application has been updated.</p>
        ${reason ? `
        <div style="background-color: ${C.warningBg}; border: 1px solid ${C.warningBorder}; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; color: ${C.dark}; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message from Audit Team:</p>
          <p style="margin: 8px 0 0; color: ${C.bodyText}; font-style: italic;">"${reason}"</p>
        </div>
        ` : ""}
        <p>Please log in to your dashboard to view the full details and take any necessary actions.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${SITE}/dashboard" class="btn">View Status Update</a>
        </div>
      `,
    }),
  };
}

export function customAdminEmail(opts: { userName: string | null; message: string }) {
  return {
    subject: "New Message from ChanAidRecovery Support",
    html: shell({
      preheader: "Support Message",
      heroTitle: "Personal Message",
      heroSubtitle: `A message from our support team regarding your case.`,
      body: `
        <p>Hello ${opts.userName || "Valued Client"},</p>
        <div style="background-color: ${C.lightPurple}; border: 1px solid ${C.border}; padding: 24px; border-radius: 16px; margin: 24px 0; font-style: italic; color: ${C.dark};">
          "${opts.message.replace(/\n/g, "<br>")}"
        </div>
        <p>If you have any questions or need to reply, please click the button below to visit your dashboard or simply reply to this email.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${SITE}/dashboard" class="btn">View Secure Message</a>
        </div>
      `,
    }),
  };
}
