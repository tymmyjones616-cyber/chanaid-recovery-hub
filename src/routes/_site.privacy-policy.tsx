import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";

// Static date — bumped manually when the policy changes. Avoids SSR/CSR
// hydration mismatch from `new Date()` in render.
const LAST_UPDATED = "29 April 2024";

export const Route = createFileRoute("/_site/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | ChanAidRecovery Hub" },
      { name: "description", content: "Learn how ChanAidRecovery Hub collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy | ChanAidRecovery Hub" },
      { property: "og:description", content: "Our privacy practices and commitment to your data security." },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-16 prose prose-sm">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Who we are</h2>
        <p className="text-muted-foreground">
          This privacy notice describes how ChanAidRecovery Hub ("we", "us") processes personal data of visitors and clients.
          For privacy questions, contact us at <a href="mailto:support@chanaidrecovery.com">support@chanaidrecovery.com</a>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Information we collect</h2>
        <ul className="text-muted-foreground list-disc pl-6 space-y-1">
          <li>Contact details you provide on enquiry forms (name, email, phone, country).</li>
          <li>Case details you choose to share (incident description, amount lost, scam type).</li>
          <li>Identity verification documents you upload when applying for services that require KYC.</li>
          <li>Limited technical data collected automatically: IP address, user-agent, and timestamp of submissions, used for fraud prevention and audit logging.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Lawful basis (UK/EU GDPR)</h2>
        <p className="text-muted-foreground">
          We rely on (a) <em>contract</em> — to take steps requested by you prior to entering an engagement; (b) <em>legitimate interests</em> — to operate the website, communicate, and prevent fraud; and (c) <em>legal obligation</em> — where we must comply with anti-money-laundering, sanctions, or court orders.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. How we use it</h2>
        <p className="text-muted-foreground">
          To assess your case, communicate with you, deliver agreed services, comply with legal obligations, and improve the service. We do not sell or rent your personal data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Sharing</h2>
        <p className="text-muted-foreground">
          Personal data may be shared with: cloud-infrastructure providers that host this website; payment and identity-verification processors strictly necessary to deliver services; and law-enforcement or regulators where required by law. We do not transfer your data to advertisers.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. International transfers</h2>
        <p className="text-muted-foreground">
          Where personal data leaves your jurisdiction, we rely on appropriate safeguards (Standard Contractual Clauses or equivalent) with our processors.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Retention</h2>
        <p className="text-muted-foreground">
          Enquiry data is retained for up to 24 months unless you become a client, in which case engagement records are retained for the period required by applicable financial-services and tax law (typically 6–7 years), then securely deleted.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Security</h2>
        <p className="text-muted-foreground">
          We use TLS in transit, restricted-access infrastructure, and audit logging. No system is perfectly secure; if a breach affects you, we will notify the relevant supervisory authority and affected individuals as required by law.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">9. Your rights</h2>
        <p className="text-muted-foreground">
          Subject to applicable law, you may request access, correction, deletion, restriction, portability, and to object to processing. UK/EU residents may complain to a supervisory authority (e.g. the UK ICO). California residents have rights under the CCPA/CPRA including the right to know, delete, and opt-out of any sale or share (we do not sell or share for cross-context behavioural advertising).
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">10. Contact</h2>
        <p className="text-muted-foreground">
          To exercise any right, email <a href="mailto:support@chanaidrecovery.com">support@chanaidrecovery.com</a>. We will respond within statutory deadlines.
        </p>
      </section>
    </>
  );
}
