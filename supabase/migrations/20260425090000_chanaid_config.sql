-- Create chanaid_config table for site settings
CREATE TABLE IF NOT EXISTS public.chanaid_config (
    id BIGINT PRIMARY KEY DEFAULT 1,
    site_name TEXT DEFAULT 'ChanAidRecovery',
    support_email TEXT DEFAULT 'support@chanaidrecovery.com',
    whatsapp_number TEXT DEFAULT '+1 (940) 377-9359',
    telegram_handle TEXT DEFAULT '@ChanAidRecovery',
    is_maintenance_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default config if not exists
INSERT INTO public.chanaid_config (id, site_name, support_email, whatsapp_number, telegram_handle)
VALUES (1, 'ChanAidRecovery', 'support@chanaidrecovery.com', '+1 (940) 377-9359', '@ChanAidRecovery')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.chanaid_config ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access for chanaid_config" ON public.chanaid_config
    FOR SELECT USING (true);

-- Create policy for admin update access (you might want to restrict this further)
CREATE POLICY "Admin update access for chanaid_config" ON public.chanaid_config
    FOR UPDATE USING (auth.role() = 'authenticated');
