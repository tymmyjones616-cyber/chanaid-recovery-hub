
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Make bucket private to prevent listing; we'll use signed URLs OR keep public and drop listing.
-- Simpler: keep public (direct URLs work) but drop SELECT policy so listing is blocked.
drop policy if exists "anyone can read media bucket" on storage.objects;
