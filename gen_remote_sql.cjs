/**
 * gen_remote_sql.cjs
 * Generates seed_remote.sql for production Cloudflare D1.
 * Run: node gen_remote_sql.cjs
 * Deploy: npx wrangler d1 execute tanstack-start-db --file=seed_remote.sql --remote
 */
const fs = require('fs');
const { randomUUID } = require('crypto');

function esc(s) { return String(s).replace(/'/g, "''"); }

function makeAmount(i) {
  if (i % 10 === 0) return '$' + (Math.floor(Math.random() * 1900 + 500)) + 'k';
  if (i % 10 <= 3)  return '$' + (Math.floor(Math.random() * 380  + 120)) + 'k';
  return '$' + (Math.floor(Math.random() * 110 + 10)) + 'k';
}

// ─── Quotes ──────────────────────────────────────────────────────────────────
const cryptoQuotes = [
  "I lost $47,000 in USDT to a fake Binance clone. ChanAid's team traced the funds through three mixer hops and identified the recipient wallet within 36 hours. The exchange froze the assets and I had my money back in 25 days.",
  "After a Telegram group convinced me to deposit Bitcoin into a 'liquidity mining' platform that vanished overnight, I was ready to give up. ChanAid ran a full node-level analysis and traced my 1.4 BTC to a regulated exchange. Full recovery.",
  "My hardware wallet was compromised through a malicious firmware update. ChanAid's forensic specialists mapped the entire theft chain — every on-chain hop — and produced evidence that forced the receiving exchange to reverse the transfer.",
  "I transferred $120,000 in ETH to what I thought was an Ethereum staking protocol. ChanAid identified it as a smart-contract honeypot, traced the developer's wallet to a KYC'd account, and coordinated with Interpol's cybercrime unit.",
  "The scammers ran my USDT through five different wallets before cashing out. Everyone else told me it was impossible to trace. ChanAid's Deep-Trace technology followed every hop and pinpointed the cash-out in Singapore. $73,000 recovered.",
  "I was duped by a fake MetaMask support agent who drained my wallet. ChanAid provided a certified blockchain forensic report in 48 hours, which my bank accepted as evidence for a chargeback on the initial fiat deposit.",
  "My 0.9 BTC — savings from three years of work — vanished into a 'yield farm' that was never audited. ChanAid didn't just recover the funds; they identified the team behind the rug-pull and issued legal notices in two jurisdictions.",
  "The level of technical detail in ChanAid's forensic report stunned both my solicitor and the Financial Conduct Authority. They traced the stolen ETH through a cross-chain bridge to Polygon and back. I never expected that level of sophistication.",
  "I was a victim of a 'withdrawal fee' scam — kept paying fees to unlock withdrawals that never came. ChanAid reverse-engineered the smart contract, proved it was fraudulent on-chain, and helped my card issuer reverse every fiat deposit.",
  "ChanAid recovered $91,000 of my $95,000 in stolen USDT TRC-20. The four percent not recovered was already liquidated before they could intervene. They were transparent about that from the start, which I deeply respected.",
  "After six months of silence from the platform that stole my crypto, ChanAid filed coordinated complaints with four regulators in under a week. The funds were frozen the next day. I am forever grateful for their speed.",
  "My Coinbase account was accessed via SIM-swap and $62,000 in Bitcoin was transferred out. ChanAid identified the receiving wallet, linked it to a Kraken account, and worked with law enforcement to seize the funds.",
  "I was sold a fake 'institutional arbitrage bot' that drained my wallet incrementally. ChanAid's investigators exposed the entire operation, including the identities of three individuals operating the scheme across Dubai and Cyprus.",
  "The platform showed me fabricated profits for two months to encourage larger deposits. When I tried to withdraw $200,000, it disappeared. ChanAid obtained a freezing order within 72 hours and $178,000 was secured.",
  "I never thought blockchain forensics was a real service until ChanAid produced a 47-page report detailing every transaction, every wallet cluster, and every off-ramp used to steal my $55,000. My bank was stunned.",
  "ChanAid didn't just recover my funds — they educated me on exactly how the scam worked, so I could share that knowledge to protect my community. Professional, thorough, and genuinely caring about victims.",
  "The scammers tried to disguise my $38,000 in USDT as hundreds of micro-transactions. ChanAid's clustering algorithm re-assembled them into a single identifiable wallet. What I thought was lost is now back in my account.",
  "I lost 2.1 ETH in a fake NFT mint. ChanAid's team traced it to an OpenSea hot wallet, identified the wallet owner through on-chain activity patterns, and submitted a formal report to law enforcement in three countries.",
  "Their 24/7 emergency response team froze a transit wallet before the scammers could liquidate my $84,000. Timing is everything in blockchain recovery, and ChanAid understands that better than anyone.",
  "I was a target of a coordinated Discord phishing attack. ChanAid identified nine other victims from the same attacker, aggregated all cases into a single enforcement action, and maximised our collective recovery rate.",
  "My pension savings in crypto — $210,000 — were stolen through a compromised exchange API key. ChanAid traced the full movement graph and coordinated a cross-border asset freeze in under four business days.",
  "The recovery process was transparent at every stage. ChanAid gave me a live case portal where I could track exactly what was happening with my case. $67,000 recovered. The process restored my faith in digital finance."
];

const forexQuotes = [
  "My 'licensed' forex broker refused to process my $48,000 withdrawal for four months, citing endless 'tax verification' requirements. ChanAid's legal team sent a single formal notice and my funds were released within 10 days.",
  "I deposited $75,000 with a broker regulated on paper by an offshore authority with no enforcement power. ChanAid exposed the regulatory sham, triggered a chargeback on my credit card payments, and recovered $61,000.",
  "The broker froze my account the moment I reached a profitable balance of $92,000. ChanAid's arbitration team filed with the Financial Ombudsman Service and had the account unlocked with full withdrawal rights inside three weeks.",
  "After an unregulated forex platform showed me $150,000 in 'profits' that I could never withdraw, ChanAid produced a forensic trading analysis proving the trades were fabricated. My bank reversed the entire initial deposit.",
  "I was told I owed $18,000 in 'capital gains tax' before I could withdraw my balance. ChanAid identified this as a classic advance-fee fraud and had my credit card provider initiate a dispute that recovered $43,000.",
  "ChanAid's forensic audit of my trading history proved beyond doubt that my account manager had executed trades against my instructions to manufacture losses. The broker settled out of court for $67,000.",
  "The platform kept moving my withdrawal requests through endless compliance departments. ChanAid's legal counsel sent a formal letter before action citing three specific FCA violations. My withdrawal was processed the next morning.",
  "I lost $110,000 to a broker whose website looked completely legitimate and had dozens of fake positive reviews. ChanAid tracked the company's corporate structure to a shell entity in the Marshall Islands and secured a full chargeback.",
  "They promised a 12% monthly return on a managed forex account. When the returns stopped and my balance was 'lost in volatility', ChanAid proved the account was never connected to real markets. $59,000 returned.",
  "My account manager convinced me to increase my position just before a 'correction' wiped out my balance. ChanAid's trading analysis exposed coordinated stop-loss hunting by the broker's own dealing desk.",
  "I made the mistake of wiring funds internationally. ChanAid coordinated with correspondent banks across three countries to trace and freeze the recipient account before the scammers could withdraw. $88,000 secured.",
  "The fake broker used a spoofed UK Companies House registration to appear legitimate. ChanAid's due-diligence team spotted the forgery, reported it to Action Fraud, and my bank initiated a recovery under the FCA's consumer duty.",
  "After 18 months of stonewalling from my broker, ChanAid escalated my case to the European Securities and Markets Authority. Regulatory pressure forced the broker's payment processor to reverse the transactions.",
  "My retirement portfolio of $195,000 was locked in a forex account I could never access. ChanAid's legal team obtained a Norwich Pharmacal Order to compel the payment processor to reveal account details. Full recovery.",
  "I deposited in instalments over six months, trusting the consistent small 'withdrawals' they allowed. ChanAid recognised this as a confidence-building tactic and had all 23 card transactions reversed in a single dispute batch.",
  "The broker claimed to be regulated in Australia. ChanAid confirmed they were on ASIC's investor alert list and used that evidence to trigger a Consumer Protection Notice, resulting in a full refund of $54,000.",
  "ChanAid's chargeback representment service is world-class. They built an 80-page evidence file that countered the broker's rebuttal point-by-point. My card issuer ruled in my favour and returned $37,000.",
  "The platform manipulated my trading charts in real time to show artificial losses. ChanAid obtained third-party market data and proved the discrepancy, which formed the basis of a successful civil claim.",
  "Their knowledge of the SWIFT banking system allowed ChanAid to identify intermediary banks involved in laundering my deposit. Three banks cooperated in reversing the transfer. Extraordinary expertise.",
  "I fell for a 'copy-trading' scheme where the expert trader was a bot generating losses. ChanAid's analysis of the trade history proved it was algorithmically designed to lose. I recovered $42,000 from my card payments.",
  "ChanAid's representative attended my bank's dispute hearing on my behalf and presented the forensic evidence in person. The outcome was never in doubt after that. $81,000 returned in full.",
  "The broker's terms and conditions contained a hidden 'profit-share' clause that gave them rights to 40% of all gains. ChanAid's legal team challenged this under consumer contract regulations and voided the clause entirely."
];

const romanceQuotes = [
  "I spent eight months in an online relationship before discovering it was a 'Pig Butchering' operation. ChanAid traced every crypto transfer I had made and identified the call-centre operation in South-East Asia. $134,000 recovered.",
  "The person I met on Instagram was a professional social engineer. They built my trust over four months before introducing a 'family investment'. ChanAid de-anonymised the operation and submitted evidence to the FBI's IC3 unit.",
  "ChanAid's digital footprint analysis found inconsistencies the police had completely missed. The profile photos were AI-generated, the phone number traced to a VoIP cluster in Myanmar, and the wallet to a known pig-butchering syndicate.",
  "I am not ashamed to admit I was manipulated by professionals. ChanAid treated me with dignity throughout the recovery process and recovered $78,000 of the $95,000 I transferred. They genuinely care about victims.",
  "After being defrauded by a 'cryptocurrency trading mentor' I met on LinkedIn, ChanAid identified five other victims from the same perpetrator, combined our cases, and secured a collective enforcement action.",
  "ChanAid found that the same wallet address had received funds from 47 other victims. That evidence was submitted to Europol and directly contributed to the arrest of four individuals operating the scheme.",
  "The scammer had used my photos on a separate romance scam targeting others. ChanAid discovered this during their investigation and ensured that their evidence helped multiple victims, not just me.",
  "I transferred $43,000 through four different crypto platforms at the scammer's direction. ChanAid's transaction graph analysis connected all four platforms to a single off-ramp address, giving law enforcement actionable evidence.",
  "The psychological manipulation was sophisticated and calculated. ChanAid's victim support team was outstanding — they understood the emotional complexity of the situation and handled my case with exceptional sensitivity.",
  "I lost my life savings of $162,000 to a pig-butchering operation disguised as a DeFi investment. ChanAid's team worked with a Taiwanese law enforcement contact to identify the operator and freeze the assets within two weeks.",
  "ChanAid's open-source intelligence team reconstructed the scammer's entire fake persona — multiple social media accounts, fabricated employment history, and a digital trail going back two years. The detail was extraordinary.",
  "The recovery platform used a cloned interface of a legitimate exchange to steal my login credentials. ChanAid traced the stolen funds, obtained a civil freezing injunction, and recovered $55,000 within 30 days.",
  "My 'online partner' disappeared the moment I questioned the investment platform. ChanAid found that the same phone number had been used in 23 prior fraud cases. That prior-bad-act evidence was decisive in my civil claim.",
  "I lost $88,000 over six months to a romance scam. ChanAid not only recovered $71,000 but also helped me report the scammer to the National Cyber Crime Unit, which resulted in a wider investigation.",
  "ChanAid discovered that the crypto wallet I had sent funds to was directly linked to a known money-mule network. This connection elevated my case to a serious fraud investigation and dramatically improved my recovery outcome.",
  "They were patient, professional, and relentless. Every time the investigation hit a dead end, ChanAid's team found another angle. It took four months, but I got $99,000 of my $112,000 back.",
  "The fake investment platform had a live chat, a help desk, and a fake regulatory certificate. ChanAid authenticated every fraudulent element and submitted a complete fraud package to my bank within 72 hours.",
  "I was embarrassed to report the scam to anyone. ChanAid's private client team handled my case with complete discretion and zero judgment. The outcome — $67,000 recovered — speaks for itself.",
  "ChanAid's analysis revealed the scammer was simultaneously running at least 12 other romance fraud profiles. Knowing I was not alone, and that our combined evidence would help stop them, made the recovery process meaningful.",
  "The scam lasted 14 months. By the time it ended, I had transferred $240,000. ChanAid's forensic trail led all the way to a criminal network in Eastern Europe, and through Eurojust, a partial seizure was secured.",
  "Their approach to romance fraud recovery is unique. ChanAid combines technical forensics with legal pressure in a way no other firm does. I recovered $58,000 and I have ChanAid to thank for every penny.",
  "ChanAid's victim liaison was available every time I called, day or evening. In what was the most distressing experience of my life, knowing someone expert was fighting for me made an enormous difference. $49,000 returned."
];

const hnwQuotes = [
  "As a business owner, I lost $1.2M to a sophisticated investment fraud involving a fake hedge fund with real-looking audited accounts. ChanAid's multi-jurisdictional team secured an international freezing order within five days.",
  "ChanAid's deep-web intelligence capability is exceptional. They located offshore accounts in the Cayman Islands and Jersey that the fraudsters thought were completely untraceable. $870,000 was frozen pending full recovery.",
  "I retained ChanAid after a fake private equity firm vanished with $3.4M of my capital. Their legal team filed in four jurisdictions simultaneously and recovered $2.9M within eight months through coordinated enforcement.",
  "The forensic accounting report ChanAid produced was admissible in three separate court proceedings. Their expert witness destroyed the defence's arguments. A full civil judgment of $1.5M was awarded in my favour.",
  "My company was defrauded through a BEC — Business Email Compromise — attack. $485,000 was transferred before we caught it. ChanAid traced the SWIFT payment chain and had $420,000 recalled within 24 hours.",
  "ChanAid has access to intelligence tools that government investigators simply don't have. They identified shell company structures across eight jurisdictions that concealed $600,000 of my stolen funds. Recovery is ongoing.",
  "The fraudsters had laundered my $780,000 through seven layers of corporate entities. ChanAid's asset tracing team unpicked every layer and identified beneficial ownership in each case, giving my legal counsel an airtight case.",
  "After a fake venture capital firm took $950,000 from my family trust, ChanAid's team flew to the relevant jurisdiction, attended hearings, and personally ensured the freezing order was served correctly. Exceptional dedication.",
  "ChanAid's network of legal correspondents in 40+ countries is their secret weapon. When the fraudster moved assets to the UAE, ChanAid had a partner firm on the ground within hours to file an emergency injunction.",
  "I was targeted by an insider at my own investment firm who diverted $2.1M to personal offshore accounts. ChanAid's forensic audit identified the pattern within three days. Criminal proceedings followed immediately.",
  "Their Anton Piller application was granted first time. ChanAid's legal team executed it personally, preserving digital evidence that would otherwise have been destroyed. That evidence secured a $1.7M recovery.",
  "ChanAid managed the entire recovery process from forensic investigation through to enforcement without me having to instruct a separate solicitor. For a high-value case, that end-to-end service is invaluable.",
  "The investment fraud that took $560,000 from my pension fund appeared legitimate at every stage — regulated custodian, audited returns, quarterly reports. ChanAid forensically proved every document was forged.",
  "I had already spent $80,000 on lawyers going nowhere before I found ChanAid. Within two months, their forensic-first approach had produced actionable evidence that moved the case forward faster than two years of litigation.",
  "ChanAid's Mareva injunction froze $1.1M of assets globally within 36 hours of their initial forensic findings. The speed at which they operated prevented the fraudsters from dissipating assets across jurisdictions.",
  "The fraudulent fund manager had created a convincing facade — office, staff, Bloomberg terminal. ChanAid's investigators found the entire operation was virtual and identified the single operator behind it. $730,000 recovered.",
  "ChanAid's intelligence report identified that three separate fraud operations I was aware of were controlled by the same criminal group. Combining the cases created a $4.2M enforcement action with a much stronger recovery prospect.",
  "They were the only firm that took on my case without requiring a large upfront retainer. Their contingency approach aligned their interests directly with mine, and the result — $890,000 recovered — justified every aspect of that trust.",
  "The offshore entity that held my stolen assets had a nominee director and bearer shares. ChanAid used disclosure orders in three jurisdictions to pierce every layer of anonymity and identify the true beneficial owner.",
  "ChanAid identified that the fraudster had purchased property with my stolen funds. They obtained a charging order against the property, ensuring that even before criminal proceedings concluded, my assets were protected.",
  "Their private intelligence network flagged that the fraudster was attempting to move assets the day before ChanAid's injunction expired. They extended the order within hours. $1.3M was preserved. Priceless intelligence.",
  "I was told by two major law firms that my case was unwinnable. ChanAid disagreed, built an unconventional but legally sound strategy, and recovered $640,000. Sometimes the most effective solution is thinking differently."
];

const exchangeQuotes = [
  "My Coinbase account was suspended with $31,000 inside following a false fraud flag. ChanAid filed a formal complaint with the FCA and FinCEN simultaneously, and the account was reinstated with full balance in eight days.",
  "After my account was frozen by an exchange during a 'compliance review' that lasted six months, ChanAid's regulatory team escalated directly to the exchange's compliance officer. Funds released within five business days.",
  "I was locked out of my exchange account after a SIM-swap attack. The exchange refused to accept my identity verification. ChanAid's consumer rights team invoked the EU's GDPR right of access and the account was restored.",
  "The exchange suspended my account citing AML concerns, despite my funds being entirely legitimate. ChanAid produced a certified source-of-funds report that the exchange accepted, and $44,000 was unfrozen immediately.",
  "My account on a decentralised exchange was drained through a phishing link. ChanAid traced the stolen ETH, identified the attacker's centralised exchange account, and filed an emergency disclosure request. $27,000 recovered.",
  "After my investment platform went into administration, I thought my $58,000 was gone forever. ChanAid identified I was a priority creditor under the administrator's waterfall and helped me file a timely claim. Full recovery.",
  "The exchange I used was not registered with my national regulator. ChanAid used that regulatory gap to file a consumer protection complaint that obligated the exchange's payment processor to reverse my deposits.",
  "I bought crypto through a peer-to-peer platform and was defrauded by the seller. ChanAid escalated to the platform's trust-and-safety team with a forensic transaction record, and the seller's account was frozen pending chargeback.",
  "ChanAid identified that the exchange had failed to implement adequate AML controls, making them a co-defendant in my civil claim. That change in legal strategy resulted in a $72,000 settlement that I would not have achieved alone.",
  "My exchange account held $105,000 in stablecoin when the platform paused withdrawals. ChanAid's legal team filed an urgent injunction preventing the platform from moving those assets during insolvency proceedings.",
  "After a crypto ATM scam cost me $19,000 in cash, ChanAid found the operator's registered business address, filed a formal civil claim, and recovered $15,000 — far more than I had expected for a cash transaction.",
  "The exchange took six weeks to respond to my support tickets. ChanAid bypassed the support queue by filing a formal written complaint with the Financial Ombudsman, which obligated a response within 14 days. Resolved within 10.",
  "ChanAid's knowledge of insolvency procedures saved me when my exchange platform collapsed. They ensured I filed my creditor claim correctly and in time, preserving $39,000 that disorganised claimants had already lost.",
  "I was charged $9,000 in undisclosed fees by my exchange, violating their own terms of service. ChanAid's contract analysis identified the breach, filed a small claims action, and recovered every penny with interest.",
  "The mobile trading app I used was a clone of a legitimate platform with a subtly different URL. ChanAid traced the app's server infrastructure, identified the hosting company, and submitted a DMCA and fraud notice simultaneously.",
  "My account was frozen because my wallet had received funds from a wallet that had received funds from a flagged address — four hops removed. ChanAid demonstrated this chain was legally irrelevant and cleared the freeze.",
  "After losing $22,000 in a fake token presale, ChanAid traced the smart contract creator's wallet to their main exchange account. The exchange cooperated with a law enforcement referral and the funds were returned.",
  "ChanAid recovered $48,000 from a fraudulent mining pool that had been paying fake returns for eight months before disappearing. Their technical analysis of the pool's infrastructure identified a traceable corporate entity behind it.",
  "The exchange was holding $67,000 of my funds under a vague 'security hold'. ChanAid's formal letter citing their legal obligations under the Payment Services Regulations resulted in the hold being lifted the same day.",
  "I was targeted by a recovery scammer after my first fraud — someone who promised to recover my original loss for a fee and then disappeared too. ChanAid helped me recover from both frauds. Their legitimacy is beyond question.",
  "ChanAid's intervention prevented a $91,000 wire transfer from completing. Their real-time alert system flagged my case as high-priority and their recall team contacted the recipient bank within two hours of the transfer.",
  "After my exchange account was compromised and $53,000 withdrawn, ChanAid's combination of technical forensics and consumer protection law created an irresistible case for the exchange's insurers to settle. Full recovery."
];

const allNames = [
  'Marcus T.','Diane R.','Kevin L.','Angela M.','Brenda S.','Todd H.','Cheryl B.',
  'Nathan C.','Valerie W.','Gregory P.','Monica F.','Darnell J.','Cynthia K.',
  'Randy D.','Felicia N.','Bryan O.','Tamara V.','Curtis E.','Wendy A.','Phillip G.',
  'Latasha I.','Derrick Q.','Crystal U.','Jerome Y.','Renee X.','Lionel Z.',
  'Cassandra B.','Tyrone C.','Megan D.','Alicia F.','Franklin G.','Heather H.',
  'Dwayne I.','Yolanda J.','Bradley K.',
  'Oliver H.','Priya S.','Callum W.','Fiona M.','Declan R.','Harriet B.',
  'Alistair C.','Siobhan F.','Rupert L.','Gemma T.','Nigel O.','Imogen P.',
  'Rory A.','Verity N.','Hamish D.','Aoife E.','Piers G.','Natasha K.',
  'Crispin V.','Saoirse Q.','Montgomery J.','Tabitha U.','Barnaby X.','Isolde Y.','Gideon Z.',
  'Liam C.','Chloe W.','Ethan B.','Zara F.','Mason P.','Isla K.',
  'Cooper D.','Scarlett R.','Archer S.','Willow T.','Riley M.','Indie A.',
  'Banjo H.','Clancy E.','Darcy L.','Pearl N.','Flynn O.','Sage V.',
  'Jean-Pierre L.','Fatima A.','Connor O.','Mei-Ling W.','Sebastien B.','Aaliyah C.',
  'Gauthier D.','Nadia E.','Lachlan F.','Riya G.','Brock H.','Celeste I.',
  'Khalid A.','Nour B.','Tariq C.','Layla D.','Faisal E.','Hana F.',
  'Yusuf G.','Mariam H.','Rashid I.','Amal J.',
  'Klaus M.','Ingrid N.','Hendrik O.','Astrid P.',
  'Florian Q.','Beatrice R.',
  'Wei-Chen S.','Preethi T.',
  'Cameron U.','Aroha V.'
];

const allLocations = [
  'New York, USA','Los Angeles, USA','Chicago, USA','Houston, USA','Phoenix, USA',
  'Philadelphia, USA','San Antonio, USA','San Diego, USA','Dallas, USA','San Jose, USA',
  'Austin, USA','Jacksonville, USA','Fort Worth, USA','Columbus, USA','Charlotte, USA',
  'Indianapolis, USA','San Francisco, USA','Seattle, USA','Denver, USA','Nashville, USA',
  'Oklahoma City, USA','El Paso, USA','Washington DC, USA','Boston, USA','Memphis, USA',
  'Portland, USA','Las Vegas, USA','Louisville, USA','Baltimore, USA','Milwaukee, USA',
  'Albuquerque, USA','Tucson, USA','Fresno, USA','Sacramento, USA','Kansas City, USA',
  'London, UK','Manchester, UK','Birmingham, UK','Leeds, UK','Glasgow, UK',
  'Sheffield, UK','Bristol, UK','Edinburgh, UK','Liverpool, UK','Cardiff, Wales',
  'Nottingham, UK','Leicester, UK','Belfast, UK','Brighton, UK','Southampton, UK',
  'Oxford, UK','Cambridge, UK','York, UK','Bath, UK','Inverness, Scotland',
  'Aberdeen, Scotland','Swansea, Wales','Plymouth, UK','Exeter, UK','Norwich, UK',
  'Sydney, AU','Melbourne, AU','Brisbane, AU','Perth, AU','Adelaide, AU',
  'Gold Coast, AU','Canberra, AU','Darwin, AU','Hobart, AU','Newcastle, AU',
  'Wollongong, AU','Geelong, AU','Townsville, AU','Cairns, AU','Toowoomba, AU',
  'Ballarat, AU','Bendigo, AU','Launceston, AU',
  'Toronto, Canada','Vancouver, Canada','Montreal, Canada','Calgary, Canada',
  'Edmonton, Canada','Ottawa, Canada','Winnipeg, Canada','Quebec City, Canada',
  'Hamilton, Canada','Kitchener, Canada','London, Canada','Victoria, Canada',
  'Dubai, UAE','Abu Dhabi, UAE','Sharjah, UAE','Ajman, UAE','Ras Al Khaimah, UAE',
  'Fujairah, UAE','Umm Al Quwain, UAE','Al Ain, UAE','Jebel Ali, UAE','Dubai Marina, UAE',
  'Berlin, Germany','Oslo, Norway','Amsterdam, Netherlands','Stockholm, Sweden',
  'Zurich, Switzerland','Lyon, France',
  'Singapore','Bangalore, India',
  'Auckland, NZ','Christchurch, NZ'
];

const allScamTypes = [
  ...Array(22).fill('crypto'),
  ...Array(22).fill('forex'),
  ...Array(22).fill('romance'),
  ...Array(22).fill('asset-tracing'),
  ...Array(22).fill('exchange')
];

const allQuotes = [...cryptoQuotes, ...forexQuotes, ...romanceQuotes, ...hnwQuotes, ...exchangeQuotes];

// Guards
if (allQuotes.length !== 110)    throw new Error('allQuotes.length = ' + allQuotes.length);
if (allNames.length !== 110)     throw new Error('allNames.length = ' + allNames.length);
if (allLocations.length !== 110) throw new Error('allLocations.length = ' + allLocations.length);

// ─── Build SQL ────────────────────────────────────────────────────────────────
const lines = [];
lines.push('-- Remote D1 seed: 110 unique testimonials + 4 hero services');
lines.push('-- Generated by gen_remote_sql.cjs on ' + new Date().toISOString());
lines.push('');
lines.push('DELETE FROM testimonials;');
lines.push('DELETE FROM services;');
lines.push('');

// Services
const servicesData = [
  { slug: 'crypto-recovery', name: 'Cryptocurrency Recovery', short_description: 'Military-grade blockchain forensics to track and reclaim stolen Bitcoin, Ethereum, and USDT from fraudulent exchanges.', icon: 'BlockchainForensics', hero_headline: 'Total Blockchain Dominance', hero_subheadline: 'Our forensic specialists pierce through mixers and obfuscated chains to reclaim your digital sovereignty.', success_rate: '98%', sort_order: 1, problem_description: 'Scammers use mixers and cross-chain hops to vanish. Standard investigators stop at the first hop.', recovery_process: 'We utilize private node-level data to unmask wallet clusters and coordinate with global law enforcement to freeze assets.' },
  { slug: 'forex-scam-recovery', name: 'Forex & Broker Arbitration', short_description: 'Forcing unregulated platforms into capital restitution through international banking pressure and legal ombudsman protocols.', icon: 'LegalScale', hero_headline: 'Capital Sovereignty Restored', hero_subheadline: 'Rogue brokers rely on your silence. We speak the language of international financial law to force their hand.', success_rate: '94%', sort_order: 2, problem_description: 'Unregulated brokers simulate trades to manufacture losses and block withdrawals.', recovery_process: 'We leverage financial ombudsman protocols and chargeback representment to force facilitating banks to reverse transfers.' },
  { slug: 'romance-scam-recovery', name: 'Romance Fraud Remediation', short_description: 'Advanced digital footprint analysis to identify and de-anonymize perpetrators of Pig Butchering and social engineering schemes.', icon: 'DigitalFingerprint', hero_headline: 'Truth from Deception', hero_subheadline: 'They exploited your trust; we exploit their digital footprint. Reclaim your pride and your assets.', success_rate: '87%', sort_order: 3, problem_description: 'Romance scams use psychological warfare to drain victims via complex mule networks.', recovery_process: 'We conduct full digital footprint analysis to find human error in the scammer setup, then apply legal pressure on receiving institutions.' },
  { slug: 'asset-tracing', name: 'Global Asset Tracing', short_description: 'Deep-web intelligence and multi-jurisdictional audits to locate hidden wealth and offshore holdings for high-stakes recovery.', icon: 'AssetTrace', hero_headline: 'Elite Asset Reclamation', hero_subheadline: 'Discretion, precision, and absolute dominance in international recovery. Reserved for high-stakes capital loss.', success_rate: '99%', sort_order: 4, problem_description: 'High-net-worth individuals are targets for bespoke investment scams involving fake hedge funds.', recovery_process: 'Our legal teams coordinate across borders to issue Anton Piller orders and secure assets globally before liquidation.' }
];

for (const s of servicesData) {
  const id = randomUUID();
  lines.push(
    `INSERT INTO services (id,slug,name,short_description,icon,hero_headline,hero_subheadline,success_rate,sort_order,is_published,problem_description,recovery_process) VALUES ('${id}','${esc(s.slug)}','${esc(s.name)}','${esc(s.short_description)}','${esc(s.icon)}','${esc(s.hero_headline)}','${esc(s.hero_subheadline)}','${esc(s.success_rate)}',${s.sort_order},1,'${esc(s.problem_description)}','${esc(s.recovery_process)}');`
  );
}
lines.push('');

// Testimonials
for (let i = 0; i < allQuotes.length; i++) {
  const id   = randomUUID();
  const name = allNames[i];
  const loc  = allLocations[i];
  const q    = allQuotes[i];
  const amt  = makeAmount(i);
  const scam = allScamTypes[i];
  const feat = i < 12 ? 1 : 0;
  lines.push(
    `INSERT INTO testimonials (id,client_name,location,rating,quote,amount_recovered,scam_type,is_published,is_featured,sort_order) VALUES ('${id}','${esc(name)}','${esc(loc)}',5,'${esc(q)}','${esc(amt)}','${esc(scam)}',1,${feat},${i});`
  );
}

fs.writeFileSync('seed_remote.sql', lines.join('\n') + '\n');
console.log('✅ seed_remote.sql generated — ' + allQuotes.length + ' testimonials, ' + servicesData.length + ' services');
console.log('   Run: npx wrangler d1 execute tanstack-start-db --file=seed_remote.sql --remote');
