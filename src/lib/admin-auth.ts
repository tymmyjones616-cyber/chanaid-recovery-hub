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
    
    // Check for standard Supabase auth cookies. 
    // Supabase-js uses 'sb-<project-id>-auth-token' or similar.
    // We also check for 'sb-access-token' which we set manually in AuthContext.
    const projectId = "taprwweemxfbrrkwajnc";
    const token = 
      getCookie("sb-access-token") || 
      getCookie(`sb-${projectId}-auth-token`) ||
      getCookie("chanaid_admin_session");

    if (!token) {
      console.log("[AdminAuth] No token found in cookies.");
      return false;
    }

    // If the token is a JSON string (default Supabase behavior for some cookies), parse it
    let jwt = token;
    if (token.startsWith("{")) {
      try {
        const parsed = JSON.parse(token);
        jwt = parsed.access_token || token;
      } catch {
        jwt = token;
      }
    }

    const { data: { user }, error } = await sb.auth.getUser(jwt);
    if (error || !user) {
      if (error) console.error("[AdminAuth] Supabase error:", error.message);
      return false;
    }

    // Check for admin role in app_metadata or user_metadata
    const role = user.app_metadata?.role || user.user_metadata?.role;
    const isOk = role === "admin";
    
    if (!isOk) {
      console.log(`[AdminAuth] User ${user.email} does not have admin role. Role found: ${role}`);
    }

    return isOk;
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
  const ok = await isAdminAuthed();
  if (!ok) {
    throw new Error("Unauthorized: Admin access required");
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
