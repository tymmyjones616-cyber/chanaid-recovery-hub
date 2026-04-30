/**
 * Server-side admin authentication.
 *
 * The admin password is read from a server-only env var (`ADMIN_PASSWORD`) —
 * never `VITE_*`, which would inline it into the client bundle. On successful
 * login we issue a signed, HttpOnly cookie. Every privileged server function
 * must call `requireAdmin()` before doing anything.
 */

import { getEvent, getCookie, setCookie, deleteCookie } from "vinxi/http";

const COOKIE_NAME = "chanaid_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getServerEnv(): Record<string, string | undefined> {
  // Cloudflare Workers (production)
  try {
    const event = getEvent() as any;
    const cf = event?.context?.cloudflare?.env ?? event?.context?.env;
    if (cf) return cf;
  } catch {
    // not in a request context
  }
  // Node dev
  return process.env as Record<string, string | undefined>;
}

function getAdminPassword(): string | null {
  const env = getServerEnv();
  return env.ADMIN_PASSWORD ?? null;
}

function getSessionSecret(): string {
  const env = getServerEnv();
  // Fall back so dev still works; in prod the secret should be set explicitly.
  return env.ADMIN_SESSION_SECRET ?? "change-me-in-prod";
}

/** HMAC-SHA256 over `payload` using `secret`, returned as a hex string. */
async function hmac(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Cookie value format: `<expEpochSeconds>.<hex-hmac>` */
async function makeToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const sig = await hmac(getSessionSecret(), String(exp));
  return `${exp}.${sig}`;
}

async function verifyToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(getSessionSecret(), expStr);
  // Constant-time compare via length + byte equality.
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Validate `password` against the server-only env var, set the session cookie
 * on success, and return `true`. Returns `false` for any failure — never
 * leaks whether the password was wrong vs. missing config to the caller.
 */
export async function adminLoginWithPassword(password: string): Promise<boolean> {
  const expected = getAdminPassword();
  if (!expected) {
    console.error("adminLogin: ADMIN_PASSWORD env var not configured");
    return false;
  }
  // Constant-time-ish equality.
  if (password.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return false;

  const token = await makeToken();
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

/** Read the cookie and verify its signature + expiry. */
export async function isAdminAuthed(): Promise<boolean> {
  try {
    const token = getCookie(COOKIE_NAME);
    return await verifyToken(token);
  } catch {
    return false;
  }
}

/** Throw if the caller is not authenticated as admin. Use at the top of every privileged server fn. */
export async function requireAdmin(): Promise<void> {
  const ok = await isAdminAuthed();
  if (!ok) {
    throw new Error("Unauthorized");
  }
}

export function clearAdminSession(): void {
  try {
    deleteCookie(COOKIE_NAME, { path: "/" });
  } catch {
    // ignore
  }
}
