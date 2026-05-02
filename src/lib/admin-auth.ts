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
    
    // In TanStack Start / Vinxi, we can try to get the session from headers/cookies
    // But since we are server-side, we usually expect a token to be passed 
    // or we use the supabase-js helper to get the user.
    
    // For now, let's look for the standard Supabase cookie or a custom one
    const token = getCookie("sb-access-token") || getCookie("chanaid_admin_session");
    if (!token) return false;

    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return false;

    // Check for admin role in app_metadata or user_metadata
    const role = user.app_metadata?.role || user.user_metadata?.role;
    return role === "admin";
  } catch {
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
  // This is a legacy fallback or can be implemented using Supabase email/pass
  // For the new production requirement, we prefer real Supabase Auth.
  return false; 
}

export function clearAdminSession(): void {
  // Supabase handles session clearing on the client
}
