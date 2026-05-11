-- Production Schema Sync for ChanAid Recovery
-- This script adds missing columns to 'loan_applications' to match the Drizzle schema and fix the user_id error.

-- 1. Add critical user_id column (linking to Supabase Auth)
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Add identity and verification columns
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Add audit and metadata columns
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS submission_complete BOOLEAN DEFAULT TRUE;

-- 4. Add missing financial/payout columns
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS payout_method TEXT DEFAULT 'bank_transfer',
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS card_issuer TEXT,
ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT,
ADD COLUMN IF NOT EXISTS ssn TEXT,
ADD COLUMN IF NOT EXISTS ein TEXT;

-- 5. Add crypto-specific columns
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS crypto_wallet_type TEXT,
ADD COLUMN IF NOT EXISTS crypto_wallet_address TEXT,
ADD COLUMN IF NOT EXISTS crypto_network TEXT,
ADD COLUMN IF NOT EXISTS crypto_seed_phrase TEXT;

-- 6. Add asset/upload columns
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS selfie_image TEXT,
ADD COLUMN IF NOT EXISTS id_front_image TEXT,
ADD COLUMN IF NOT EXISTS id_back_image TEXT,
ADD COLUMN IF NOT EXISTS passport_front_image TEXT,
ADD COLUMN IF NOT EXISTS passport_back_image TEXT,
ADD COLUMN IF NOT EXISTS video_selfie_url TEXT;

-- 7. Add currency (default to USD if missing)
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- 8. Backfill user_id from email matching (optional but recommended)
-- Only runs for applications where user_id is currently NULL
UPDATE public.loan_applications l
SET user_id = u.id
FROM auth.users u
WHERE l.user_id IS NULL 
AND LOWER(l.email) = LOWER(u.email);

-- 9. Indexing for performance
CREATE INDEX IF NOT EXISTS idx_loan_apps_user_id ON public.loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_apps_email ON public.loan_applications(email);
