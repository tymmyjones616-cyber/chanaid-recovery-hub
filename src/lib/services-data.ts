export interface ServiceData {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  icon: string;
  problem_description: string;
  recovery_process: string;
  hero_headline: string;
  hero_subheadline: string;
  success_rate: string;
  is_published: boolean;
  sort_order: number;
}

export const SERVICES_DATA: ServiceData[] = [
  {
    name: 'Cryptocurrency Forensics',
    slug: 'cryptocurrency',
    short_description: 'Advanced blockchain forensics and node-level tracing to identify the ultimate destination of stolen digital assets.',
    icon: 'Bitcoin',
    problem_description: 'Scammers utilize complex obfuscation layers, including peeling chains and decentralized mixers, to hide the trail of stolen crypto. Without professional forensics, these assets appear lost forever.',
    recovery_process: 'Our investigators use industry-standard blockchain intelligence tools to de-anonymize transactions. We follow the flow of funds to off-ramp exchanges and coordinate with legal counsel to issue international freezing orders, securing the assets for recovery.',
    hero_headline: 'Forensic Investigation of Stolen Digital Assets',
    hero_subheadline: 'We map the movement of stolen funds across the blockchain, providing actionable intelligence for global law enforcement and legal teams.',
    success_rate: '94%',
    is_published: true,
    sort_order: 1
  },
  {
    name: 'Pig Butchering Investigation',
    slug: 'pig-butchering',
    short_description: 'De-anonymizing the syndicates behind long-term investment grooming and Sha Zhu Pan schemes.',
    icon: 'ShieldIcon',
    problem_description: 'Pig butchering scams are organized criminal operations involving psychological grooming and fake trading platforms. Victims are systematically drained of their life savings through manufactured trust.',
    recovery_process: 'We identify the technical infrastructure and ultimate beneficiaries of the scam syndicate. By mapping the network of shell companies and money-mules, we provide the evidence required for international asset seizure and repatriation.',
    hero_headline: 'Expert Recovery for Pig Butchering Victims',
    hero_subheadline: 'Don\'t let organized crime keep your wealth. We track the high-level syndicates behind sophisticated investment grooming fraud.',
    success_rate: '89%',
    is_published: true,
    sort_order: 2
  },
  {
    name: 'Romance Scam Asset Tracing',
    slug: 'romance-scams',
    short_description: 'Financial forensic investigation for victims of international romance fraud and digital manipulation.',
    icon: 'Heart',
    problem_description: 'Romance scammers exploit emotional vulnerability to solicit funds for manufactured emergencies. These funds are often moved through international wire corridors and crypto off-ramps.',
    recovery_process: 'We conduct deep-web forensic tracing to reveal the true identities of perpetrators. By tracking international transfers and gift card redemptions, we provide the necessary documentation for cross-border legal action.',
    hero_headline: 'Professional Recovery for Romance Fraud',
    hero_subheadline: 'Financial exploitation is a crime. We uncover the identities and track the funds lost to international romance scammers.',
    success_rate: '82%',
    is_published: true,
    sort_order: 3
  },
  {
    name: 'Forex Broker Arbitration',
    slug: 'forex',
    short_description: 'Legal arbitration and capital reclamation from unregulated and fraudulent forex trading platforms.',
    icon: 'DollarSign',
    problem_description: 'Fraudulent brokers use White Label platforms to simulate trading while pocketing deposits. They often employ "expert" advisors to manufacture losses and deny withdrawal requests.',
    recovery_process: 'Our legal experts specialize in Jurisdictional Arbitration. We identify the corporate entities behind the trading platforms and leverage financial ombudsman services to force reversals and secure refunds from facilitating banks.',
    hero_headline: 'Reclaim Capital from Rogue Forex Brokers',
    hero_subheadline: 'Unregulated platforms are bound by international financial laws. We use legal arbitration to secure the return of your investments.',
    success_rate: '91%',
    is_published: true,
    sort_order: 4
  },
  {
    name: 'Binary Options Remediation',
    slug: 'binary-options',
    short_description: 'Forensic reclamation of funds from manipulative and offshore binary options entities.',
    icon: 'TrendingUp',
    problem_description: 'Binary options fraud involves manipulated software designed to ensure retail losses. Most entities operate from non-extradition jurisdictions to evade regulatory oversight.',
    recovery_process: 'We utilize global chargeback protocols and AML pressure on payment processors. By identifying the facilitators of the fraud, we can force the return of the original principal to our clients.',
    hero_headline: 'Refund Your Binary Options Principal',
    hero_subheadline: 'Deceptive trading software is a violation of consumer rights. We use international banking dispute mechanisms to reclaim your funds.',
    success_rate: '88%',
    is_published: true,
    sort_order: 5
  },
  {
    name: 'Investment Fraud Recovery',
    slug: 'investment-fraud',
    short_description: 'Tracing losses from Ponzi schemes, fake hedge funds, and fraudulent high-yield investment programs.',
    icon: 'Landmark',
    problem_description: 'High-yield investment programs (HYIPs) rely on a constant influx of new capital to simulate returns until the eventual collapse, leaving victims with total principal loss.',
    recovery_process: 'We perform corporate audits to reveal the ultimate beneficiaries and hidden assets of the scheme. Working with financial regulators, we facilitate the freezing of assets for equitable distribution to affected investors.',
    hero_headline: 'Reclaim Losses from Investment Schemes',
    hero_subheadline: 'From Ponzi structures to fraudulent hedge funds, we trace the masterminds and pursue the return of your capital.',
    success_rate: '85%',
    is_published: true,
    sort_order: 6
  },
  {
    name: 'Identity Theft Remediation',
    slug: 'phishing',
    short_description: 'Full identity restoration and financial remediation after credential compromise or phishing attacks.',
    icon: 'Fingerprint',
    problem_description: 'Phishing attacks can lead to full identity takeover, resulting in unauthorized loans, credit card debt, and a ruined financial reputation.',
    recovery_process: 'We coordinate with credit bureaus and financial institutions to halt fraudulent activity and remove unauthorized liabilities. Our team implements advanced forensic monitoring to secure your digital identity.',
    hero_headline: 'Secure Your Identity and Reclaim Your Finances',
    hero_subheadline: 'Digital theft requires a forensic response. We stop the identity takeover process and reverse fraudulent financial actions.',
    success_rate: '96%',
    is_published: true,
    sort_order: 7
  },
  {
    name: 'Tax Impersonation Support',
    slug: 'tax-fraud',
    short_description: 'Professional assistance for victims of international tax authority impersonation and refund fraud.',
    icon: 'FileIcon',
    problem_description: 'Scammers impersonate official tax agencies to coerce immediate payments or steal tax refunds through high-pressure social engineering.',
    recovery_process: 'We work with national tax agencies to report the fraud and secure your legitimate refunds. Our team provides the forensic proof required to clear your record and protect your sensitive tax identification numbers.',
    hero_headline: 'Expert Help for Tax Fraud Victims',
    hero_subheadline: 'Don\'t be intimidated by fraudulent threats. We help you secure your refunds and protect your standing with authorities.',
    success_rate: '93%',
    is_published: true,
    sort_order: 8
  },
  {
    name: 'Credit Card Fraud Forensic',
    slug: 'credit-card-fraud',
    short_description: 'Advanced dispute representment for unauthorized charges and complex card-not-present fraud.',
    icon: 'CreditCard',
    problem_description: 'Credit card fraud often involves sophisticated data breaches or deceptive billing traps that are difficult to resolve through standard banking channels.',
    recovery_process: 'We leverage PCI-DSS compliance standards and consumer protection law to force chargeback reversals. We provide the forensic evidence required by banks to prove that the transactions were unauthorized or fraudulent.',
    hero_headline: 'Reverse Unauthorized Credit Card Billing',
    hero_subheadline: 'We use legal and banking protocols to secure the return of your money from fraudulent merchants.',
    success_rate: '97%',
    is_published: true,
    sort_order: 9
  },
  {
    name: 'Tech Support Scam Recovery',
    slug: 'tech-support',
    short_description: 'Reclaiming funds from remote access scams, fake virus warnings, and support impersonation.',
    icon: 'Laptop',
    problem_description: 'Tech support scams involve remote access takeover to drain bank accounts. Scammers often pose as major tech companies to manufacture a sense of urgency.',
    recovery_process: 'We trace the call centers and payment gateways used by these syndicates. By identifying the merchant accounts, we can initiate KYC (Know Your Customer) failures and claw back the assets.',
    hero_headline: 'Refund Money from Tech Support Fraud',
    hero_subheadline: 'If you were victimized by a remote access scam, we can help you track the perpetrators and recover the lost funds.',
    success_rate: '90%',
    is_published: true,
    sort_order: 10
  }
];
