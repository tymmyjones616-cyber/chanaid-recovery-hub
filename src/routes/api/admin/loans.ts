import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    || "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const Route = createFileRoute("/api/admin/loans")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const client = getClient();
          if (!client) return Response.json({ error: "Supabase not configured." }, { status: 503 });
          const { data, error } = await client
            .from("loan_applications")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) return Response.json({ error: error.message }, { status: 500 });
          return Response.json(data ?? []);
        } catch (e) {
          console.error(e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
