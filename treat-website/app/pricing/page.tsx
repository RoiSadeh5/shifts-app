import type { Metadata } from "next";
import PageHero from "../_components/ui/PageHero";
import Button from "../_components/ui/Button";
import Reveal from "../_components/Reveal";

export const metadata: Metadata = {
  title: "Pricing — Treat",
  description:
    "Flexible plans for security teams of every size. From growing teams to global enterprises.",
};

const tiers = [
  {
    name: "Team",
    tagline: "For growing security teams getting organized.",
    price: "Contact us",
    cta: "Start a trial",
    featured: false,
    features: [
      "Unified request queue",
      "Up to 10 analyst seats",
      "5 core integrations",
      "AI context engine",
      "Standard workflows",
      "Email support",
    ],
  },
  {
    name: "Business",
    tagline: "For established teams that need consistency at scale.",
    price: "Contact us",
    cta: "Request a Demo",
    featured: true,
    features: [
      "Everything in Team",
      "Unlimited analyst seats",
      "Unlimited integrations",
      "Custom expert workflows",
      "Advanced metrics & reporting",
      "SSO + role-based access",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For global organizations with complex requirements.",
    price: "Custom",
    cta: "Talk to sales",
    featured: false,
    features: [
      "Everything in Business",
      "Dedicated success manager",
      "Custom data residency",
      "On-prem / private cloud options",
      "Advanced audit & compliance",
      "Custom SLAs",
      "24/7 white-glove support",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        label="Pricing"
        title="Plans that scale"
        titleAccent="with your team."
        description="Treat is priced for the value it delivers — analyst hours reclaimed and risk resolved faster. Every plan includes onboarding from our security team."
      />

      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08} className="h-full">
              <div
                className="relative p-8 rounded-3xl h-full flex flex-col"
                style={{
                  background: tier.featured
                    ? "linear-gradient(180deg, rgba(99,102,241,0.08), var(--surface))"
                    : "var(--surface)",
                  border: tier.featured
                    ? "1px solid rgba(99,102,241,0.4)"
                    : "1px solid var(--border)",
                  boxShadow: tier.featured
                    ? "0 0 40px rgba(99,102,241,0.12)"
                    : "none",
                }}
              >
                {tier.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    Most popular
                  </div>
                )}

                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tier.name}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed min-h-[40px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {tier.tagline}
                </p>

                <div className="mt-6 mb-6">
                  <span
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {tier.price}
                  </span>
                </div>

                <Button
                  href="/demo"
                  variant={tier.featured ? "primary" : "secondary"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>

                <ul className="mt-8 flex flex-col gap-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]"
                        style={{
                          background: "rgba(99,102,241,0.15)",
                          color: "var(--accent)",
                          border: "1px solid rgba(99,102,241,0.3)",
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p
            className="mt-10 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            All plans include SOC 2 Type II compliance, data encryption at rest
            and in transit, and a dedicated onboarding session.
          </p>
        </Reveal>
      </section>
    </>
  );
}
