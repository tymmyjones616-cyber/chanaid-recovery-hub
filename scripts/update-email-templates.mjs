/**
 * Updates all Supabase Auth email templates with branded ChanAidRecovery HTML.
 * Run once: node scripts/update-email-templates.mjs
 */

const ACCENT = "#f97316";
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || "taprwweemxfbrrkwajnc";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error("❌ Set SUPABASE_ACCESS_TOKEN env var before running this script.");
  process.exit(1);
}

function shell(preheader, heroTitle, heroSubtitle, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>ChanAidRecovery</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:32px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

<!-- Header -->
<tr><td style="background:#0f172a;border-radius:16px 16px 0 0;padding:24px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td><span style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.03em;">ChanAid<span style="color:${ACCENT};">Recovery</span></span></td>
<td align="right"><span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:.2em;text-transform:uppercase;">Asset Recovery Hub</span></td>
</tr></table>
</td></tr>

<!-- Hero -->
<tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%);padding:48px 40px 52px;">
<p style="margin:0 0 12px;font-size:11px;font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:${ACCENT};">ChanAidRecovery</p>
<h1 style="margin:0 0 14px;font-size:32px;font-weight:900;line-height:1.15;letter-spacing:-0.03em;color:#fff;">${heroTitle}</h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.55);">${heroSubtitle}</p>
</td></tr>

<!-- Body -->
<tr><td style="background:#fff;padding:40px;">${body}</td></tr>

<!-- Stats -->
<tr><td style="background:#0f172a;padding:28px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" style="border-right:1px solid rgba(255,255,255,0.08);padding:0 16px 0 0;">
  <p style="margin:0;font-size:22px;font-weight:900;color:${ACCENT};">$500M+</p>
  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Recovered</p>
</td>
<td align="center" style="border-right:1px solid rgba(255,255,255,0.08);padding:0 16px;">
  <p style="margin:0;font-size:22px;font-weight:900;color:${ACCENT};">10K+</p>
  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Cases Won</p>
</td>
<td align="center" style="padding:0 0 0 16px;">
  <p style="margin:0;font-size:22px;font-weight:900;color:${ACCENT};">98%</p>
  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Success Rate</p>
</td>
</tr></table>
</td></tr>

<!-- Footer -->
<tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:28px 40px;border-top:1px solid #e2e8f0;">
<p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">
  ChanAidRecovery &middot; Professional Asset Recovery &amp; Blockchain Forensics<br/>
  <a href="https://chanaidrecovery.com" style="color:${ACCENT};text-decoration:none;">chanaidrecovery.com</a>
  &nbsp;&middot;&nbsp;
  <a href="mailto:support@chanaidrecovery.com" style="color:#94a3b8;text-decoration:none;">support@chanaidrecovery.com</a>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── OTP / Email confirmation ────────────────────────────────────────────────
const confirmationBody = `
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">
  Welcome! Enter the verification code below, or click the button to confirm your email and activate your ChanAidRecovery account.
</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
<tr><td align="center">
  <div style="display:inline-block;background:#0f172a;border-radius:16px;padding:28px 48px;">
    <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Your Verification Code</p>
    <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:.2em;color:#f97316;font-family:monospace;">{{ .Token }}</p>
  </div>
</td></tr>
</table>

<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
<tr><td align="center" style="background:#f97316;border-radius:12px;">
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 36px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;">Confirm My Account &rarr;</a>
</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
<tr><td style="font-size:13px;color:#9a3412;line-height:1.6;">
  🔒 <strong>Never share this code.</strong> ChanAidRecovery staff will never ask for your verification code. It expires in 1 hour. If you did not create an account, you can safely ignore this email.
</td></tr>
</table>
`;

// ── Password reset ─────────────────────────────────────────────────────────
const recoveryBody = `
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">
  We received a request to reset the password for your ChanAidRecovery account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
</p>

<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
<tr><td align="center" style="background:#0f172a;border-radius:12px;">
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 36px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;">Reset My Password &rarr;</a>
</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
<tr><td style="font-size:13px;color:#9a3412;line-height:1.6;">
  ⚠️ If you did not request a password reset, your account may be at risk. Please contact <a href="mailto:support@chanaidrecovery.com" style="color:#f97316;text-decoration:none;">support@chanaidrecovery.com</a> immediately.
</td></tr>
</table>
`;

// ── Magic link ─────────────────────────────────────────────────────────────
const magicLinkBody = `
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">
  You requested a magic sign-in link for ChanAidRecovery. No password needed — just click the button below to access your account instantly. This link expires in <strong>1 hour</strong>.
</p>

<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
<tr><td align="center" style="background:#f97316;border-radius:12px;">
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 36px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;">Sign In to My Account &rarr;</a>
</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
<tr><td style="font-size:13px;color:#9a3412;line-height:1.6;">
  🔒 This link is single-use and expires in 1 hour. If you did not request this, you can safely ignore this email.
</td></tr>
</table>
`;

// ── Email change confirmation ───────────────────────────────────────────────
const emailChangeBody = `
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">
  You requested to change the email address on your ChanAidRecovery account from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>. Click the button below to confirm this change.
</p>

<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
<tr><td align="center" style="background:#f97316;border-radius:12px;">
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 36px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;">Confirm Email Change &rarr;</a>
</td></tr>
</table>

<p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
  If you did not request this change, contact <a href="mailto:support@chanaidrecovery.com" style="color:#f97316;text-decoration:none;">support@chanaidrecovery.com</a> immediately.
</p>
`;

const payload = {
  // ── Subjects ──────────────────────────────────────────────────────────────
  mailer_subjects_confirmation: "Verify your ChanAidRecovery account",
  mailer_subjects_recovery: "Reset your ChanAidRecovery password",
  mailer_subjects_magic_link: "Your ChanAidRecovery sign-in link",
  mailer_subjects_email_change: "Confirm your new email — ChanAidRecovery",
  mailer_subjects_invite: "You've been invited to ChanAidRecovery",

  // ── Templates ─────────────────────────────────────────────────────────────
  mailer_templates_confirmation_content: shell(
    "Your verification code is ready — confirm your email to activate your account.",
    "Confirm Your Email",
    "One quick step to secure your ChanAidRecovery account.",
    confirmationBody
  ),
  mailer_templates_recovery_content: shell(
    "Reset your ChanAidRecovery password — link expires in 1 hour.",
    "Password Reset Request",
    "We received a request to reset your password.",
    recoveryBody
  ),
  mailer_templates_magic_link_content: shell(
    "Your magic sign-in link is ready — click to access your account.",
    "Sign In to ChanAidRecovery",
    "No password needed — just click the button below.",
    magicLinkBody
  ),
  mailer_templates_email_change_content: shell(
    "Confirm your new email address for ChanAidRecovery.",
    "Confirm Email Change",
    "Verify your new email address to complete the update.",
    emailChangeBody
  ),
};

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_ID}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);

const data = await res.json();

const checkKeys = [
  "smtp_host", "smtp_user", "smtp_sender_name",
  "mailer_subjects_confirmation", "mailer_subjects_recovery",
  "mailer_subjects_magic_link", "mailer_subjects_email_change",
];

if (data.message) {
  console.error("❌ API error:", data.message);
} else {
  console.log("✅ Templates updated successfully:");
  checkKeys.forEach(k => console.log(`  ${k}: ${data[k]}`));
}
