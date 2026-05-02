-- ============================================================
-- ChanAidRecovery Hub — Production D1 Database Patch
-- Run with: npx wrangler d1 execute tanstack-start-db --remote --file=patch_prod.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. BLOG POSTS — unique featured images, diverse dates & authors
-- ─────────────────────────────────────────────────────────────

UPDATE blog_posts SET
  author = 'Marcus Thorne, Head of Forensics',
  created_at = '2026-03-10T09:15:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80'
WHERE slug = 'how-to-recover-stolen-bitcoin-2026';

UPDATE blog_posts SET
  author = 'Elena Rodriguez, Legal Counsel',
  created_at = '2026-03-14T14:22:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80'
WHERE slug = 'pig-butchering-psychology';

UPDATE blog_posts SET
  author = 'James Okafor, Blockchain Analyst',
  created_at = '2026-03-19T10:45:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'
WHERE slug = 'analysis-forex-broker-red-flags-a-legal-perspective';

UPDATE blog_posts SET
  author = 'Sarah Chen, Recovery Specialist',
  created_at = '2026-03-25T08:30:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80'
WHERE slug = 'analysis-nft-wash-trading-detecting-digital-fraud';

UPDATE blog_posts SET
  author = 'David Kowalski, Compliance Officer',
  created_at = '2026-04-02T13:10:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80'
WHERE slug = 'analysis-the-rise-of-ai-voice-scams-biometric-security';

UPDATE blog_posts SET
  author = 'Priya Patel, Cyber Fraud Investigator',
  created_at = '2026-04-07T11:05:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80'
WHERE slug = 'analysis-how-to-secure-your-metamask-institutional-grade';

UPDATE blog_posts SET
  author = 'Thomas Andersen, Senior Investigator',
  created_at = '2026-04-11T15:40:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80'
WHERE slug = 'analysis-chargeback-rights-2026-financial-justice';

UPDATE blog_posts SET
  author = 'Aisha Mohammed, Financial Crime Analyst',
  created_at = '2026-04-15T09:55:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80'
WHERE slug = 'analysis-corporate-email-compromise-defending-your-business';

UPDATE blog_posts SET
  author = 'Robert Kim, Digital Asset Specialist',
  created_at = '2026-04-19T12:20:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=800&q=80'
WHERE slug = 'analysis-dating-app-fraud-from-emotion-to-investigation';

UPDATE blog_posts SET
  author = 'Claire Beaumont, International Recovery Lead',
  created_at = '2026-04-23T10:00:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80'
WHERE slug = 'analysis-the-truth-about-hyip-deconstructing-the-pyramid';

UPDATE blog_posts SET
  author = 'Marcus Thorne, Head of Forensics',
  created_at = '2026-04-27T14:35:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1638913662252-70efce1e60a7?w=800&q=80'
WHERE slug = 'analysis-recovery-loans-your-bridge-to-financial-justice';

UPDATE blog_posts SET
  author = 'Elena Rodriguez, Legal Counsel',
  created_at = '2026-04-30T08:45:00.000Z',
  featured_image = 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80'
WHERE slug = 'analysis-telegram-scam-groups-exposed-and-neutralized';

-- ─────────────────────────────────────────────────────────────
-- 2. SERVICES — ensure icons match the premium SVG names
--    used by ServiceIcon.tsx (BlockchainForensics, LegalScale,
--    DigitalFingerprint, AssetTrace)
-- ─────────────────────────────────────────────────────────────

UPDATE services SET icon = 'BlockchainForensics' WHERE slug = 'crypto-recovery';
UPDATE services SET icon = 'BlockchainForensics' WHERE slug = 'crypto-scam-recovery';
UPDATE services SET icon = 'LegalScale'          WHERE slug = 'forex-scam-recovery';
UPDATE services SET icon = 'LegalScale'          WHERE slug = 'investment-fraud-recovery';
UPDATE services SET icon = 'DigitalFingerprint'  WHERE slug = 'romance-scam-recovery';
UPDATE services SET icon = 'DigitalFingerprint'  WHERE slug = 'pig-butchering-recovery';
UPDATE services SET icon = 'AssetTrace'          WHERE slug = 'asset-tracing';
UPDATE services SET icon = 'AssetTrace'          WHERE slug = 'global-asset-tracing';

-- Also update any services that might have generic icon names
-- so they show the premium SVGs on both home and service page.
UPDATE services SET icon = 'BlockchainForensics'
  WHERE icon IN ('Bitcoin','Coins','DatabaseZap','Wallet')
  AND slug LIKE '%crypto%';

UPDATE services SET icon = 'LegalScale'
  WHERE icon IN ('Scale','Gavel','Landmark')
  AND slug LIKE '%forex%';

-- ─────────────────────────────────────────────────────────────
-- 3. SITE SETTINGS — ensure row 1 exists with correct values
-- ─────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO site_settings (id) VALUES (1);

UPDATE site_settings SET
  site_name      = 'ChanAidRecovery Hub',
  tagline        = 'Expert Asset & Funds Recovery from Online Scams',
  contact_email  = 'support@chanaidrecovery.com',
  whatsapp_number = '+1 (940) 377-9359',
  telegram_username = 'ChanAidRecovery',
  default_seo_title = 'ChanAidRecovery Hub — Professional Crypto & Funds Recovery',
  default_seo_description = 'Recover stolen crypto, forex, and investment funds. ChanAidRecovery Hub provides professional forensic investigation and legal recovery services worldwide.'
WHERE id = 1;
