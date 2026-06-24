import type { Metadata } from "next";
import PageHero from "../_components/ui/PageHero";
import Reveal from "../_components/Reveal";
import Button from "../_components/ui/Button";

export const metadata: Metadata = {
  title: "Security — Treat",
  description:
    "Treat is built for security teams, so security is foundational — not an afterthought. SOC 2 Type II, encryption at rest and in transit, and a full trust center.",
};

const certifications = [
  { name: "SOC 2 Type II", description: "Audited annually by an independent third party across the Trust Services Criteria." },
  { name: "GDPR Compliant", description: "Data Processing Agreements available. EU data residency options for Business and Enterprise." },
  { name: "CCPA Ready", description: "Full data subject rights support including access, deletion, and portability requests." },
  { name: "ISO 27001", description: "Information security management system certified. In progress for latest cycle." },
];

const practices = [
  {
    icon: "🔐",
    title: "Encryption at rest and in transit",
    body: "All data is encrypted at rest using AES-256. All data in transit is encrypted via TLS 1.3. Encryption keys are managed through a dedicated KMS with automated rotation.",
  },
  {
    icon: "🛡️",
    title: "Zero standing access",
    body: "Treat engineers have no standing access to customer data. All production access is JIT (just-in-time), requires dual approval, and is fully logged with automatic expiry.",
  },
  {
    icon: "🔍",
    title: "Penetration testing",
    body: "Annual penetration tests by an independent third-party firm. Critical findings are remediated within 24 hours, high within 7 days. Reports available to Enterprise customers under NDA.",
  },
  {
    icon: "📋",
    title: "Audit logging",
    body: "Every action taken in Treat — by your team or by Treat systems — is immutably logged with actor, timestamp, and outcome. Logs are retained for 12 months by default.",
  },
  {
    icon: "🔑",
    title: "SSO and MFA",
    body: "SAML 2.0 SSO with any major identity provider (Okta, Entra ID, Google Workspace). MFA enforced for all users. Session management and device trust controls available on Enterprise.",
  },
  {
    icon: "🏗️",
    title: "Secure SDLC",
    body: "Security review is embedded in every release cycle. Static analysis, dependency scanning, and secrets detection run on every pull request. Production deploys require sign-off from two engineers.",
  },
];

const faqs = [
  {
    q: "Where is my data stored?",
    a: "Customer data is stored on AWS infrastructure in the US-East-1 region by default. EU data residency (EU-West-1) is available on Business and Enterprise plans.",
  },
  {
    q: "Can Treat employees see my security requests?",
    a: "No. Treat operates a strict data access policy. Engineers have no standing access to customer data. Any access for support purposes requires customer consent and is logged.",
  },
  {
    q: "How do I request a SOC 2 report?",
    a: "Business and Enterprise customers can request our SOC 2 Type II report by contacting your account manager or emailing security@treat.security. An NDA is required.",
  },
  {
    q: "Does Treat offer a Data Processing Agreement (DPA)?",
    a: "Yes. Our standard DPA is available for all plans. Custom DPA terms are negotiable on Enterprise plans. Contact security@treat.security to request one.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        label="Security"
        title="We're a security company."
        titleAccent="We act like one."
        description="Treat handles the most sensitive operational data in your business. Security isn't a checkbox for us — it's the product."
      >
        <Button href="mailto:security@treat.security">Contact security team</Button>
      </PageHero>

      {/* Certifications */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
              style={{ background: "var(--border)" }}
            >
              {certifications.map((c) => (
                <div key={c.name} className="p-7 flex flex-col gap-2" style={{ background: "var(--surface)" }}>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {c.name}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Practices */}
      <section className="px-6 py-16" style={{ background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center" style={{ color: "var(--text-primary)" }}>
              How we protect your data
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.08}>
                <div
                  className="p-7 rounded-2xl h-full"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <div className="text-2xl mb-4">{p.icon}</div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{p.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12" style={{ color: "var(--text-primary)" }}>
              Common questions
            </h2>
          </Reveal>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.06}>
                <div className="p-7 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{faq.q}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{faq.a}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-10 text-center">
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Have a security question not answered here?
              </p>
              <Button href="mailto:security@treat.security">
                Email security@treat.security
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
