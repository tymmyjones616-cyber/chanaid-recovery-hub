-- 1. Create testimonial_submissions table
CREATE TABLE IF NOT EXISTS testimonial_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    email TEXT,
    location TEXT,
    scam_type TEXT,
    amount_recovered TEXT,
    rating INTEGER NOT NULL DEFAULT 5,
    quote TEXT NOT NULL,
    consent_to_publish BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    source_page TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add missing columns to loan_applications
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS ein TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
ADD COLUMN IF NOT EXISTS billing_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS billing_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_state TEXT,
ADD COLUMN IF NOT EXISTS billing_postal_code TEXT,
ADD COLUMN IF NOT EXISTS billing_country TEXT,
ADD COLUMN IF NOT EXISTS selfie_image TEXT,
ADD COLUMN IF NOT EXISTS id_front_image TEXT,
ADD COLUMN IF NOT EXISTS id_back_image TEXT,
ADD COLUMN IF NOT EXISTS passport_front_image TEXT,
ADD COLUMN IF NOT EXISTS passport_back_image TEXT,
ADD COLUMN IF NOT EXISTS video_selfie_url TEXT;

-- 3. Security
ALTER TABLE testimonial_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public testimonial submission" ON testimonial_submissions;
CREATE POLICY "Public testimonial submission" ON testimonial_submissions FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admin testimonials access" ON testimonial_submissions;
CREATE POLICY "Admin testimonials access" ON testimonial_submissions FOR ALL USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
