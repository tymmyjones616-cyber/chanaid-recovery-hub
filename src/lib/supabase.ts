/**
 * Supabase client for server-side operations.
 * Uses the service role key for admin operations (bypasses RLS).
 * Uses the anon key for public read operations (respects RLS).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;
let _publicClient: SupabaseClient | null = null;
let _browserClient: SupabaseClient | null = null;

const PUBLIC_SUPABASE_URL = "https://taprwweemxfbrrkwajnc.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcHJ3d2VlbXhmYnJya3dham5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjczMjQsImV4cCI6MjA5MjY0MzMyNH0.AKGtcqIb7HDkIQYa0sy6BiW_JopU1GXaiLZ4B9Ki1WU";

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

  // 4. Hardcoded Fallbacks (Public keys only)
  if (key === "SUPABASE_URL" || key === "VITE_SUPABASE_URL") {
    return PUBLIC_SUPABASE_URL;
  }
  if (key === "SUPABASE_ANON_KEY" || key === "VITE_SUPABASE_ANON_KEY") {
    return PUBLIC_SUPABASE_ANON_KEY;
  }

  return "";
}

/**
 * Returns a Supabase client with the service role key.
 * Use this for admin/server operations that bypass RLS.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  console.log("[Supabase] Initializing Admin Client...");
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    const msg = `Supabase admin client: URL or SERVICE_ROLE_KEY missing. url=${!!url}, key=${!!key}`;
    console.error(`[Supabase] ${msg}`);
    throw new Error(msg);
  }

  try {
    _adminClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    console.log("[Supabase] Admin Client initialized successfully.");
    return _adminClient;
  } catch (err: any) {
    console.error("[Supabase] Failed to create Admin Client:", err);
    throw new Error(`Supabase client creation failed: ${err?.message || "Unknown error"}`);
  }
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

  const url = getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL") || PUBLIC_SUPABASE_URL;
  const key = getEnv("VITE_SUPABASE_ANON_KEY") || getEnv("SUPABASE_ANON_KEY") || PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(`Supabase browser client: URL or ANON_KEY missing.`);
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
