import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

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

export const fetchSiteSettings = createServerFn()
  .handler(async (): Promise<SiteSettings | null> => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("chanaid_config")
      .select("*")
      .eq("id", 1)
      .single();
    
    if (error || !data) return null;
    
    // Supabase returns snake_case natively — matches our SiteSettings type directly
    return {
      site_name: data.site_name || "ChanAidRecovery",
      tagline: data.tagline || null,
      logo_url: data.logo_url || null,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      contact_address: data.contact_address || null,
      whatsapp_number: data.whatsapp_number || null,
      telegram_username: data.telegram_username || null,
      facebook_url: data.facebook_url || null,
      twitter_url: data.twitter_url || null,
      linkedin_url: data.linkedin_url || null,
      instagram_url: data.instagram_url || null,
      youtube_url: data.youtube_url || null,
      hero_headline: data.hero_headline || null,
      hero_subheadline: data.hero_subheadline || null,
      hero_cta_primary: data.hero_cta_primary || null,
      hero_cta_secondary: data.hero_cta_secondary || null,
      stats_recovered: data.stats_recovered || null,
      stats_cases: data.stats_cases || null,
      stats_success: data.stats_success || null,
      footer_text: data.footer_text || null,
      default_seo_title: data.default_seo_title || null,
      default_seo_description: data.default_seo_description || null,
      og_image_url: data.og_image_url || null,
      google_analytics_id: data.google_analytics_id || null,
      primary_color: data.primary_color || null,
      accent_color: data.accent_color || null,
    } as SiteSettings;
  });

export const saveSiteSettings = createServerFn()
  .inputValidator((settings: Partial<SiteSettings>) => settings)
  .handler(async ({ data: settings, request }): Promise<boolean> => {
    await requireAdmin(request);
    const sb = getSupabaseAdmin();
    
    // Supabase columns are already snake_case — same as our SiteSettings type
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    
    // Copy all non-undefined settings directly (keys already match column names)
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        updatePayload[key] = value;
      }
    }
    
    const { error } = await sb
      .from("chanaid_config")
      .update(updatePayload)
      .eq("id", 1);
      
    if (error) {
      console.error("saveSiteSettings error:", error);
      return false;
    }
    return true;
  });

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
