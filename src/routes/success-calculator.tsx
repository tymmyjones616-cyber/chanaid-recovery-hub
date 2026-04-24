import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Link } from "@tanstack/react-router";

const SCAM_TYPES = [
  "Cryptocurrency",
  "Binary Options",
  "Forex",
  "Stock Trading",
  "Credit Card Phishing",
  "Property Scams",
  "Romance Scams",
  "Other",
];

const PAYOUT_MULTIPLIER = 20;
const MIN_PAYOUT = 100_000;

export const Route = createFileRoute("/success-calculator")({
  head: () => ({
    meta: [
      { title: "Recovery Success Calculator | ChanAidRecovery" },
      { name: "description", content: "Estimate your potential funds recovery based on scam type and amount lost." },
      { property: "og:title", content: "Recovery Success Calculator" },
      { property: "og:description", content: "Estimate how much you could recover." },
    ],
  }),
  component: Calc,
});

function Calc() {
  const [type, setType] = useState("Cryptocurrency");
  const [amount, setAmount] = useState(5000);
  const est = Math.max(MIN_PAYOUT, Math.round(amount * PAYOUT_MULTIPLIER));
  return (
    <SiteShell>
      <section className="bg-hero-gradient py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">How much could you recover?</h1>
          <p className="mt-4 text-lg text-muted-foreground">Use our calculator to estimate your potential recovery.</p>
        </div>
      </section>
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-elegant p-8 border border-border">
          <label className="block text-sm font-semibold mb-1">Type of scam</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 w-full rounded-lg border border-input px-3 mb-5">
            {SCAM_TYPES.map((k) => <option key={k}>{k}</option>)}
          </select>
          <label className="block text-sm font-semibold mb-1">Amount lost (USD)</label>
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value || 0))} className="h-11 w-full rounded-lg border border-input px-3 mb-6" />
          <div className="bg-soft-gradient rounded-xl p-6 text-center">
            <div className="text-sm text-muted-foreground">Estimated total payout</div>
            <div className="text-4xl font-bold text-gradient mt-2">${est.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-2">Includes projected funds recovered plus court-awarded damages and legal fees pursued against the perpetrator in {type} cases.</div>
          </div>
          <Link to="/contact" className="mt-6 w-full inline-flex items-center justify-center bg-cta-gradient text-white font-semibold h-12 rounded-full">
            Start my case
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}