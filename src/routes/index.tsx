import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { LeadForm } from "@/components/site/LeadForm";
import { fetchServices, fetchTestimonials, fetchFaqs } from "@/lib/queries";
import { ShieldCheck, Search, FileCheck2, Banknote, Star, ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { TiltCard } from "@/components/effects/TiltCard";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { useScrollY } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChanAidRecovery — Recover Funds Lost to Online Scams" },
      { name: "description", content: "ChanAidRecovery helps victims of crypto, forex, binary options and other online scams recover their funds. Free consultation. No recovery, no fee." },
      { property: "og:title", content: "ChanAidRecovery — Funds Recovery Experts" },
      { property: "og:description", content: "Recover funds lost to online scams. Free consultation. No recovery, no fee." },
    ],
  }),
  component: Index,
});

function Index() {
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const scrollY = useScrollY();
  useEffect(() => {
    fetchServices().then(setServices);
    fetchTestimonials({ featuredOnly: true, limit: 3 }).then(setTestimonials);
    fetchFaqs(5).then(setFaqs);
  }, []);

  return (
    <SiteShell>
      {/* Hero with parallax 3D backdrop */}
      <section className="relative bg-hero-gradient overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translate3d(0, ${scrollY * 0.25}px, 0)` }}
        >
          <div className="absolute top-10 left-[10%] h-40 w-40 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-elegant rotate-12 animate-float-slow" />
          <div className="absolute top-32 right-[8%] h-28 w-28 rounded-full bg-white/50 backdrop-blur-xl border border-white/60 shadow-soft animate-float-slower" />
          <div className="absolute bottom-20 left-[35%] h-20 w-20 rounded-2xl bg-white/40 backdrop-blur border border-white/60 -rotate-12 animate-float-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal direction="up">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-primary border border-border shadow-soft">
              <Sparkles className="w-3.5 h-3.5" /> Asset & Funds Recovery Experts
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Get Your Money Back from <span className="text-gradient">Online Scams</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              ChanAidRecovery helps victims of crypto, forex, binary options and other online financial scams reclaim their funds fast.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="group inline-flex items-center gap-2 bg-cta-gradient text-white font-semibold px-6 h-12 rounded-full shadow-elegant hover:scale-[1.03] hover:-translate-y-0.5 transition-all">
                Free consultation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link to="/loans" className="relative group inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 h-12 rounded-full border-2 border-primary hover:bg-primary hover:text-white transition-all hover:-translate-y-0.5 overflow-visible">
                <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-40 pointer-events-none" />
                Get a loan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link to="/success-calculator" className="inline-flex items-center bg-white/90 backdrop-blur text-foreground font-semibold px-6 h-12 rounded-full border border-border hover:border-primary hover:-translate-y-0.5 transition-all">
                Estimate my recovery
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-8 text-sm text-muted-foreground">
              <div><span className="block text-2xl font-bold text-gradient">$5M+</span>recovered</div>
              <div><span className="block text-2xl font-bold text-gradient">10K+</span>cases</div>
              <div><span className="block text-2xl font-bold text-gradient">85%</span>success rate</div>
            </div>
          </Reveal>
          <Reveal direction="tilt" delay={120}>
            <TiltCard className="rounded-3xl" intensity={6}>
              <div className="rounded-3xl">
                <LeadForm sourcePage="/" />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* Services with real icons + 3D tilt */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal direction="up">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold">Scams we help our clients <span className="text-gradient">recover from</span></h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Specialized recovery for every type of online financial fraud, handled by experts.</p>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
          {services.map((s, idx) => (
            <Reveal key={s.id} direction="up" delay={idx * 70}>
              <TiltCard className="rounded-2xl h-full" intensity={9}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group block bg-white p-6 rounded-2xl border border-border shadow-soft hover:shadow-elegant transition-shadow h-full"
                >
                  <ServiceIcon name={s.icon} className="mb-5" />
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.short_description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">
                    Learn more
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-soft-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold">How it <span className="text-gradient">works</span></h2>
              <p className="mt-4 text-muted-foreground">From first contact to recovery — a clear, four-step process.</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
            {[
              { i: Search, t: "Free case review", d: "Tell us what happened. We assess feasibility within 24 hours." },
              { i: FileCheck2, t: "Build the file", d: "Our team gathers evidence and documents the fraud." },
              { i: ShieldCheck, t: "Pursue recovery", d: "Chargebacks, regulatory complaints, and legal pressure." },
              { i: Banknote, t: "Funds returned", d: "Recovered funds are released directly to your account." },
            ].map((step, idx) => (
              <Reveal key={idx} direction="up" delay={idx * 100}>
                <TiltCard className="rounded-2xl h-full" intensity={8}>
                  <div className="bg-white rounded-2xl p-7 border border-border shadow-soft text-center h-full">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-cta-gradient text-white flex items-center justify-center mb-4 shadow-elegant">
                      <step.i className="w-7 h-7" strokeWidth={2.2} />
                    </div>
                    <div className="text-xs font-bold text-primary mb-1 tracking-widest">STEP {idx + 1}</div>
                    <h3 className="font-semibold text-lg">{step.t}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold">Real recoveries. <span className="text-gradient">Real people.</span></h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6 perspective-1000">
          {testimonials.map((t, idx) => (
            <Reveal key={t.id} direction="up" delay={idx * 120}>
              <TiltCard className="rounded-2xl h-full" intensity={7}>
                <div className="bg-white rounded-2xl p-6 border border-border shadow-soft h-full">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                  <p className="text-sm text-foreground/90">"{t.quote}"</p>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm">{t.client_name}</div>
                      <div className="text-xs text-muted-foreground">{t.location}</div>
                    </div>
                    {t.amount_recovered && <div className="text-sm font-bold text-gradient">{t.amount_recovered}</div>}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/testimonials" className="text-primary font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">See all stories <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-soft-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.id} className="group bg-white rounded-xl border border-border p-5">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {f.question}
                  <span className="ml-4 text-primary group-open:rotate-180 transition">▾</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal direction="zoom">
          <div className="relative bg-cta-gradient rounded-3xl p-10 sm:p-16 text-white shadow-elegant overflow-hidden">
            <div aria-hidden className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/15 blur-3xl animate-float-slow" />
            <div aria-hidden className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float-slower" />
            <h2 className="relative text-3xl sm:text-5xl font-bold">Let's get your money back</h2>
            <p className="relative mt-3 text-white/90 max-w-2xl mx-auto">Free consultation. No obligation. We only get paid when you do.</p>
            <Link to="/contact" className="relative inline-flex mt-8 bg-white text-primary font-semibold px-8 h-12 items-center rounded-full shadow-soft hover:scale-105 transition-transform">
              Start my case <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
