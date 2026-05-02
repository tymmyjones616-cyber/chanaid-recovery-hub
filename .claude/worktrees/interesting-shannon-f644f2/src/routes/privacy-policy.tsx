import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | ChanAidRecovery Hub" },
      { name: "description", content: "Learn how ChanAidRecovery Hub collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy | ChanAidRecovery Hub" },
      { property: "og:description", content: "Our privacy practices and commitment to your data security." },
    ],
  }),
  component: () => (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-4 py-16 prose prose-sm">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Information we collect</h2>
        <p className="text-muted-foreground">When you contact ChanAidRecovery we collect your name, email, phone number, and the details of your case so our specialists can assess and pursue recovery.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">How we use it</h2>
        <p className="text-muted-foreground">Information is used solely to evaluate your case, communicate with you, and pursue recovery on your behalf. We do not sell or rent your data.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Data protection</h2>
        <p className="text-muted-foreground">All client information is stored securely and accessed only by authorized staff under strict confidentiality.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Your rights</h2>
        <p className="text-muted-foreground">You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
      </section>
    </SiteShell>
  ),
});
