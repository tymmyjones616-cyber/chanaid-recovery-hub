
-- Seed Services with rich content
INSERT INTO public.services (name, slug, short_description, icon, problem_description, recovery_process, is_published, sort_order)
VALUES 
(
  'Forensic Blockchain Analysis', 
  'cryptocurrency', 
  'Advanced tracking and tracing of stolen digital assets across multiple blockchains.', 
  'Bitcoin', 
  'Modern crypto thieves use sophisticated obfuscation techniques, including mixers and chain-hopping, to hide stolen funds. Victims often believe that once crypto leaves their wallet, it is lost forever.', 
  'Our forensic experts use military-grade blockchain analysis tools to de-anonymize transactions. We track funds to centralized exchange off-ramps and work with legal teams to serve international freezing orders, halting the laundering process in its tracks.', 
  true, 
  1
),
(
  'Pig Butchering Scam Recovery', 
  'pig-butchering', 
  'Specialized recovery for victims of long-term emotional and investment grooming scams.', 
  'Shield', 
  'Pig butchering (Sha Zhu Pan) scams involve months of psychological manipulation. Victims are "fattened up" through emotional bonds before being coerced into fake investment platforms that eventually disappear.', 
  'We combine psychological support with financial forensics. We map the network of shell companies used by the syndicate and leverage international AML (Anti-Money Laundering) regulations to track the ultimate beneficiaries and reclaim assets.', 
  true, 
  2
),
(
  'Binary Options Recovery', 
  'binary-options', 
  'Expert reclamation of funds from deceptive and unregulated binary options platforms.', 
  'TrendingUp', 
  'Binary options platforms often manipulate trading software to ensure retail investors lose their principal. Many operate from offshore jurisdictions to evade national regulators.', 
  'We utilize global chargeback mechanisms and regulatory pressure. By identifying the payment processors facilitating these fraudulent trades, we can force reversals and recover the original capital for our clients.', 
  true, 
  3
),
(
  'Forex Trading Scam Recovery', 
  'forex', 
  'Recovering capital from fraudulent forex brokers and account management schemes.', 
  'DollarSign', 
  'Fraudulent forex brokers lure investors with promises of 1:500 leverage and "risk-free" trades, only to deny withdrawals or manipulate market data to trigger artificial losses.', 
  'Our legal team specializes in Jurisdictional Arbitration. we track the entities behind the "white-label" platforms and use financial ombudsman services and civil litigation to secure refunds from the facilitating institutions.', 
  true, 
  4
),
(
  'Romance Scam Investigation', 
  'romance-scams', 
  'Professional and empathetic recovery for victims of international romance fraud.', 
  'Heart', 
  'Romance scammers build deep trust over time, creating fake emergencies to request funds. Victims are often left both emotionally devastated and financially ruined.', 
  'We conduct deep-web investigations to identify the real identities of the scammers. We track international wire transfers and gift card redemptions, providing actionable evidence for local and international law enforcement to pursue.', 
  true, 
  5
),
(
  'Property & Real Estate Fraud', 
  'property-scams', 
  'Reclaiming deposits and investments from fraudulent real estate and rental schemes.', 
  'Home', 
  'Real estate scams include fake listings, fraudulent title transfers, and deceptive "pre-construction" investment opportunities in foreign countries.', 
  'We verify property titles and corporate registrations globally. By coordinating with local authorities in the property jurisdiction, we halt fraudulent sales and freeze the accounts of the fake agencies.', 
  true, 
  6
),
(
  'Identity Theft & Phishing Recovery', 
  'credit-card-phishing', 
  'Comprehensive remediation after credit card or personal identity compromise.', 
  'CreditCard', 
  'Phishing attacks can lead to full identity takeover, resulting in unauthorized loans, credit card debt, and a ruined financial reputation.', 
  'We work directly with credit bureaus and financial institutions to freeze compromised accounts and remove fraudulent entries. We implement advanced identity monitoring to prevent future breaches.', 
  true, 
  7
),
(
  'Corporate & BEC Scam Recovery', 
  'other-scams', 
  'Specialized recovery for Business Email Compromise and corporate invoice fraud.', 
  'Mail', 
  'Corporate scams often involve "man-in-the-middle" attacks where scammers intercept invoices and redirect massive corporate payments to fraudulent accounts.', 
  'Speed is critical in BEC recovery. We work with the SWIFT network and banking security teams to initiate immediate recalls of fraudulent wire transfers, often stopping the funds before they reach the scammers'' final destination.', 
  true, 
  8
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  icon = EXCLUDED.icon,
  problem_description = EXCLUDED.problem_description,
  recovery_process = EXCLUDED.recovery_process,
  is_published = EXCLUDED.is_published,
  sort_order = EXCLUDED.sort_order;

-- Seed Blog Posts (Geo-optimized)
INSERT INTO public.blog_posts (title, slug, content, excerpt, is_published, category)
VALUES 
(
  'Recovering Crypto Assets in the USA: A Legal Guide', 
  'recovering-crypto-usa', 
  '<h1>Crypto Recovery in the United States</h1><p>The US regulatory landscape is evolving rapidly. Victims of crypto scams in the USA have access to the FBI IC3, the SEC, and the CFTC. This guide explains how to leverage US laws to reclaim your assets...</p>', 
  'A comprehensive guide on how US citizens can use local regulations to recover lost crypto funds.', 
  true, 
  'Recovery'
),
(
  'UK Financial Regulations: Reclaiming Scam Funds in Britain', 
  'uk-financial-recovery', 
  '<h1>Navigating the UK Recovery Process</h1><p>In the UK, the Financial Ombudsman Service (FOS) and the Contingent Reimbursement Model (CRM) code provide unique protections for bank transfer victims. Learn how to file a successful claim...</p>', 
  'Understanding the CRM code and how UK victims can recover funds from fraudulent bank transfers.', 
  true, 
  'Legal'
),
(
  'Australian Crypto Scams: How to Reclaim Your Wealth', 
  'australia-crypto-recovery', 
  '<h1>The Australian Recovery Landscape</h1><p>ASIC and the ACCC play critical roles in protecting Australian investors. If you have been targeted by a binary options or crypto scam in AU, here is your roadmap to recovery...</p>', 
  'How Australians can use ASIC regulations and local investigators to recover from financial fraud.', 
  true, 
  'Insights'
),
(
  'Canadian Investor Protection: Reclaiming Lost Assets', 
  'canada-investor-protection', 
  '<h1>Protecting Canadian Investors</h1><p>From the OSC in Ontario to global investigators, Canadian victims have several paths to recovery. We explore the legal framework for asset reclamation in Canada...</p>', 
  'A deep dive into Canadian investor protection laws and recovery strategies for scam victims.', 
  true, 
  'Recovery'
),
(
  'UAE Financial Fraud: Advanced Recovery Tactics in Dubai', 
  'uae-recovery-dubai', 
  '<h1>Asset Recovery in the UAE</h1><p>The UAE has strict laws against financial cybercrime. With the rise of crypto hubs in Dubai, recovery investigators are using specialized local channels to freeze fraudulent accounts...</p>', 
  'Specialized recovery strategies for victims within the United Arab Emirates and Dubai.', 
  true, 
  'Global'
),
(
  'Saudi Arabia: The Battle Against Modern Financial Scams', 
  'saudi-arabia-scam-recovery', 
  '<h1>Financial Recovery in Saudi Arabia</h1><p>As Saudi Arabia rapidly digitizes its economy under Vision 2030, online fraud has become a significant challenge. The Saudi Central Bank (SAMA) and the Capital Market Authority (CMA) have implemented strict protections...</p>', 
  'A guide for residents of Saudi Arabia on how to report and recover from digital financial fraud.', 
  true, 
  'Insights'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  is_published = EXCLUDED.is_published,
  category = EXCLUDED.category;
