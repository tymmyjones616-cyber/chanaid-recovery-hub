import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { ShieldCheck, Users, Award, Globe } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ChanAidRecovery — Funds Recovery Specialists" },
      { name: "description", content: "ChanAidRecovery's investigators, chargeback specialists and legal experts have helped thousands of scam victims worldwide." },
      { property: "og:title", content: "About ChanAidRecovery" },
      { property: "og:description", content: "Investigators, chargeback specialists and legal experts dedicated to recovering victims' funds." },
    ],
  }),
  component: () => (
    <SiteShell>
      <section className="bg-hero-gradient py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">Years of experience fighting online financial fraud</h1>
          <p className="mt-5 text-lg text-muted-foreground">Our team of investigators, chargeback specialists and legal experts has helped thousands of victims worldwide reclaim what was taken from them.</p>
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
    </SiteShell>
  ),
});