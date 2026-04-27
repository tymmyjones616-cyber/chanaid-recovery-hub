import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { LeadForm } from "@/components/site/LeadForm";
import { fetchService } from "@/lib/queries";
import { SERVICES_DATA } from "@/lib/services-data";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";
import { TiltCard } from "@/components/effects/TiltCard";
import { ServiceIcon } from "@/components/site/ServiceIcon";

export const Route = createFileRoute("/services/$slug")({
  head: ({ loaderData }) => {
    const service = loaderData?.service;
    if (!service) return {};
    return {
      meta: [
        { title: `${service.name} | ChanAidRecovery Hub | Expert Recovery Services` },
        { name: "description", content: service.shortDescription || service.short_description || `Professional recovery solutions for ${service.name} scams.` },
        { property: "og:title", content: service.name },
        { property: "og:description", content: service.shortDescription || service.short_description || `Professional recovery solutions for ${service.name} scams.` },
        { property: "og:image", content: service.heroImageUrl || service.hero_image_url },
      ],
      links: [
        { rel: "canonical", href: `https://chanaidrecovery.com/services/${service.slug}` }
      ]
    };
  },
  loader: async ({ params }) => {
    const d = await fetchService({ data: params.slug }).catch(() => null);
    if (d) return { service: d };
    // Fallback to local data if DB doesn't have it
    const fallback = SERVICES_DATA.find(item => item.slug === params.slug);
    return { service: fallback || null };
  },
  component: ServicePage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="max-w-2xl mx-auto py-24 text-center"><h1 className="text-3xl font-bold">Service not found</h1></div>
    </SiteShell>
  ),
});

function titleFromSlug(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ServicePage() {
  const { service: s } = Route.useLoaderData();
  const { slug } = Route.useParams();

  if (!s) throw notFound();

  return (
    <SiteShell>
      <section className="bg-hero-gradient py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-start relative">
          <Reveal direction="up">
            <div className="flex items-center gap-4 mb-4">
              <ServiceIcon name={s.icon} />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">{s.name}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">{s.heroHeadline || s.hero_headline}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{s.heroSubheadline || s.hero_subheadline}</p>
            {(s.successRate || s.success_rate) && (
              <div className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-border shadow-soft">
                <CheckCircle2 className="w-4 h-4 text-primary" /> 
                <span className="text-sm font-semibold">{s.successRate || s.success_rate} average success rate</span>
              </div>
            )}
          </Reveal>
          <Reveal direction="tilt" delay={120}>
            <TiltCard className="rounded-3xl" intensity={6}>
              <LeadForm defaultScamType={s.name.replace(" Recovery","").replace(" Scam Recovery","")} sourcePage={`/services/${slug}`} title="Free case review" />
            </TiltCard>
          </Reveal>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-20 space-y-12">
        {(s.problemDescription || s.problem_description) && (
          <Reveal direction="up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">The problem</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{s.problemDescription || s.problem_description}</p>
          </Reveal>
        )}
        {(s.recoveryProcess || s.recovery_process) && (
          <Reveal direction="up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How we recover your funds</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{s.recoveryProcess || s.recovery_process}</p>
          </Reveal>
        )}
        <Reveal direction="zoom">
          <div className="relative bg-cta-gradient rounded-3xl p-10 text-white text-center overflow-hidden shadow-elegant">
            <div aria-hidden className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/15 blur-3xl animate-float-slow" />
            <h2 className="text-3xl font-bold relative">Ready to get your money back?</h2>
            <Link to="/contact" className="relative inline-flex mt-6 bg-white text-primary font-semibold px-7 h-12 items-center rounded-full hover:scale-105 transition-transform">Start my case <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
