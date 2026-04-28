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
  }
];
