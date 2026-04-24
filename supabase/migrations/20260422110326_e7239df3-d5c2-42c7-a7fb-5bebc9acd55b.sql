
-- Roles enum
create type public.app_role as enum ('admin', 'editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer to avoid RLS recursion
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

-- First user becomes admin automatically
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.user_roles where role = 'admin') = 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- Site settings (singleton row)
create table public.site_settings (
  id int primary key default 1,
  site_name text not null default 'ChanAidRecovery',
  tagline text default 'Get Your Money Back from Online Scams',
  logo_url text,
  favicon_url text,
  contact_email text default 'contact@chanaidrecovery.com',
  contact_phone text,
  contact_address text,
  whatsapp_number text default '+10000000000',
  telegram_username text default 'chanaidrecovery',
  notification_email text,
  facebook_url text,
  twitter_url text,
  linkedin_url text,
  instagram_url text,
  youtube_url text,
  default_seo_title text default 'ChanAidRecovery — Asset & Funds Recovery Experts',
  default_seo_description text default 'Recover funds lost to online scams. ChanAidRecovery helps victims of crypto, forex, binary options and other financial scams get their money back.',
  og_image_url text,
  geo_country text default 'US',
  geo_region text default 'Worldwide',
  google_analytics_id text,
  footer_text text default '© ChanAidRecovery. All rights reserved.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

alter table public.site_settings enable row level security;
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

insert into public.site_settings (id) values (1) on conflict do nothing;

-- Pages (home, about, contact, testimonials, calculator, privacy)
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  hero_eyebrow text,
  hero_headline text,
  hero_subheadline text,
  hero_image_url text,
  seo_title text,
  seo_description text,
  og_image_url text,
  sections jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pages enable row level security;
create trigger pages_touch before update on public.pages for each row execute function public.touch_updated_at();

-- Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  hero_headline text,
  hero_subheadline text,
  hero_image_url text,
  icon text,
  problem_description text,
  recovery_process text,
  success_rate text,
  stats jsonb default '{}'::jsonb,
  seo_title text,
  seo_description text,
  og_image_url text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.services enable row level security;
create trigger services_touch before update on public.services for each row execute function public.touch_updated_at();

-- Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  location text,
  photo_url text,
  rating int not null default 5 check (rating between 1 and 5),
  quote text not null,
  amount_recovered text,
  scam_type text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
create trigger testimonials_touch before update on public.testimonials for each row execute function public.touch_updated_at();

-- FAQs
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'general',
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
create trigger faqs_touch before update on public.faqs for each row execute function public.touch_updated_at();

-- Media library
create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  filename text not null,
  alt_text text,
  mime_type text,
  size_bytes int,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.media enable row level security;

-- As seen in logos
create table public.as_seen_in (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  link_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.as_seen_in enable row level security;

-- Leads (form submissions)
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text not null,
  phone text,
  amount_lost text,
  scam_type text,
  message text,
  source_page text,
  status text not null default 'new' check (status in ('new','contacted','in_progress','closed','spam')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leads enable row level security;
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();

-- ============== RLS POLICIES ==============

-- user_roles
create policy "users can view their own role" on public.user_roles for select using (auth.uid() = user_id);
create policy "admins can view all roles" on public.user_roles for select using (public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- site_settings: public read, staff write
create policy "anyone can read site settings" on public.site_settings for select using (true);
create policy "staff can update site settings" on public.site_settings for update using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff can insert site settings" on public.site_settings for insert with check (public.is_staff(auth.uid()));

-- pages
create policy "anyone reads published pages" on public.pages for select using (is_published or public.is_staff(auth.uid()));
create policy "staff manage pages" on public.pages for all using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- services
create policy "anyone reads published services" on public.services for select using (is_published or public.is_staff(auth.uid()));
create policy "staff manage services" on public.services for all using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- testimonials
create policy "anyone reads published testimonials" on public.testimonials for select using (is_published or public.is_staff(auth.uid()));
create policy "staff manage testimonials" on public.testimonials for all using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- faqs
create policy "anyone reads published faqs" on public.faqs for select using (is_published or public.is_staff(auth.uid()));
create policy "staff manage faqs" on public.faqs for all using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- media
create policy "anyone reads media" on public.media for select using (true);
create policy "staff manage media" on public.media for all using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- as_seen_in
create policy "anyone reads as_seen_in" on public.as_seen_in for select using (is_published or public.is_staff(auth.uid()));
create policy "staff manage as_seen_in" on public.as_seen_in for all using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- leads: anonymous can insert, only staff can read/update
create policy "anyone can submit leads" on public.leads for insert with check (true);
create policy "staff can view leads" on public.leads for select using (public.is_staff(auth.uid()));
create policy "staff can update leads" on public.leads for update using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "admins can delete leads" on public.leads for delete using (public.has_role(auth.uid(),'admin'));

-- Storage bucket for media
insert into storage.buckets (id, name, public) values ('media','media', true) on conflict do nothing;

create policy "anyone can read media bucket" on storage.objects for select using (bucket_id = 'media');
create policy "staff can upload media" on storage.objects for insert with check (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff can update media" on storage.objects for update using (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff can delete media" on storage.objects for delete using (bucket_id = 'media' and public.is_staff(auth.uid()));
