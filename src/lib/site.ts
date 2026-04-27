import { createServerFn } from "@tanstack/react-start";
import { createDb } from "@/db";
import { chanaidConfig } from "@/db/schema";
import { eq } from "drizzle-orm";

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



let localDb: any = null;

function getDb() {
  const d1 = (globalThis as any).DB;

  if (d1) {
    return createDb(d1);
  }

  // Local fallback
  if (process.env.NODE_ENV === "development") {
    if (!localDb) {
      console.log("getDb: D1 not found, falling back to local SQLite (local.db)");
      try {
        const Database = (0, eval)('require')("better-sqlite3");
        const sqlite = new Database("local.db");
        localDb = createDb(undefined, sqlite);
      } catch (err) {
        console.error("getDb: Failed to initialize local SQLite:", err);
        throw new Error("D1 Database binding 'DB' not found and local fallback failed.");
      }
    }
    return localDb;
  }
  
  console.error("getDb: D1 Database binding 'DB' not found.");
  throw new Error("D1 Database binding 'DB' not found.");
}

export const fetchSiteSettings = createServerFn()
  .handler(async (): Promise<SiteSettings | null> => {
    const db = getDb();
    const result = await db.select().from(chanaidConfig).where(eq(chanaidConfig.id, 1)).get();
    
    if (!result) return null;
    
    // Mapping from Drizzle/SQLite schema (camelCase usually) to the expected SiteSettings type
    // Since we used camelCase in schema but the original was snake_case, I'll return as expected by UI.
    return {
      site_name: result.siteName || "ChanAidRecovery",
      tagline: result.tagline || null,
      logo_url: result.logoUrl || null,
      contact_email: result.supportEmail || null,
      contact_phone: result.contactPhone || null,
      contact_address: result.contactAddress || null,
      whatsapp_number: result.whatsappNumber || null,
      telegram_username: result.telegramHandle || null,
      facebook_url: result.facebookUrl || null,
      twitter_url: result.twitterUrl || null,
      linkedin_url: result.linkedinUrl || null,
      instagram_url: result.instagramUrl || null,
      youtube_url: result.youtubeUrl || null,
      hero_headline: result.heroHeadline || null,
      hero_subheadline: result.heroSubheadline || null,
      hero_cta_primary: result.heroCtaPrimary || null,
      hero_cta_secondary: result.heroCtaSecondary || null,
      stats_recovered: result.statsRecovered || null,
      stats_cases: result.statsCases || null,
      stats_success: result.statsSuccess || null,
      footer_text: result.footerText || null,
      default_seo_title: result.defaultSeoTitle || null,
      default_seo_description: result.defaultSeoDescription || null,
      og_image_url: result.ogImageUrl || null,
      google_analytics_id: result.googleAnalyticsId || null,
      primary_color: result.primaryColor || null,
      accent_color: result.accentColor || null,
    } as SiteSettings;
  });

export const saveSiteSettings = createServerFn()
  .inputValidator((settings: Partial<SiteSettings>) => settings)
  .handler(async ({ data: settings }): Promise<boolean> => {
    const db = getDb();
    
    // Map from snake_case settings to camelCase schema
    const updatePayload: any = {
      updatedAt: new Date().toISOString(),
    };
    
    if (settings.site_name) updatePayload.siteName = settings.site_name;
    if (settings.tagline) updatePayload.tagline = settings.tagline;
    if (settings.logo_url) updatePayload.logoUrl = settings.logo_url;
    if (settings.contact_email) updatePayload.supportEmail = settings.contact_email;
    if (settings.whatsapp_number) updatePayload.whatsappNumber = settings.whatsapp_number;
    if (settings.telegram_username) updatePayload.telegramHandle = settings.telegram_username;
    // ... add more mappings as needed
    
    const result = await db.update(chanaidConfig)
      .set(updatePayload)
      .where(eq(chanaidConfig.id, 1))
      .returning();
      
    return result.length > 0;
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
