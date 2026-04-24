import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const schema = z.object({
  first_name: z.string().trim().min(1, "Required").max(100),
  last_name: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  amount_lost: z.string().trim().max(50).optional().or(z.literal("")),
  scam_type: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
});

type Props = {
  variant?: "card" | "inline";
  defaultScamType?: string;
  sourcePage?: string;
  title?: string;
  subtitle?: string;
};

export function LeadForm({ variant = "card", defaultScamType, sourcePage, title = "Start your free case review", subtitle = "Tell us what happened. We'll respond within 24 hours." }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    // Honeypot
    if ((fd.get("website") as string)?.length) { setDone(true); return; }
    const payload = {
      first_name: fd.get("first_name") as string,
      last_name: (fd.get("last_name") as string) || "",
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || "",
      amount_lost: (fd.get("amount_lost") as string) || "",
      scam_type: (fd.get("scam_type") as string) || defaultScamType || "",
      message: (fd.get("message") as string) || "",
      source_page: sourcePage ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
      toast.success("Thank you — we'll be in touch shortly.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className={`rounded-2xl ${variant === "card" ? "bg-white shadow-elegant p-8" : "p-6"} text-center`}>
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Thanks — we got your message</h3>
        <p className="text-muted-foreground text-sm">A recovery specialist will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`rounded-2xl ${variant === "card" ? "bg-white shadow-elegant p-6 sm:p-8 border border-border" : "p-0"}`}
    >
      {title && <h3 className="text-xl font-bold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field name="first_name" placeholder="First name *" error={errors.first_name} required />
        <Field name="last_name" placeholder="Last name" error={errors.last_name} />
        <Field name="email" type="email" placeholder="Email *" error={errors.email} required />
        <Field name="phone" placeholder="Phone" error={errors.phone} />
        <Field name="amount_lost" placeholder="Amount lost (e.g. $5,000)" error={errors.amount_lost} />
        <select name="scam_type" defaultValue={defaultScamType ?? ""} className="h-11 rounded-lg border border-input bg-white px-3 text-sm">
          <option value="">Type of scam</option>
          <option>Cryptocurrency</option>
          <option>Binary Options</option>
          <option>Forex</option>
          <option>Stock Trading</option>
          <option>Credit Card Phishing</option>
          <option>Property Scams</option>
          <option>Romance Scams</option>
          <option>Other</option>
        </select>
      </div>
      <textarea
        name="message"
        placeholder="Briefly describe what happened…"
        rows={4}
        className="mt-3 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
      />
      {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-cta-gradient text-white font-semibold h-12 rounded-full shadow-soft hover:shadow-elegant transition disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Get my free consultation
      </button>
      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        By submitting you agree to our privacy policy. No recovery, no fee.
      </p>
    </form>
  );
}

function Field({ name, placeholder, type = "text", error, required }: { name: string; placeholder: string; type?: string; error?: string; required?: boolean }) {
  return (
    <div>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}