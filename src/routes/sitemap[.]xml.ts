import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const base = `${url.protocol}//${url.host}`;
        const staticUrls = ["", "/about", "/contact", "/testimonials", "/success-calculator", "/privacy-policy"];
        const { data: services } = await supabaseAdmin.from("services").select("slug").eq("is_published", true);
        const urls = [
          ...staticUrls.map((u) => `${base}${u}`),
          ...(services ?? []).map((s: any) => `${base}/services/${s.slug}`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});