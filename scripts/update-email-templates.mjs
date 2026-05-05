/**
 * Updates all Supabase Auth email templates with branded ChanAidRecovery HTML.
 * Theme matches the live site: deep-purple dark, violet→fuchsia→pink gradient.
 *
 * Run: SUPABASE_ACCESS_TOKEN=<token> node scripts/update-email-templates.mjs
 */

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || "taprwweemxfbrrkwajnc";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error("❌ Set SUPABASE_ACCESS_TOKEN env var before running this script.");
  process.exit(1);
}

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  outerBg:    "#f5f3ff",
  dark:       "#1a0a2e",
  darkMid:    "#2d1257",
  primary:    "#c026d3",
  violet:     "#7c3aed",
  pink:       "#ec4899",
  border:     "#e9d5ff",
  lightPurple:"#faf5ff",
  bodyText:   "#334155",
  mutedText:  "#94a3b8",
};

// ─── Shared shell ─────────────────────────────────────────────────────────────
function shell(preheader, heroTitle, heroSubtitle, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>ChanAidRecovery</title>
</head>
<body style="margin:0;padding:0;background:${C.outerBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.outerBg};">
<tr><td align="center" style="padding:32px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

<!-- Header -->
<tr><td style="background:${C.dark};border-radius:16px 16px 0 0;padding:24px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td><span style="font-size:20px;font-weight:900;letter-spacing:-0.03em;"><span style="color:#fff;">ChanAid</span><span style="color:${C.pink};">Recovery</span></span></td>
<td align="right"><span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:.2em;text-transform:uppercase;">Asset Recovery Hub</span></td>
</tr></table>
</td></tr>

<!-- Hero -->
<tr><td style="background:linear-gradient(135deg,${C.dark} 0%,${C.darkMid} 60%,${C.dark} 100%);padding:48px 40px 52px;">
<p style="margin:0 0 12px;font-size:11px;font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:${C.primary};">ChanAidRecovery</p>
<h1 style="margin:0 0 14px;font-size:30px;font-weight:900;line-height:1.2;letter-spacing:-0.02em;color:#fff;">${heroTitle}</h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);">${heroSubtitle}</p>
</td></tr>

<!-- Body -->
<tr><td style="background:#fff;padding:40px;">${body}</td></tr>

<!-- Stats gradient bar -->
<tr><td style="background:linear-gradient(135deg,${C.violet} 0%,${C.primary} 50%,${C.pink} 100%);padding:28px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" style="border-right:1px solid rgba(255,255,255,0.2);padding:0 16px 0 0;">
  <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">$500M+</p>
  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Recovered</p>
</td>
<td align="center" style="border-right:1px solid rgba(255,255,255,0.2);padding:0 16px;">
  <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">10K+</p>
  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Cases Won</p>
</td>
<td align="center" style="padding:0 0 0 16px;">
  <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">98%</p>
  <p style="margin:4px 0 0;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Success Rate</p>
</td>
</tr></table>
</td></tr>

<!-- Footer -->
<tr><td style="background:${C.lightPurple};border-radius:0 0 16px 16px;padding:28px 40px;border-top:1px solid ${C.border};">
<p style="margin:0;font-size:11px;color:${C.mutedText};line-height:1.5;">
  ChanAidRecovery · Professional Asset Recovery &amp; Blockchain Forensics<br/>
  <a href="https://chanaidrecovery.com" style="color:${C.primary};text-decoration:none;">chanaidrecovery.com</a>
  &nbsp;·&nbsp;
  <a href="mailto:support@chanaidrecovery.com" style="color:${C.mutedText};text-decoration:none;">support@chanaidrecovery.com</a>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── OTP / Email confirmation ──────────────────────────────────────────────────
const confirmBody = `
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:${C.bodyText};">
  Welcome! Enter the verification code below, or click the button to confirm your email and activate your ChanAidRecovery account.
</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
<tr><td align="center">
  <div style="display:inline-block;background:linear-gradient(135deg,${C.dark} 0%,${C.darkMid} 100%);border-radius:16px;padding:28px 48px;border:1px solid rgba(124,58,237,0.3);">
    <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:.25em;text-transform:uppercase;color:rgba(196,181,253,0.7);">Verification Code</p>
    <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:.2em;color:${C.pink};font-family:monospace;">{{ .Token }}</p>
  </div>
</td></tr>
</table>

<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
<tr><td align="center" style="background:linear-gradient(135deg,${C.violet} 0%,${C.primary} 60%,${C.pink} 100%);border-radius:50px;">
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:15px 38px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;">Confirm My Account &rarr;</a>
</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.lightPurple};border:1px solid ${C.border};border-radius:12px;padding:14px 18px;">
<tr><td style="font-size:13px;color:#6b21a8;line-height:1.6;">
  🔒 <strong>Never share this code.</strong> It expires in 1 hour. If you did not create a ChanAidRecovery account, ignore this email.
</td></tr>
</table>
`;

// ─── Password reset ────────────────────────────────────────────────────────────
const recoveryBody = `
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:${C.bodyText};">
  We received a request to reset the password for your ChanAidRecovery account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
</p>

<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
<tr><td align="center" style="background:${C.dark};border-radius:50px;">
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:15px 38px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;">Reset My Password &rarr;</a>
</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;">
<tr><td style="font-size:13px;color:#9a3412;line-height:1.6;">
  ⚠️ If you did not request a password reset, please contact <a href="mailto:support@chanaidrecovery.com" style="color:${C.primary};text-decoration:none;">support@chanaidrecovery.com</a> immediately.
</td></tr>
</table>
`;

// ─── Magic link ────────────────────────────────────────────────────────────────
const magicBody = `
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:${C.bodyText};">
  You requested a magic sign-in link for ChanAidRecovery. No password needed — just click below to access your account instantly. This link expires in <strong>1 hour</strong>.
</p>

<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
<tr><td align="center" style="background:linear-gradient(135deg,${C.violet} 0%,${C.primary} 60%,${C.pink} 100%);border-radius:50px;">
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:15px 38px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;">Sign In to My Account &rarr;</a>
</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.lightPurple};border:1px solid ${C.border};border-radius:12px;padding:14px 18px;">
<tr><td style="font-size:13px;color:#6b21a8;line-height:1.6;">
  🔒 This link is single-use and expires in 1 hour. If you did not request this, you can safely ignore this email.
</td></tr>
</table>
`;

// ─── Email change ──────────────────────────────────────────────────────────────
const emailChangeBody = `
<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:${C.bodyText};">
  You requested to change your ChanAidRecovery email from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>. Click below to confirm.
</p>

<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
<tr><td align="center" style="background:linear-gradient(135deg,${C.violet} 0%,${C.primary} 60%,${C.pink} 100%);border-radius:50px;">
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:15px 38px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;">Confirm Email Change &rarr;</a>
</td></tr>
</table>

<p style="margin:0;font-size:12px;color:${C.mutedText};text-align:center;">
  Didn't request this? Contact <a href="mailto:support@chanaidrecovery.com" style="color:${C.primary};text-decoration:none;">support@chanaidrecovery.com</a> immediately.
</p>
`;

// ─── Payload ───────────────────────────────────────────────────────────────────
const payload = {
  mailer_subjects_confirmation: "Verify your ChanAidRecovery account",
  mailer_subjects_recovery:     "Reset your ChanAidRecovery password",
  mailer_subjects_magic_link:   "Your ChanAidRecovery sign-in link",
  mailer_subjects_email_change: "Confirm your new email — ChanAidRecovery",
  mailer_subjects_invite:       "You've been invited to ChanAidRecovery",

  mailer_templates_confirmation_content: shell(
    "Your verification code is ready — confirm your email to activate your account.",
    "Confirm Your Email",
    "One quick step to secure your ChanAidRecovery account.",
    confirmBody
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
    magicBody
  ),
  mailer_templates_email_change_content: shell(
    "Confirm your new email address for ChanAidRecovery.",
    "Confirm Email Change",
    "Verify your new email address to complete the update.",
    emailChangeBody
  ),
};

// ─── Send to Supabase ──────────────────────────────────────────────────────────
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

if (data.message) {
  console.error("❌ API error:", data.message);
  process.exit(1);
} else {
  console.log("✅ Supabase auth email templates updated:");
  [
    "smtp_host", "smtp_user", "smtp_sender_name",
    "mailer_subjects_confirmation", "mailer_subjects_recovery",
    "mailer_subjects_magic_link", "mailer_subjects_email_change",
  ].forEach(k => console.log(`   ${k}: ${data[k]}`));
}
