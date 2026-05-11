import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowser();

    // Get initial session — suppress stale refresh-token errors (expected for logged-out visitors)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error?.message?.includes("Refresh Token")) {
        supabase.auth.signOut().catch(() => null);
      }
      setSession(session);
      setUser(session?.user ?? null);

      const isSupabaseAdmin = session?.user?.app_metadata?.role === "admin" || session?.user?.user_metadata?.role === "admin";
      const isSuperAdmin = typeof document !== 'undefined' && document.cookie.includes("chanaid_super_admin=Admin2024");

      setIsAdmin(isSupabaseAdmin || isSuperAdmin);
      setIsLoading(false);

      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "TOKEN_REFRESH_FAILED") {
        supabase.auth.signOut().catch(() => null);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      
      const isSupabaseAdmin = session?.user?.app_metadata?.role === "admin" || session?.user?.user_metadata?.role === "admin";
      const isSuperAdmin = typeof document !== 'undefined' && document.cookie.includes("chanaid_super_admin=Admin2024");

      setIsAdmin(isSupabaseAdmin || isSuperAdmin);
      setIsLoading(false);

      // Sync session to cookie for server functions
      if (session) {
        // Set both the specific access token and a generic auth token for server fns
        const cookieStr = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = cookieStr;
      } else {
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    document.cookie = "chanaid_super_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
