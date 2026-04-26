-- Align chanaid_config with SiteSettings type in src/lib/site.ts
DROP TABLE IF EXISTS public.chanaid_config CASCADE;

CREATE TABLE public.chanaid_config (
    id BIGINT PRIMARY KEY DEFAULT 1,
    site_name TEXT DEFAULT 'ChanAidRecovery',
    tagline TEXT,
    logo_url TEXT,
    contact_email TEXT DEFAULT 'support@chanaidrecovery.com',
    contact_phone TEXT,
    contact_address TEXT,
    whatsapp_number TEXT DEFAULT '+1 (940) 377-9359',
    telegram_username TEXT DEFAULT '@ChanAidRecovery',
    facebook_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    hero_headline TEXT DEFAULT 'Recovering Your Assets, Restoring Your Future',
    hero_subheadline TEXT DEFAULT 'Leading recovery experts specializing in cryptocurrency, romance scams, and financial fraud.',
    hero_cta_primary TEXT DEFAULT 'Start Recovery',
    hero_cta_secondary TEXT DEFAULT 'Success Calculator',
    stats_recovered TEXT DEFAULT '$500M+',
    stats_cases TEXT DEFAULT '12,500+',
    stats_success TEXT DEFAULT '98%',
    footer_text TEXT DEFAULT '© 2024 ChanAid Recovery. Professional Fund Recovery Services.',
    default_seo_title TEXT DEFAULT 'ChanAid Recovery | Global Fund Recovery Experts',
    default_seo_description TEXT DEFAULT 'Specialized in recovering lost funds from cryptocurrency scams, romance scams, and investment fraud.',
    og_image_url TEXT,
    google_analytics_id TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    accent_color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT only_one_row CHECK (id = 1)
);

-- Insert initial row
INSERT INTO public.chanaid_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.chanaid_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for chanaid_config" ON public.chanaid_config FOR SELECT USING (true);
CREATE POLICY "Admin update access for chanaid_config" ON public.chanaid_config FOR UPDATE USING (auth.role() = 'authenticated');
