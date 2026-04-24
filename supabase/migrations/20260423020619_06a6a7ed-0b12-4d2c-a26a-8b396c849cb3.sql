
-- Pin the trigger function's search_path
CREATE OR REPLACE FUNCTION public.set_updated_at_testimonial_submissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Replace the permissive INSERT policy with a validated one
DROP POLICY IF EXISTS "Anyone can submit a testimonial" ON public.testimonial_submissions;

CREATE POLICY "Public can submit pending testimonial"
ON public.testimonial_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND length(btrim(client_name)) BETWEEN 2 AND 120
  AND length(btrim(quote)) BETWEEN 10 AND 2000
  AND rating BETWEEN 1 AND 5
);
