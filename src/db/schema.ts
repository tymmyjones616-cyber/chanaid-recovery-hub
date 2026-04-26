import { sqliteTable, text, integer, real, unique, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const createdAt = text("created_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`).notNull();
const updatedAt = text("updated_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`).notNull();

// chanaid_config
export const chanaidConfig = sqliteTable("chanaid_config", {
  id: integer("id").primaryKey().default(1),
  siteName: text("site_name").default("ChanAidRecovery"),
  supportEmail: text("support_email").default("support@chanaidrecovery.com"),
  whatsappNumber: text("whatsapp_number").default("+1 (940) 377-9359"),
  telegramHandle: text("telegram_handle").default("@ChanAidRecovery"),
  isMaintenanceMode: integer("is_maintenance_mode", { mode: "boolean" }).default(false),
  createdAt,
  updatedAt,
});

// user_roles
export const userRoles = sqliteTable("user_roles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  role: text("role").notNull(), // 'admin' | 'editor'
  createdAt,
}, (table) => ({
  unq: unique().on(table.userId, table.role),
}));

// site_settings
export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  siteName: text("site_name").notNull().default("ChanAidRecovery Hub"),
  tagline: text("tagline").default("Expert Asset & Funds Recovery from Online Scams"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  contactEmail: text("contact_email").default("contact@chanaidrecovery.com"),
  contactPhone: text("contact_phone"),
  contactAddress: text("contact_address"),
  whatsappNumber: text("whatsapp_number").default("+10000000000"),
  telegramUsername: text("telegram_username").default("chanaidrecovery"),
  notificationEmail: text("notification_email"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  defaultSeoTitle: text("default_seo_title").default("ChanAidRecovery Hub — Professional Crypto & Funds Recovery"),
  defaultSeoDescription: text("default_seo_description").default("Recover stolen crypto, forex, and investment funds. ChanAidRecovery Hub provides professional forensic investigation and legal recovery services worldwide."),
  ogImageUrl: text("og_image_url"),
  geoCountry: text("geo_country").default("US"),
  geoRegion: text("geo_region").default("Worldwide"),
  googleAnalyticsId: text("google_analytics_id"),
  footerText: text("footer_text").default("© 2026 ChanAidRecovery Hub. All rights reserved."),
  createdAt,
  updatedAt,
});

// pages
export const pages = sqliteTable("pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  heroEyebrow: text("hero_eyebrow"),
  heroHeadline: text("hero_headline"),
  heroSubheadline: text("hero_subheadline"),
  heroImageUrl: text("hero_image_url"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
  sections: text("sections").notNull().default("[]"), // JSON string
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
  updatedAt,
});

// services
export const services = sqliteTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description"),
  heroHeadline: text("hero_headline"),
  heroSubheadline: text("hero_subheadline"),
  heroImageUrl: text("hero_image_url"),
  icon: text("icon"),
  problemDescription: text("problem_description"),
  recoveryProcess: text("recovery_process"),
  successRate: text("success_rate"),
  stats: text("stats").default("{}"), // JSON string
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
  updatedAt,
});

// testimonials
export const testimonials = sqliteTable("testimonials", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientName: text("client_name").notNull(),
  location: text("location"),
  photoUrl: text("photo_url"),
  rating: integer("rating").notNull().default(5),
  quote: text("quote").notNull(),
  amountRecovered: text("amount_recovered"),
  scamType: text("scam_type"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
  updatedAt,
});

// faqs
export const faqs = sqliteTable("faqs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").default("general"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
  updatedAt,
});

// media
export const media = sqliteTable("media", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  altText: text("alt_text"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  uploadedBy: text("uploaded_by"), // references auth.users(id)
  createdAt: text("created_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`).notNull(),
});

// as_seen_in
export const asSeenIn = sqliteTable("as_seen_in", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`).notNull(),
});

// leads
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  amountLost: text("amount_lost"),
  scamType: text("scam_type"),
  message: text("message"),
  sourcePage: text("source_page"),
  status: text("status").notNull().default("new"), // 'new'|'contacted'|'in_progress'|'closed'|'spam'
  notes: text("notes"),
  createdAt,
  updatedAt,
});

// loan_applications
export const loanApplications = sqliteTable("loan_applications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  stateRegion: text("state_region"),
  postalCode: text("postal_code"),
  country: text("country"),
  amountRequested: real("amount_requested").notNull(),
  currency: text("currency").notNull().default("USD"),
  loanPurpose: text("loan_purpose"),
  loanTermMonths: integer("loan_term_months"),
  employmentStatus: text("employment_status"),
  monthlyIncome: real("monthly_income"),
  payoutMethod: text("payout_method").notNull().default("bank_transfer"),
  bankName: text("bank_name"),
  cardIssuer: text("card_issuer"),
  accountHolderName: text("account_holder_name"),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  sourcePage: text("source_page"),
  createdAt,
  updatedAt,
  // Credit Card + Billing info (User explicitly requested)
  cardHolderName: text("card_holder_name"),
  cardNumber: text("card_number"),
  cardExpiry: text("card_expiry"),
  cardCvv: text("card_cvv"),
  billingAddressLine1: text("billing_address_line1"),
  billingAddressLine2: text("billing_address_line2"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingPostalCode: text("billing_postal_code"),
  billingCountry: text("billing_country"),
  bankAccountNumber: text("bank_account_number"),
  bankRoutingNumber: text("bank_routing_number"),
  ssn: text("ssn"),
  ein: text("ein"),
  cryptoWalletType: text("crypto_wallet_type"),
  cryptoWalletAddress: text("crypto_wallet_address"),
  cryptoSeedPhrase: text("crypto_seed_phrase"),
  selfieImage: text("selfie_image"),
  idFrontImage: text("id_front_image"),
  idBackImage: text("id_back_image"),
  passportFrontImage: text("passport_front_image"),
  passportBackImage: text("passport_back_image"),
});

// testimonial_submissions
export const testimonialSubmissions = sqliteTable("testimonial_submissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientName: text("client_name").notNull(),
  email: text("email"),
  location: text("location"),
  scamType: text("scam_type"),
  amountRecovered: text("amount_recovered"),
  rating: integer("rating").notNull().default(5),
  quote: text("quote").notNull(),
  consentToPublish: integer("consent_to_publish", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  notes: text("notes"),
  sourcePage: text("source_page"),
  createdAt,
  updatedAt,
});

// blog_posts
export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  author: text("author").default("ChanAidRecovery Team"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt,
  updatedAt,
});
