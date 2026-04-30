import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { fetchTestimonials, submitTestimonial } from "@/lib/queries";
import { Star, CheckCircle2, Loader2, Quote } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { TiltCard } from "@/components/effects/TiltCard";
import { InfiniteTestimonialCarousel } from "@/components/site/InfiniteTestimonialCarousel";
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

  // Split testimonials into THREE rows for an infinite triple-marquee effect.
  // Round up so the first rows soak up any remainder; cards are deterministically
  // distributed and survive empty corpora (Math.ceil(0/3) === 0).
  const total = items.length;
  const third = Math.ceil(total / 3);
  const row1 = items.slice(0, third);
  const row2 = items.slice(third, third * 2);
  const row3 = items.slice(third * 2);

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

      <section className="py-20 bg-white overflow-hidden space-y-4">
        {!items || items.length === 0 ? (
          <p className="text-center text-muted-foreground">No stories yet. Be the first to share!</p>
        ) : (
          <>
            <Reveal direction="up" delay={100}>
              <div>
                <InfiniteTestimonialCarousel
                  testimonials={row1}
                  speed={0.6}
                  direction="forward"
                />
              </div>
            </Reveal>
            {row2.length > 0 && (
              <Reveal direction="up" delay={250}>
                <div>
                  <InfiniteTestimonialCarousel
                    testimonials={row2}
                    speed={0.5}
                    direction="backward"
                  />
                </div>
              </Reveal>
            )}
            {row3.length > 0 && (
              <Reveal direction="up" delay={400}>
                <div>
                  <InfiniteTestimonialCarousel
                    testimonials={row3}
                    speed={0.7}
                    direction="forward"
                  />
                </div>
              </Reveal>
            )}
            
            <div className="max-w-7xl mx-auto px-4 mt-20 text-center">
              <Reveal direction="up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold mb-6">
                  <CheckCircle2 className="w-4 h-4" /> 1,200+ Verified Recovery Cases Worldwide
                </div>
                <h3 className="text-2xl font-bold mb-4">Every Story is a Victory Against Fraud</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our specialists have worked across 40+ countries to reclaim stolen assets. These testimonials represent just a fraction of the lives we've helped restore.
                </p>
              </Reveal>
            </div>
          </>
        )}
      </section>

      <section id="share" className="bg-soft-gradient py-24">
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
