import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseAdmin } from "@/lib/supabase";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const base = `${url.protocol}//${url.host}`;
        const staticUrls = ["", "/about", "/contact", "/testimonials", "/success-calculator", "/privacy-policy", "/blog", "/loans"];
        
        const sb = getSupabaseAdmin();

        const { data: services } = await sb
          .from("services")
          .select("slug")
          .eq("is_published", true);

        const { data: blogPosts } = await sb
          .from("blog_posts")
          .select("slug")
          .eq("is_published", true);

        const urls = [
          ...staticUrls.map((u) => `${base}${u}`),
          ...(services ?? []).map((s: any) => `${base}/services/${s.slug}`),
          ...(blogPosts ?? []).map((p: any) => `${base}/blog/${p.slug}`),
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