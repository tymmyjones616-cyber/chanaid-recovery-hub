import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { fetchTestimonials, submitTestimonial } from "@/lib/queries";
import { Star, CheckCircle2, Loader2, Quote } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { TiltCard } from "@/components/effects/TiltCard";
import { toast } from "sonner";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Client Testimonials | ChanAidRecovery Hub Success Stories" },
      { name: "description", content: "Real success stories from clients who recovered their stolen crypto and funds with ChanAidRecovery Hub. $500M+ recovered worldwide." },
      { property: "og:title", content: "ChanAidRecovery Hub Client Success Stories" },
      { property: "og:description", content: "Real recoveries from real clients. See how we help victims of crypto fraud reclaim their assets." },
    ],
  }),
  loader: async () => await fetchTestimonials().catch(() => []),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const items = Route.useLoaderData();

  return (
    <SiteShell>
      <section className="relative bg-hero-gradient py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <Reveal direction="up">
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
              Real people. <span className="text-gradient">Real recoveries.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Read how our clients reclaimed their money from online scammers - then share your own story below.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        {!items || items.length === 0 ? (
          <p className="text-center text-muted-foreground">No stories yet. Be the first to share!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
            {items.map((t: any, idx: number) => (
              <Reveal key={t.id} direction="up" delay={(idx % 6) * 80}>
                <TiltCard className="rounded-2xl h-full" intensity={6}>
                  <div className="relative bg-white rounded-2xl p-7 border border-border shadow-soft h-full">
                    <Quote className="absolute top-5 right-5 w-8 h-8 text-primary/15" />
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">"{t.quote}"</p>
                    <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-sm">{t.clientName}</div>
                        <div className="text-xs text-muted-foreground">{t.location}</div>
                      </div>
                      {t.amountRecovered && (
                        <div className="text-sm font-bold text-gradient">{t.amountRecovered}</div>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section id="share" className="bg-soft-gradient py-20">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal direction="up">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Share <span className="text-gradient">your story</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                Recovered funds with us? Tell others. Submissions are reviewed by our team before being published.
              </p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={120}>
            <SubmitTestimonialForm />
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}

function SubmitTestimonialForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Honeypot - if filled, silently succeed (it's a bot)
    if (fd.get("website")) {
      setSubmitted(true);
      return;
    }

    const payload = {
      clientName: String(fd.get("client_name") ?? "").trim(),
      email: (String(fd.get("email") ?? "").trim() || null) as string | null,
      location: (String(fd.get("location") ?? "").trim() || null) as string | null,
      scamType: (String(fd.get("scam_type") ?? "").trim() || null) as string | null,
      amountRecovered: (String(fd.get("amount_recovered") ?? "").trim() || null) as string | null,
      quote: String(fd.get("quote") ?? "").trim(),
      rating,
      consentToPublish: fd.get("consent") === "on",
      status: "pending",
      sourcePage: "/testimonials",
    };

    if (payload.clientName.length < 2) return toast.error("Please enter your name.");
    if (payload.quote.length < 10) return toast.error("Please write at least a few sentences.");
    if (!payload.consentToPublish) return toast.error("Please confirm we may publish your story.");

    setSubmitting(true);
    const { error } = await submitTestimonial({ data: payload });
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't submit your story. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Thank you! Your story has been received.");
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-elegant p-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold">Thank you!</h3>
        <p className="mt-2 text-muted-foreground">
          Your story has been received. Our team will review it before publishing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-border shadow-elegant p-6 sm:p-8 space-y-5">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name *" name="client_name" required />
        <Field label="Email (private)" name="email" type="email" />
        <Field label="Location" name="location" placeholder="City, Country" />
        <Field label="Scam type" name="scam_type" placeholder="e.g. Cryptocurrency" />
      </div>

      <Field label="Amount recovered" name="amount_recovered" placeholder="e.g. $58,000" />

      <div>
        <label className="block text-sm font-medium mb-2">Your rating</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="p-1 rounded hover:scale-110 transition"
            >
              <Star className={`w-7 h-7 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="quote" className="block text-sm font-medium mb-2">Your story *</label>
        <textarea
          id="quote"
          name="quote"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Tell us how ChanAidRecovery Hub helped you…"
          className="w-full rounded-xl border border-input bg-white px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-1 accent-primary" />
        <span>
          I confirm this is my own honest experience and I agree that ChanAidRecovery Hub may publish my name, location and story on this site.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-cta-gradient text-white font-semibold h-12 rounded-full shadow-soft hover:shadow-elegant hover:scale-[1.01] transition-all disabled:opacity-60"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {submitting ? "Submitting…" : "Submit my story"}
      </button>
      <p className="text-xs text-muted-foreground text-center">
        Submissions are reviewed before being published. We never share your email.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
      />
    </div>
  );
}
