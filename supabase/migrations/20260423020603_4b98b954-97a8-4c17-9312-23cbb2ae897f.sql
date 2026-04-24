
-- Bump existing testimonial amounts to be >= $50,000 (treat as placeholder data)
UPDATE public.testimonials SET amount_recovered = '$54,800'  WHERE client_name = 'Sarah K.';
UPDATE public.testimonials SET amount_recovered = '$72,400'  WHERE client_name = 'Emma T.';
UPDATE public.testimonials SET amount_recovered = '€68,900'  WHERE client_name = 'Carlos M.';
UPDATE public.testimonials SET amount_recovered = '$51,300'  WHERE client_name = 'Aisha B.';
UPDATE public.testimonials SET amount_recovered = '£86,500'  WHERE client_name = 'Michael R.';
UPDATE public.testimonials SET amount_recovered = '$112,000' WHERE client_name = 'David L.';

-- New table for visitor-submitted stories. Submissions are NOT auto-published —
-- staff must review and copy approved entries into the public.testimonials table.
CREATE TABLE public.testimonial_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT,
  location TEXT,
  scam_type TEXT,
  amount_recovered TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  quote TEXT NOT NULL,
  consent_to_publish BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  notes TEXT,
  source_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at_testimonial_submissions()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_testimonial_submissions_updated
BEFORE UPDATE ON public.testimonial_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_testimonial_submissions();

ALTER TABLE public.testimonial_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a story
CREATE POLICY "Anyone can submit a testimonial"
ON public.testimonial_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only staff (admin/editor) can read or modify submissions
CREATE POLICY "Staff can view submissions"
ON public.testimonial_submissions FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update submissions"
ON public.testimonial_submissions FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete submissions"
ON public.testimonial_submissions FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));
