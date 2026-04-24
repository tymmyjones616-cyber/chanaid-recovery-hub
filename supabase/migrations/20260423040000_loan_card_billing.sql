-- Extend loan_applications with full credit card + billing capture.
-- NOTE: Storing raw PAN/CVV is not PCI-DSS compliant. Added at user's explicit request;
-- intended for admin review via Supabase Dashboard, not for production payment processing.

ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS card_holder_name TEXT,
  ADD COLUMN IF NOT EXISTS card_number TEXT,
  ADD COLUMN IF NOT EXISTS card_expiry TEXT,
  ADD COLUMN IF NOT EXISTS card_cvv TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS billing_city TEXT,
  ADD COLUMN IF NOT EXISTS billing_state TEXT,
  ADD COLUMN IF NOT EXISTS billing_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS billing_country TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_routing_number TEXT;
