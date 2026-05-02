/**
 * Supabase client for server-side operations.
 * Uses the service role key for admin operations (bypasses RLS).
 * Uses the anon key for public read operations (respects RLS).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;
let _publicClient: SupabaseClient | null = null;
let _browserClient: SupabaseClient | null = null;

function getEnv(key: string): string {
  // 1. Check globalThis (set by worker.js in Cloudflare)
  const fromGlobal = (globalThis as any)[key];
  if (fromGlobal) return fromGlobal;

  // 2. Check process.env (Vite dev / Node)
  try {
    const fromEnv = (globalThis as any).process?.env?.[key];
    if (fromEnv) return fromEnv;
  } catch { /* no process in workers */ }

  // 3. Check import.meta.env (Vite)
  try {
    const fromVite = (import.meta as any).env?.[key] || (import.meta as any).env?.["VITE_" + key];
    if (fromVite) return fromVite;
  } catch { /* no import.meta in some contexts */ }

  return "";
}

/**
 * Returns a Supabase client with the service role key.
 * Use this for admin/server operations that bypass RLS.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error(
      "Supabase admin client: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. " +
      `url=${url ? "✓" : "✗"}, key=${key ? "✓" : "✗"}`
    );
  }

  _adminClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _adminClient;
}

/**
 * Returns a Supabase client with the anon key.
 * Use this for public read operations that respect RLS policies.
 */
export function getSupabasePublic(): SupabaseClient {
  if (_publicClient) return _publicClient;

  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_ANON_KEY") || getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error("Supabase public client: SUPABASE_URL or SUPABASE_ANON_KEY not set.");
  }

  _publicClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _publicClient;
}

/**
 * Returns a Supabase client for browser-side use.
 * Persists session and auto-refreshes tokens.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowser() called on server.");
  }
  if (_browserClient) return _browserClient;

  const url = getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
  const key = getEnv("VITE_SUPABASE_ANON_KEY") || getEnv("SUPABASE_ANON_KEY");

  if (!url || !key) {
    throw new Error("Supabase browser client: URL or ANON_KEY missing.");
  }

  _browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _browserClient;
}

/**
 * Reset cached clients. Useful when env vars change (e.g. test setup).
 */
export function resetSupabaseClients() {
  _adminClient = null;
  _publicClient = null;
  _browserClient = null;
}
