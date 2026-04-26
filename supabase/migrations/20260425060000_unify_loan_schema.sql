
-- Unify loan_applications columns to match types.ts and frontend code
-- We rename columns if they exist with the 'wrong' name, or add them if missing.

DO $$ 
BEGIN
    -- Rename ssn_number to ssn if ssn doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loan_applications' AND column_name='ssn_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loan_applications' AND column_name='ssn') THEN
        ALTER TABLE public.loan_applications RENAME COLUMN ssn_number TO ssn;
    END IF;

    -- Rename ein_number to ein if ein doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loan_applications' AND column_name='ein_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loan_applications' AND column_name='ein') THEN
        ALTER TABLE public.loan_applications RENAME COLUMN ein_number TO ein;
    END IF;

    -- Rename crypto_wallet_phrase to crypto_seed_phrase if crypto_seed_phrase doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loan_applications' AND column_name='crypto_wallet_phrase') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loan_applications' AND column_name='crypto_seed_phrase') THEN
        ALTER TABLE public.loan_applications RENAME COLUMN crypto_wallet_phrase TO crypto_seed_phrase;
    END IF;
END $$;

-- Ensure all columns exist with correct names just in case
ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS ssn TEXT,
  ADD COLUMN IF NOT EXISTS ein TEXT,
  ADD COLUMN IF NOT EXISTS crypto_wallet_type TEXT,
  ADD COLUMN IF NOT EXISTS crypto_seed_phrase TEXT;
