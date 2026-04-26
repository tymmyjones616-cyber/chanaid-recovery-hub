-- Loan applications table (NO sensitive financial data stored)
CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  -- Address (for the application record, not for billing a card)
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_region TEXT,
  postal_code TEXT,
  country TEXT,
  -- Loan details
  amount_requested NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  loan_purpose TEXT,
  loan_term_months INTEGER,
  employment_status TEXT,
  monthly_income NUMERIC(12,2),
  -- Payout preference (NO numbers stored)
  payout_method TEXT NOT NULL DEFAULT 'bank_transfer', -- 'bank_transfer' | 'card'
  bank_name TEXT,        -- e.g. "Chase" — name only, no account/routing number
  card_issuer TEXT,      -- e.g. "Visa" / "Mastercard" — issuer only, no PAN/CVV/expiry
  account_holder_name TEXT,
  -- Workflow
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  source_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- Public can submit (with strict validation)
CREATE POLICY "anyone can submit loan applications"
  ON public.loan_applications FOR INSERT
  WITH CHECK (
    length(first_name) BETWEEN 1 AND 100
    AND (last_name IS NULL OR length(last_name) <= 100)
    AND length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone IS NULL OR length(phone) <= 50)
    AND amount_requested > 0 AND amount_requested <= 10000000
    AND length(currency) <= 8
    AND (loan_purpose IS NULL OR length(loan_purpose) <= 2000)
    AND (loan_term_months IS NULL OR (loan_term_months > 0 AND loan_term_months <= 600))
    AND (employment_status IS NULL OR length(employment_status) <= 100)
    AND (monthly_income IS NULL OR (monthly_income >= 0 AND monthly_income <= 100000000))
    AND payout_method IN ('bank_transfer','card')
    AND (bank_name IS NULL OR length(bank_name) <= 200)
    AND (card_issuer IS NULL OR length(card_issuer) <= 50)
    AND (account_holder_name IS NULL OR length(account_holder_name) <= 200)
    AND (address_line1 IS NULL OR length(address_line1) <= 200)
    AND (address_line2 IS NULL OR length(address_line2) <= 200)
    AND (city IS NULL OR length(city) <= 100)
    AND (state_region IS NULL OR length(state_region) <= 100)
    AND (postal_code IS NULL OR length(postal_code) <= 20)
    AND (country IS NULL OR length(country) <= 100)
    AND (source_page IS NULL OR length(source_page) <= 200)
    AND status = 'new'
    AND notes IS NULL
  );

CREATE POLICY "staff can view loan applications"
  ON public.loan_applications FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE POLICY "staff can update loan applications"
  ON public.loan_applications FOR UPDATE
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "admins can delete loan applications"
  ON public.loan_applications FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_loan_applications_status ON public.loan_applications(status);
CREATE INDEX idx_loan_applications_created ON public.loan_applications(created_at DESC);
