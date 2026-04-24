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

export const Route = createFileRoute("/api/admin/settings")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const client = getClient();
          if (!client) return Response.json({ error: "Supabase not configured." }, { status: 503 });
          const { data, error } = await client.from("chanaid_config").select("*").eq("id", 1).maybeSingle();
          if (error) return Response.json({ error: error.message }, { status: 500 });
          return Response.json(data ?? {});
        } catch (e) {
          console.error(e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },

      PATCH: async ({ request }: { request: Request }) => {
        try {
          const client = getClient();
          if (!client) return Response.json({ error: "Supabase not configured." }, { status: 503 });
          const body = await request.json();
          // Whitelist allowed fields
          const allowed = [
            "site_name","tagline","logo_url","contact_email","contact_phone","contact_address",
            "whatsapp_number","telegram_username","facebook_url","twitter_url","linkedin_url",
            "instagram_url","youtube_url","hero_headline","hero_subheadline","hero_cta_primary",
            "hero_cta_secondary","stats_recovered","stats_cases","stats_success","footer_text",
            "default_seo_title","default_seo_description","og_image_url","google_analytics_id",
            "primary_color","accent_color",
          ];
          const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
          for (const k of allowed) {
            if (k in body) patch[k] = body[k];
          }
          const { error } = await client.from("chanaid_config").update(patch).eq("id", 1);
          if (error) return Response.json({ error: error.message }, { status: 500 });
          return Response.json({ success: true });
        } catch (e) {
          console.error(e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
