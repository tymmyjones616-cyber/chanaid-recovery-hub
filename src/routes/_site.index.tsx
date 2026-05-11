import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { LeadForm } from "@/components/site/LeadForm";
import { SERVICES_DATA } from "@/lib/services-data";
import { ArrowRight, Sparkles, Calculator } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { TiltCard } from "@/components/effects/TiltCard";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { useScrollY } from "@/hooks/use-reveal";
import { ForbesLogo, BloombergLogo, ReutersLogo, CnbcLogo, FtLogo, BbcLogo } from "@/components/site/MediaLogos";
import { InfiniteTestimonialCarousel } from "@/components/site/InfiniteTestimonialCarousel";
import { SITE_STATS, ASSETS } from "@/lib/constants";
import { useAuth } from "@/components/layout/AuthContext";
import { AuthModal } from "@/components/layout/AuthModal";
import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

// ─── Fallback services when database is empty ────────────────────────────────
const FALLBACK_SERVICES = SERVICES_DATA;

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Crypto Recovery Experts | Reclaim Stolen BTC & USDT" },
      { name: "description", content: "ChanAidRecovery Hub provides expert crypto recovery services for victims of scams worldwide. Reclaim stolen Bitcoin, Ethereum, and USDT with our forensic specialists. $500M+ recovered. No upfront fees." },
      { property: "og:title", content: "ChanAidRecovery Hub | Professional Asset & Funds Recovery Services" },
      { property: "og:description", content: "Reclaim stolen crypto assets with our expert forensic investigators. Global leader in blockchain tracing and legal recovery services." },
      { name: "keywords", content: "crypto recovery services USA, stolen bitcoin recovery UK, USDT recovery Australia, crypto scam refund Canada, pig butchering recovery UAE, blockchain forensics, FCA broker chargeback, IC3 cryptocurrency complaint, Action Fraud crypto, Scamwatch recovery, AFCA crypto dispute, romance scam recovery, forex fraud refund, ChatGPT crypto recovery 2024, AI Overview crypto recovery" },
    ],
    links: [
      { rel: "canonical", href: "https://chanaidrecovery.com/" }
    ],
  }),
  component: Index,
});

function Index() {
  const scrollY = useScrollY();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Client-side data — avoids SSR Supabase calls that exceed Workers Free 10ms CPU limit
  const [services, setServices] = useState<any[]>(FALLBACK_SERVICES);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    const sb = getSupabaseBrowser();

    // Fetch services
    sb.from("services")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const merged = Array.from(
            new Map([...FALLBACK_SERVICES, ...data].map(s => [s.slug, s])).values()
          ).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setServices(merged);
        }
      });

    // Fetch featured testimonials
    sb.from("testimonials")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const unique = Array.from(
            new Map(data.map((t: any) => [t.quote || t.id, t])).values()
          ).sort(() => Math.random() - 0.5);
          setTestimonials(unique);
        }
      });

    // Fetch FAQs
    sb.from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setFaqs(data);
        }
      });
  }, []);

  const handleAction = (to: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = to;
  };

  return (
    <>
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
          <div>
            <Reveal direction="up">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-primary border border-border shadow-soft">
                <Sparkles className="w-3.5 h-3.5" /> Asset & Funds Recovery Experts
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Professional <span className="text-gradient">Crypto Recovery Services</span> | Reclaim Stolen Assets Today
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                Every hour you wait, scammers move your money further out of reach. Our specialists have recovered over {SITE_STATS.TOTAL_RECOVERED_HERO} for victims just like you - with zero upfront cost.
              </p>
            </Reveal>

            <div className="mt-8 flex flex-wrap gap-3">
              <button 
                onClick={() => handleAction("/contact")}
                className="group inline-flex items-center gap-2 bg-cta-gradient text-white font-semibold px-8 h-12 rounded-full shadow-elegant hover:scale-105 transition-all"
              >
                Free consultation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
              <button
                onClick={() => handleAction("/loans")}
                className="group inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 h-12 rounded-full border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-soft"
              >
                Apply for a loan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
              <Link
                to="/success-calculator"
                className="group inline-flex items-center gap-2 bg-white/80 backdrop-blur text-slate-700 font-semibold px-6 h-12 rounded-full border border-slate-200 hover:border-primary hover:text-primary transition-all shadow-soft"
              >
                <Calculator className="w-4 h-4" /> Recovery Calculator
              </Link>
            </div>

            <Reveal direction="up" delay={200}>
              <div className="mt-8 flex items-center gap-8 text-sm text-muted-foreground">
                <div><span className="block text-2xl font-bold text-gradient">{SITE_STATS.TOTAL_RECOVERED}</span>recovered</div>
                <div><span className="block text-2xl font-bold text-gradient">{SITE_STATS.CASES_HANDLED_HERO}</span>cases</div>
                <div><span className="block text-2xl font-bold text-gradient">{SITE_STATS.SUCCESS_RATE}</span>clients recommend us</div>
              </div>
            </Reveal>
          </div>
          <Reveal direction="tilt" delay={120}>
            <TiltCard className="rounded-3xl" intensity={6}>
              <div className="rounded-3xl">
                <LeadForm sourcePage="/" />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
            <div className="flex-1">
              <Reveal direction="right">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider uppercase mb-6">
                  Who We Are
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
                  The Global Standard for <span className="text-gradient">Asset Recovery</span> and Fraud Prevention
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground">
                  <p>
                    ChanAid Recovery Hub was founded with a singular mission: to provide victims of financial fraud with the legal and technical expertise needed to reclaim what is theirs. We specialize in complex cases involving cryptocurrency, forex scams, and corporate fraud.
                  </p>
                </div>
                <div className="mt-10 flex flex-wrap gap-8">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">{SITE_STATS.TOTAL_RECOVERED}</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-widest">Recovered</div>
                  </div>
                  <div className="w-px h-12 bg-border hidden sm:block" />
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">12K+</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-widest">Clients Helped</div>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="flex-1 relative">
              <Reveal direction="left" delay={200}>
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50">
                  <img 
                    src={ASSETS.HERO_IMAGE} 
                    alt="Cyber Security Forensic Analysis" 
                    className="w-full h-auto"
                  />
                </div>
              </Reveal>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { name: "Marcus Thorne", role: "Head of Forensics", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" },
              { name: "Elena Rodriguez", role: "Legal Counsel", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" },
              { name: "David Chen", role: "Cybersecurity Lead", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
            ].map((expert, i) => (
              <Reveal key={i} direction="up" delay={i * 100}>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-border">
                  <img src={expert.image} alt={expert.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <div className="font-bold text-slate-900">{expert.name}</div>
                    <div className="text-xs text-primary font-semibold uppercase tracking-wider">{expert.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By / As Seen In */}
      <section className="py-12 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">Trusted by victims worldwide · Featured in</p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 sm:gap-x-16 gap-y-8">
            <ForbesLogo className="h-6 sm:h-7 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <BloombergLogo className="h-6 sm:h-7 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <ReutersLogo className="h-6 sm:h-7 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <CnbcLogo className="h-7 sm:h-8 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <FtLogo className="h-7 sm:h-8 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <BbcLogo className="h-6 sm:h-7 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
          </div>
        </div>
      </section>

      {/* Services with real icons + 3D tilt */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal direction="up">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold">If They Stole It, We Know <span className="text-gradient">How to Get It Back</span></h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Our investigators are former financial regulators and cybercrime specialists. No scam is too complex, no amount too large.</p>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
          {services.slice(0, 4).map((s: any, idx: number) => (
            <Reveal key={s.slug} direction="up" delay={idx * 70}>
              <TiltCard className="rounded-2xl h-full" intensity={9}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group block bg-white p-6 rounded-2xl border border-border shadow-soft hover:shadow-elegant transition-shadow h-full"
                >
                  <ServiceIcon name={s.icon} className="mb-5" />
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.shortDescription || s.short_description}</p>
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
              <p className="mt-4 text-muted-foreground">From first contact to recovery: a clear, four-step process.</p>
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

      {/* Testimonials Carousel */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold">Real recoveries. <span className="text-gradient">Real people.</span></h2>
              <p className="mt-4 text-muted-foreground">Stories of hope and financial restoration from our global clients.</p>
            </div>
          </Reveal>

          <InfiniteTestimonialCarousel testimonials={testimonials} speed={0.5} direction="forward" />

          <div className="text-center mt-12">
            <Link to="/testimonials" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all group">
              See all 1,200+ success stories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ - SEO & GEO Optimized */}
      <section className="py-24 bg-soft-gradient" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Expert <span className="text-primary">Crypto Recovery</span> FAQ
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Common questions about recovering scammed funds in the USA, UK, Australia, Canada, and the UAE.
            </p>
          </div>
          
          <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
            {faqs.map((f: any) => (
              <div
                key={f.id ?? f.question}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all shadow-sm"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer list-none font-bold text-lg">
                    <span itemProp="name">{f.question}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-open:bg-primary group-open:text-white transition-colors">
                      <span className="text-xl group-open:rotate-180 transition-transform duration-300">▾</span>
                    </div>
                  </summary>
                  <div
                    className="px-6 pb-6 text-muted-foreground leading-relaxed"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <span itemProp="text">{f.answer}</span>
                  </div>
                </details>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">Didn't find your answer? Our global recovery specialists are available 24/7.</p>
            <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20">
              Speak to a Specialist
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal direction="zoom">
          <div className="relative bg-cta-gradient rounded-3xl p-10 sm:p-16 text-white shadow-elegant overflow-hidden">
            <div aria-hidden className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/15 blur-3xl animate-float-slow" />
            <div aria-hidden className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float-slower" />
            <h2 className="relative text-3xl sm:text-5xl font-bold">The Window to Recovery Is Narrow | Act Before It Closes</h2>
            <p className="relative mt-3 text-white/90 max-w-2xl mx-auto">Free consultation. No obligation. We only get paid when you do.</p>
            <button 
              onClick={() => handleAction("/contact")}
              className="relative inline-flex mt-8 bg-white text-primary font-semibold px-8 h-12 items-center rounded-full shadow-soft transition-transform hover:scale-105"
            >
              Start my case <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </Reveal>
      </section>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultMode={authMode} />
    </>
  );
}

// ─── Manual Imports for Icons ────────────────────────────────────────────────
import { ShieldCheck, Search, FileCheck2, Banknote, Send } from "lucide-react";
