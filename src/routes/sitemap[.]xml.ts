import { createFileRoute } from "@tanstack/react-router";
import { getEvent } from "vinxi/http";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const base = `${url.protocol}//${url.host}`;
        const staticUrls = ["", "/about", "/contact", "/testimonials", "/success-calculator", "/privacy-policy", "/blog", "/loans"];
        
        const env = (getEvent() as any).context.cloudflare.env;
        const db = drizzle(env.DB, { schema });

        const services = await db.query.services.findMany({
          where: eq(schema.services.isPublished, true),
          columns: { slug: true }
        });

        const blogPosts = await db.query.blogPosts.findMany({
          where: eq(schema.blogPosts.isPublished, true),
          columns: { slug: true }
        });

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