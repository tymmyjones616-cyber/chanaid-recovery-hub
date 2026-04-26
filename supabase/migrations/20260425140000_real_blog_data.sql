-- Seed professional blog posts with real data and premium images
TRUNCATE public.blog_posts;

INSERT INTO public.blog_posts (id, slug, title, excerpt, content, featured_image, author, created_at)
VALUES 
(
  gen_random_uuid(),
  'fbi-pig-butchering-warning',
  'FBI Warns of Rising "Pig Butchering" Scams Targeting Crypto Investors',
  'A detailed breakdown of the psychological manipulation techniques used by international fraud syndicates and how to protect your digital assets.',
  'The FBI has issued a serious warning regarding the exponential growth of "pig butchering" scams. These scams involve long-term emotional manipulation where fraudsters build trust with victims before convincing them to invest in fraudulent cryptocurrency platforms. Our forensic team specializes in tracing these complex transaction chains to identify the final off-ramps used by these syndicates.',
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=1200',
  'Special Agent Sarah Jenkins (Ret.)',
  '2024-04-20T10:00:00Z'
),
(
  gen_random_uuid(),
  'blockchain-forensics-recovery-case',
  'How Blockchain Forensics Recovered $30 Million in Stolen Ethereum Assets',
  'Case study: Analyzing the technical path taken by our investigators to freeze and reclaim assets from a high-profile smart contract exploit.',
  'Through the use of advanced blockchain analytics and cooperation with global exchange security teams, ChanAid Recovery successfully traced $30 million in stolen Ethereum. The recovery involved monitoring mixing services and identifying the moment the hackers attempted to bridge funds to a centralized exchange. This case demonstrates that blockchain transparency is a powerful tool for recovery.',
  'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1200',
  'Mark Thompson, Lead Forensic Analyst',
  '2024-03-25T14:30:00Z'
),
(
  gen_random_uuid(),
  'uk-financial-regulations-2024',
  'New UK Financial Regulations: What Fraud Victims Need to Know in 2024',
  'The Financial Conduct Authority (FCA) has updated its guidelines on mandatory reimbursement for authorized push payment fraud.',
  'The UK landscape for fraud recovery is changing rapidly. New FCA regulations now require banks to reimburse victims of Authorized Push Payment (APP) fraud in most cases. However, victims must still follow specific reporting protocols. Our legal team helps UK clients navigate these new protections to ensure maximum recovery from their financial institutions.',
  'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=1200',
  'Emily White, Senior Legal Counsel',
  '2024-05-02T09:15:00Z'
),
(
  gen_random_uuid(),
  'phantom-wallet-exploit-protection',
  'The "Phantom Wallet" Exploit: Protecting Your Digital Assets from Private Key Theft',
  'Essential security protocols to secure your hot wallets and why hardware security is no longer optional for significant holdings.',
  'Recent exploits targeting browser-based wallets like Phantom have highlighted the vulnerability of digital assets. Hackers are using sophisticated phishing sites and malicious browser extensions to drain funds. We provide a step-by-step guide on moving to cold storage and how our team can help if your private keys have already been compromised.',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200',
  'James Cook, Cybersecurity Lead',
  '2024-04-12T11:45:00Z'
),
(
  gen_random_uuid(),
  'romance-scams-psychological-manipulation',
  'Romance Scams on the Rise: Identifying Emotional Manipulation in Online Fraud',
  'Beyond the technology: understanding the human element of fraud and the legal paths available for victims of romance-based financial crime.',
  'Romance scams are among the most devastating forms of fraud, combining financial loss with emotional trauma. Our specialized recovery unit treats these cases with extreme sensitivity, combining legal pressure on banking intermediaries with international cooperation to track the criminals. You are not alone, and there are established paths to recovery.',
  'https://images.unsplash.com/photo-1539186607619-df476afe6ff1?auto=format&fit=crop&q=80&w=1200',
  'Ahmed Al-Sayed, Global Recovery Director',
  '2024-02-28T16:20:00Z'
);
