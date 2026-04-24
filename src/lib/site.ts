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
  default_seo_title: string | null;
  default_seo_description: string | null;
  og_image_url: string | null;
  geo_country: string | null;
  geo_region: string | null;
  google_analytics_id: string | null;
  footer_text: string | null;
};

export const SITE_URL = "https://chanaidrecovery.com";

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings) ?? null;
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
      areaServed: s?.geo_region ?? "Worldwide",
    },
    sameAs: [s?.facebook_url, s?.twitter_url, s?.linkedin_url, s?.instagram_url, s?.youtube_url].filter(Boolean),
  };
}