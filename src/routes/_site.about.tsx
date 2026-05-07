import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { ShieldCheck, Users, Award, Globe, BadgeCheck } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About ChanAidRecovery Hub | Global Funds Recovery Specialists" },
      { name: "description", content: "Learn about ChanAidRecovery Hub's team of investigators, blockchain forensic experts, and legal specialists helping scam victims worldwide." },
      { property: "og:title", content: "About ChanAidRecovery Hub | Expert Recovery Team" },
      { property: "og:description", content: "Our investigators and legal experts are dedicated to reclaiming stolen assets from crypto and financial fraud." },
    ],
  }),
  component: () => (
    <>
      <section className="bg-hero-gradient py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">Years of experience fighting online financial fraud</h1>
          <p className="mt-5 text-lg text-muted-foreground">Our team of investigators, chargeback specialists and legal experts has helped thousands of victims <strong>across the United States, United Kingdom, Australia, Canada and the UAE</strong> reclaim what was taken from them.</p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { i: ShieldCheck, t: "Trusted experts", d: "Decades of combined experience in financial fraud recovery." },
          { i: Users, t: "10,000+ clients", d: "Victims across 40+ countries have trusted us with their cases." },
          { i: Award, t: "85% success rate", d: "Industry-leading recovery rates across all scam types." },
          { i: Globe, t: "Global reach", d: "Multi-jurisdictional expertise across regulators and banks." },
        ].map((x, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-border shadow-soft">
            <div className="h-12 w-12 rounded-xl bg-cta-gradient text-white flex items-center justify-center mb-4"><x.i className="w-6 h-6" /></div>
            <h3 className="font-semibold">{x.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
          </div>
        ))}
      </section>

      {/* Jurisdiction strip */}
      <div className="bg-slate-50 border-y border-border py-4">
        <p className="text-center text-sm font-semibold text-muted-foreground tracking-wide">
          Active in 40+ jurisdictions &nbsp;·&nbsp; FCA &nbsp;·&nbsp; ASIC &nbsp;·&nbsp; FINRA &nbsp;·&nbsp; AFCA &nbsp;·&nbsp; IC3 protocols
        </p>
      </div>

      {/* Expert team bios */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <Reveal direction="up">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full mb-4">The Team</span>
            <h2 className="text-3xl sm:text-4xl font-bold">Expert investigators, forensic specialists &amp; legal counsel</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Every case is handled by credentialed professionals with direct experience in blockchain forensics, financial law, and regulatory enforcement.</p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Dr. Evelyn Carter */}
          <Reveal direction="up" delay={0}>
            <div className="bg-white rounded-2xl p-8 border border-border shadow-soft h-full flex flex-col">
              <div className="h-14 w-14 rounded-[1.25rem] bg-cta-gradient text-white flex items-center justify-center font-bold text-xl shadow-soft mb-5">EC</div>
              <h3 className="text-lg font-bold text-slate-900">Dr. Evelyn Carter</h3>
              <p className="text-sm font-semibold text-primary mt-0.5 mb-4">Head of Blockchain Forensics</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Former senior investigator at Chainalysis. MSc Cryptography from ETH Zürich. Lead analyst on cases totalling $80M+ in recovered assets, spanning Bitcoin, Ethereum, and cross-chain mixer protocols.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> Certified Blockchain Analyst</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> MSc Cryptography</span>
              </div>
            </div>
          </Reveal>

          {/* Marcus Holloway */}
          <Reveal direction="up" delay={80}>
            <div className="bg-white rounded-2xl p-8 border border-border shadow-soft h-full flex flex-col">
              <div className="h-14 w-14 rounded-[1.25rem] bg-cta-gradient text-white flex items-center justify-center font-bold text-xl shadow-soft mb-5">MH</div>
              <h3 className="text-lg font-bold text-slate-900">Marcus Holloway, JD</h3>
              <p className="text-sm font-semibold text-primary mt-0.5 mb-4">Lead Legal Counsel</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                14 years of cross-border financial litigation. Admitted to practice in New York and England &amp; Wales. Specialist in Mareva injunctions, Anton Piller orders, and multi-jurisdictional asset freezing applications.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> NY Bar &amp; England &amp; Wales</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> Financial Crime Law</span>
              </div>
            </div>
          </Reveal>

          {/* Aisha Rahman */}
          <Reveal direction="up" delay={160}>
            <div className="bg-white rounded-2xl p-8 border border-border shadow-soft h-full flex flex-col">
              <div className="h-14 w-14 rounded-[1.25rem] bg-cta-gradient text-white flex items-center justify-center font-bold text-xl shadow-soft mb-5">AR</div>
              <h3 className="text-lg font-bold text-slate-900">Aisha Rahman</h3>
              <p className="text-sm font-semibold text-primary mt-0.5 mb-4">Chief Forensic Investigator</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Former IC3 / FBI Cyber Division liaison with a decade of experience dismantling international fraud networks. Certified Fraud Examiner (CFE). Expert in romance scam syndicate identification and pig-butchering operations.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> Certified Fraud Examiner</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> Former FBI IC3 Liaison</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  ),
});
