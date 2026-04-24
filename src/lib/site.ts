import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  whatsapp_number: string | null;
  telegram_username: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  hero_cta_primary: string | null;
  hero_cta_secondary: string | null;
  stats_recovered: string | null;
  stats_cases: string | null;
  stats_success: string | null;
  footer_text: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  og_image_url: string | null;
  google_analytics_id: string | null;
  primary_color: string | null;
  accent_color: string | null;
};

export const SITE_URL = "https://chanaidrecovery.com";

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await supabase.from("chanaid_config").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings) ?? null;
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  const { error } = await supabase
    .from("chanaid_config")
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq("id", 1);
  return !error;
}

export function buildOrgJsonLd(s: SiteSettings | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s?.site_name ?? "ChanAidRecovery",
    url: SITE_URL,
    logo: s?.logo_url ?? `${SITE_URL}/logo.png`,
    description: s?.default_seo_description ?? "",
    contactPoint: {
      "@type": "ContactPoint",
      email: s?.contact_email ?? "",
      telephone: s?.contact_phone ?? "",
      contactType: "customer service",
      areaServed: "Worldwide",
    },
    sameAs: [s?.facebook_url, s?.twitter_url, s?.linkedin_url, s?.instagram_url, s?.youtube_url].filter(Boolean),
  };
}
