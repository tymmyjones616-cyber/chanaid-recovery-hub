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
    name: 'Cryptocurrency Recovery',
    slug: 'crypto-recovery',
    short_description: 'Military-grade blockchain forensics to track and reclaim stolen Bitcoin, Ethereum, and USDT from fraudulent exchanges.',
    icon: 'BlockchainForensics',
    hero_headline: 'Total Blockchain Dominance',
    hero_subheadline: 'Our forensic specialists pierce through mixers and obfuscated chains to reclaim your digital sovereignty.',
    success_rate: '98%',
    is_published: true,
    sort_order: 1,
    problem_description: 'Scammers use mixers and cross-chain hops to vanish. Standard investigators stop at the first hop.',
    recovery_process: 'We utilize private node-level data to unmask wallet clusters and coordinate with global law enforcement to freeze assets.'
  },
  {
    name: 'Forex & Broker Arbitration',
    slug: 'forex-scam-recovery',
    short_description: 'Forcing unregulated platforms into capital restitution through international banking pressure and legal ombudsman protocols.',
    icon: 'LegalScale',
    hero_headline: 'Capital Sovereignty Restored',
    hero_subheadline: 'Rogue brokers rely on your silence. We speak the language of international financial law to force their hand.',
    success_rate: '94%',
    is_published: true,
    sort_order: 2,
    problem_description: 'Unregulated brokers simulate trades to manufacture losses and block withdrawals.',
    recovery_process: 'We leverage financial ombudsman protocols and chargeback representment to force facilitating banks to reverse transfers.'
  },
  {
    name: 'Romance Fraud Remediation',
    slug: 'romance-scam-recovery',
    short_description: 'Advanced digital footprint analysis to identify and de-anonymize perpetrators of "Pig Butchering" and social engineering schemes.',
    icon: 'DigitalFingerprint',
    hero_headline: 'Truth from Deception',
    hero_subheadline: 'They exploited your trust; we exploit their digital footprint. Reclaim your pride and your assets.',
    success_rate: '87%',
    is_published: true,
    sort_order: 3,
    problem_description: 'Romance scams use psychological warfare to drain victims via complex mule networks.',
    recovery_process: 'We conduct full digital footprint analysis to find "human error" in the scammers setup, then apply legal pressure on receiving institutions.'
  },
  {
    name: 'Global Asset Tracing',
    slug: 'asset-tracing',
    short_description: 'Deep-web intelligence and multi-jurisdictional audits to locate hidden wealth and offshore holdings for high-stakes recovery.',
    icon: 'AssetTrace',
    hero_headline: 'Elite Asset Reclamation',
    hero_subheadline: 'Discretion, precision, and absolute dominance in international recovery. Reserved for high-stakes capital loss.',
    success_rate: '99%',
    is_published: true,
    sort_order: 4,
    problem_description: 'High-net-worth individuals are targets for bespoke investment scams involving fake hedge funds.',
    recovery_process: 'Our legal teams coordinate across borders to issue Anton Piller orders and secure assets globally before liquidation.'
  },
  // Fallbacks for the slugs the sitemap and main nav reference. These ensure
  // /services/<slug> renders content even when the D1 row is missing.
  {
    name: 'Crypto Scam Recovery',
    slug: 'crypto-scam-recovery',
    short_description: 'End-to-end forensic investigation and asset recovery for stolen Bitcoin, Ethereum, USDT, and altcoin theft.',
    icon: 'BlockchainForensics',
    hero_headline: 'Reclaim Stolen Crypto',
    hero_subheadline: 'Our blockchain analysts trace funds across mixers, bridges, and chains — then coordinate exchange freezes and law-enforcement referrals to put your assets back in your hands.',
    success_rate: '97%',
    is_published: true,
    sort_order: 5,
    problem_description: 'Crypto thieves rely on speed and obfuscation: they bounce stolen funds across mixers, swaps, and bridges in minutes. Most victims are told the trail is "untraceable" — that is rarely true.',
    recovery_process: 'We de-mix transactions using node-level cluster analysis, identify the off-ramp exchange, file freezing requests with the exchange and the relevant regulator, and produce a forensic report that banks and law enforcement accept as evidence.'
  },
  {
    name: 'Binary Options Recovery',
    slug: 'binary-options-recovery',
    short_description: 'Aggressive chargeback representment and regulatory action against unlicensed binary-options brokers.',
    icon: 'LegalScale',
    hero_headline: 'Stop the Binary Options Trap',
    hero_subheadline: 'Most binary platforms are designed to lose. We turn that against the platform — chargebacks, ombudsman filings, and bank-level pressure recover what was taken.',
    success_rate: '92%',
    is_published: true,
    sort_order: 6,
    problem_description: 'Binary-options platforms typically operate offshore with no real regulator. They credit fake "wins" to encourage deposits, then either freeze withdrawals or simulate losses.',
    recovery_process: 'We assemble a full evidence pack: deposit history, terms-of-service breaches, regulator status checks, and trade-anomaly analysis. That pack drives chargebacks at the card-issuer level and forces facilitating banks to reverse transfers.'
  },
  {
    name: 'Corporate Fraud Investigation',
    slug: 'corporate-fraud-investigation',
    short_description: 'Multi-jurisdictional investigation of corporate-level fraud: fake hedge funds, sham private placements, vendor fraud, and insider asset diversion.',
    icon: 'AssetTrace',
    hero_headline: 'Corporate-Grade Forensic Investigation',
    hero_subheadline: 'For high-stakes losses where a board, partnership, or family office has been targeted: deep-web intelligence, accounting forensics, and cross-border legal coordination.',
    success_rate: '95%',
    is_published: true,
    sort_order: 7,
    problem_description: 'Sophisticated corporate frauds use shell companies, nominee directors, and offshore structures to put assets out of reach.',
    recovery_process: 'We combine forensic accounting, OSINT, and counsel coordination across the relevant jurisdictions to map the corporate veil, identify recoverable assets, and apply for freezing or disclosure orders before assets are dissipated.'
  }
];
