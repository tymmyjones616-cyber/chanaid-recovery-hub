import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const Route = createFileRoute("/api/admin/testimonials")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const admin = getAdminClient();
          if (!admin) {
            return Response.json(
              { error: "SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to your .env file." },
              { status: 503 }
            );
          }
          const { data, error } = await admin
            .from("testimonial_submissions")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) {
            console.error("Admin testimonials error", error);
            return Response.json({ error: error.message }, { status: 500 });
          }
          return Response.json(data ?? []);
        } catch (e) {
          console.error(e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
