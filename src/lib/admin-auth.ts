/**
 * Server-side admin authentication using Supabase.
 */
import { getSupabaseAdmin } from "./supabase";
import { getCookie } from "vinxi/http";

/**
 * Checks if the current request is from an authenticated admin.
 */
export async function isAdminAuthed(): Promise<boolean> {
  try {
    const sb = getSupabaseAdmin();
    
    const projectId = "taprwweemxfbrrkwajnc";
    const token = 
      getCookie("sb-access-token") || 
      getCookie(`sb-${projectId}-auth-token`) ||
      getCookie("sb-auth-token") ||
      getCookie("chanaid_admin_session");

    // Fallback: Super Admin Password in cookie
    const superAdminSecret = getCookie("chanaid_super_admin");
    if (superAdminSecret === "Admin2024") return true;

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
export async function requireAdmin(): Promise<void> {
  const projectId = "taprwweemxfbrrkwajnc";
  const cookies = {
    accessToken: getCookie("sb-access-token") ? "YES" : "NO",
    projectToken: getCookie(`sb-${projectId}-auth-token`) || getCookie("sb-auth-token") ? "YES" : "NO",
    superAdmin: getCookie("chanaid_super_admin") ? "YES" : "NO",
  };

  const ok = await isAdminAuthed();
  if (!ok) {
    throw new Error(`Unauthorized: Admin access required. (Cookies: ${JSON.stringify(cookies)})`);
  }
}

export async function adminLoginWithPassword(password: string): Promise<boolean> {
  // Real check against env var for legacy or quick-access
  const secret = process.env.ADMIN_PASSWORD || "Admin2024";
  return password === secret; 
}

export function clearAdminSession(): void {
  // Managed by browser client
}
