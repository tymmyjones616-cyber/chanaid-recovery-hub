/**
 * Server-side admin authentication using Supabase.
 * Cookies are parsed from the standard Cookie header on the Web Request,
 * so this works in any runtime (Cloudflare Workers, Node, etc.).
 */
import { getSupabaseAdmin } from "./supabase";

function parseCookie(cookieHeader: string | null | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(/;\s*/);
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) {
      const v = part.slice(idx + 1).trim();
      try {
        return decodeURIComponent(v);
      } catch {
        return v;
      }
    }
  }
  return undefined;
}

function getCookieFromRequest(request: Request | undefined, name: string): string | undefined {
  if (!request) return undefined;
  return parseCookie(request.headers.get("cookie"), name);
}

/**
 * Checks if the current request is from an authenticated admin.
 */
export async function isAdminAuthed(request?: Request): Promise<boolean> {
  try {
    const sb = getSupabaseAdmin();

    const projectId = "taprwweemxfbrrkwajnc";
    const token =
      getCookieFromRequest(request, "sb-access-token") ||
      getCookieFromRequest(request, `sb-${projectId}-auth-token`) ||
      getCookieFromRequest(request, "sb-auth-token") ||
      getCookieFromRequest(request, "chanaid_admin_session");

    // Fallback: Super Admin Password in cookie
    const superAdminSecret = getCookieFromRequest(request, "chanaid_super_admin");
    
    
    if (superAdminSecret === "Admin2024") {
      return true;
    }

    if (!token) return false;

    // Handle Supabase's potentially URL-encoded JSON cookie
    let jwt = token;
    if (token.includes("%7B") || token.startsWith("{")) {
      try {
        const decoded = token.includes("%") ? decodeURIComponent(token) : token;
        const parsed = JSON.parse(decoded);
        jwt = parsed.access_token || jwt;
      } catch {
        // Not JSON, use as is
      }
    }

    const { data: { user }, error } = await sb.auth.getUser(jwt);
    if (error || !user) return false;

    const role = user.app_metadata?.role || user.user_metadata?.role;
    return role === "admin";
  } catch (err) {
    console.error("[AdminAuth] Unexpected error:", err);
    return false;
  }
}

/**
 * Throw if the caller is not authenticated as admin.
 * Use at the top of every privileged server fn.
 */
export async function requireAdmin(request?: Request): Promise<void> {
  const ok = await isAdminAuthed(request);
  if (!ok) {
    const hasCookieHeader = !!request?.headers.get("cookie");
    throw new Error(`Unauthorized: Admin access required. (cookieHeader: ${hasCookieHeader})`);
  }
}

export async function adminLoginWithPassword(password: string): Promise<boolean> {
  const secret = (globalThis as any).ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "Admin2024";
  return password === secret;
}

export function clearAdminSession(): void {
  // Managed by browser client
}
