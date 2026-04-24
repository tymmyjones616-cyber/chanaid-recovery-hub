import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ChanAidRecovery — Free Consultation" },
      { name: "description", content: "Talk to a recovery specialist. Free, confidential consultation. We respond within 24 hours." },
      { property: "og:title", content: "Contact ChanAidRecovery" },
      { property: "og:description", content: "Free, confidential consultation with a recovery specialist." },
    ],
  }),
  component: () => (
    <SiteShell>
      <section className="bg-hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold">Talk to a recovery specialist</h1>
            <p className="mt-4 text-lg text-muted-foreground">Tell us what happened. Our intake team responds within 24 hours with a free case assessment.</p>
          </div>
          <LeadForm sourcePage="/contact" />
        </div>
      </section>
    </SiteShell>
  ),
});