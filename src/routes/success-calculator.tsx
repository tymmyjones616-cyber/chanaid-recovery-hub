import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Link } from "@tanstack/react-router";
import { 
  Calculator, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/effects/Reveal";

const SCAM_TYPES = [
  "Cryptocurrency",
  "Romance / Pig Butchering",
  "Forex & Trading",
  "Binary Options",
  "Investment Ponzi",
  "Phishing / Identity Theft",
  "Property & Real Estate",
  "Other Financial Fraud",
];

const PLATFORMS = [
  "Social Media (FB, IG, Telegram)",
  "Dating Apps (Tinder, Hinge)",
  "Fake Exchange / Website",
  "Email / Direct Message",
  "Phone Call / WhatsApp",
  "Other",
];

const EVIDENCE_LEVELS = [
  { id: "high", label: "High", desc: "Transactions IDs, Wallet Addresses, Chat Logs" },
  { id: "med", label: "Medium", desc: "Bank Statements, Some Chat Logs" },
  { id: "low", label: "Low", desc: "Only Platform Name, Limited Info" },
];

export const Route = createFileRoute("/success-calculator")({
  head: () => ({
    meta: [
      { title: "Success Calculator | ChanAidRecovery" },
      { name: "description", content: "Professional recovery probability assessment. Calculate your likelihood of fund recovery based on scam type, platform, and evidence." },
      { property: "og:title", content: "Recovery Success Calculator" },
      { property: "og:description", content: "Professional assessment of your fund recovery case." },
    ],
  }),
  component: Calc,
});

function Calc() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(SCAM_TYPES[0]);
  const [amount, setAmount] = useState<number>(5000);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [evidence, setEvidence] = useState("high");
  const [timePassed, setTimePassed] = useState("less_1_month");

  const getProbability = () => {
    let prob = 85;
    if (evidence === "med") prob -= 15;
    if (evidence === "low") prob -= 35;
    if (timePassed === "1_6_months") prob -= 10;
    if (timePassed === "more_6_months") prob -= 25;
    if (type === "Other Financial Fraud") prob -= 10;
    return Math.max(evidence === "low" ? 45 : 60, prob);
  };

  const getEstRecovery = () => {
    // Aggressive damage pursuit model: Min $100k or 20x the loss, adjusted by evidence
    const base = Math.max(100000, amount * 20);
    const factor = evidence === "high" ? 1.0 : evidence === "med" ? 0.85 : 0.7;
    return Math.round(base * factor);
  };

  const prob = getProbability();
  const est = getEstRecovery();

  const handleClaim = () => {
    const text = `🚨 *NEW CASE ASSESSMENT RESULT* 🚨

👤 *ASSESSMENT SUMMARY*
*Recovery Probability:* ${prob}%
*Estimated Recovery:* $${est.toLocaleString()}
*Scam Type:* ${type}
*Platform:* ${platform}
*Evidence Level:* ${evidence.toUpperCase()}
*Timeline:* ${timePassed.replace(/_/g, ' ')}

⚖️ *REQUEST:* I would like to claim my free legal audit based on this calculation.

--------------------------------
_Sent via ChanAid Recovery Hub_`;
    
    window.open(`https://wa.me/19403779359?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <SiteShell>
      <section className="bg-hero-gradient pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Reveal direction="up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Calculator className="w-4 h-4" /> Professional Case Assessment
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Recovery Probability <span className="text-gradient">Calculator</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Answer 4 quick questions to receive a professional assessment of your recovery likelihood and estimated payout.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-white rounded-3xl shadow-elegant border border-border overflow-hidden">
          <div className="bg-slate-50 border-b border-border h-2 flex">
            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
          </div>

          <div className="p-8 sm:p-12">
            {step === 1 && (
              <Reveal>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                    <h2 className="text-2xl font-bold">What type of scam was it?</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SCAM_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setType(t); setStep(2); }}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${type === t ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"}`}
                      >
                        <div className="font-semibold">{t}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {step === 2 && (
              <Reveal>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                    <h2 className="text-2xl font-bold">Amount and Timeline</h2>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Total Amount Lost (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-14 pl-8 pr-4 rounded-xl border-2 border-border focus:border-primary focus:outline-none text-lg font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">When did this happen?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "less_1_month", label: "Within 30 Days" },
                        { id: "1_6_months", label: "1 - 6 Months Ago" },
                        { id: "more_6_months", label: "Over 6 Months" },
                      ].map((t) => (
                        <button key={t.id} onClick={() => setTimePassed(t.id)} className={`p-4 rounded-xl border-2 transition-all text-center ${timePassed === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                          <div className="text-sm font-semibold">{t.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => setStep(1)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
                    <Button size="lg" className="rounded-full px-8" onClick={() => setStep(3)}>Next Step <ChevronRight className="ml-2 w-4 h-4" /></Button>
                  </div>
                </div>
              </Reveal>
            )}

            {step === 3 && (
              <Reveal>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                    <h2 className="text-2xl font-bold">Platform Used</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {PLATFORMS.map((p) => (
                      <button key={p} onClick={() => { setPlatform(p); setStep(4); }} className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${platform === p ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"}`}>
                        <div className="font-semibold">{p}</div>
                        {platform === p && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" onClick={() => setStep(2)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
                </div>
              </Reveal>
            )}

            {step === 4 && (
              <Reveal>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
                    <h2 className="text-2xl font-bold">Evidence Level</h2>
                  </div>
                  <div className="space-y-3">
                    {EVIDENCE_LEVELS.map((e) => (
                      <button key={e.id} onClick={() => { setEvidence(e.id); setStep(5); }} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${evidence === e.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"}`}>
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${evidence === e.id ? "border-primary bg-primary" : "border-border"}`}>{evidence === e.id && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                        <div>
                          <div className="font-bold text-lg">{e.label} Evidence</div>
                          <div className="text-sm text-muted-foreground">{e.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" onClick={() => setStep(3)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
                </div>
              </Reveal>
            )}

            {step === 5 && (
              <Reveal>
                <div className="text-center">
                  <div className="relative inline-block mb-8">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 88} strokeDashoffset={2 * Math.PI * 88 * (1 - prob / 100)} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-extrabold text-slate-900">{prob}%</div>
                      <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Probability</div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Assessment Complete</h2>
                  <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Based on your input, you have a <span className="text-primary font-bold">{prob}% success probability</span>.</p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-border">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Target Recovery</div>
                      <div className="text-2xl font-bold text-slate-900">${est.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">*Includes projected recovery + court-awarded damages & legal fees.</div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-border">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Strategy</div>
                      <div className="text-2xl font-bold text-slate-900">Direct Intervention</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Button size="lg" className="w-full bg-cta-gradient h-14 rounded-full text-lg shadow-elegant" onClick={handleClaim}>Claim Free Legal Audit</Button>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><ShieldCheck className="w-4 h-4 text-primary" /> Confidential Case Filing</p>
                  </div>
                  <button onClick={() => setStep(1)} className="mt-8 text-sm font-semibold text-slate-500 hover:text-primary transition">Recalculate Case</button>
                </div>
              </Reveal>
            )}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-border">
            <Clock className="w-6 h-6 text-primary mb-3" />
            <div className="font-bold mb-1">24h Response</div>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-border">
            <TrendingUp className="w-6 h-6 text-primary mb-3" />
            <div className="font-bold mb-1">98% Retention</div>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-border">
            <Globe className="w-6 h-6 text-primary mb-3" />
            <div className="font-bold mb-1">Global Reach</div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
