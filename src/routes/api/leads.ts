import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().nullable(),
  amount_lost: z.string().trim().max(50).optional().nullable(),
  scam_type: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().max(5000).optional().nullable(),
  source_page: z.string().trim().max(200).optional().nullable(),
});

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = Schema.safeParse(body);
          if (!parsed.success) {
            return Response.json({ error: "Invalid input" }, { status: 400 });
          }
          const d = parsed.data;
          const { data: lead, error } = await supabaseAdmin
            .from("leads")
            .insert({
              first_name: d.first_name,
              last_name: d.last_name || null,
              email: d.email,
              phone: d.phone || null,
              amount_lost: d.amount_lost || null,
              scam_type: d.scam_type || null,
              message: d.message || null,
              source_page: d.source_page || null,
            })
            .select()
            .single();
          if (error) {
            console.error("Lead insert error", error);
            return Response.json({ error: "Failed to save" }, { status: 500 });
          }

          // Email notification skipped (Lovable detached)
          return Response.json({ ok: true, id: lead.id });
        } catch (e) {
          console.error(e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});
