const steps = [
  {
    number: "01",
    title: "Connect your stack",
    description:
      "Treat integrates with every tool your team already uses — Slack, Jira, PagerDuty, Splunk, CrowdStrike, Okta, AWS, and more. Setup takes minutes, not months.",
    detail: "100+ integrations. No rip-and-replace.",
  },
  {
    number: "02",
    title: "Requests flow in automatically",
    description:
      "Every security request — regardless of source — arrives in Treat's unified queue. AI agents immediately score each item by risk, surface context, and link related events.",
    detail: "Slack DMs, Jira tickets, email, alerts — all in one place.",
  },
  {
    number: "03",
    title: "AI does the heavy lifting",
    description:
      "Before an analyst even opens a ticket, Treat has already pulled the relevant policy, the asset owner, prior decisions on similar requests, and a suggested workflow.",
    detail: "From hours of research to seconds.",
  },
  {
    number: "04",
    title: "Teams execute with confidence",
    description:
      "Analysts follow expert-built workflows tailored to your policies. Every decision is logged, consistent, and measurable — across every team and timezone.",
    detail: "Consistent decisions at business speed.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-28 px-6"
      style={{ background: "var(--surface)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5 text-center"
          style={{ color: "var(--accent)" }}
        >
          How It Works
        </p>

        <h2
          className="text-3xl md:text-5xl font-bold tracking-tight text-center max-w-3xl mx-auto leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          From chaos to clarity{" "}
          <span className="text-gradient-accent">in four steps</span>
        </h2>

        {/* Steps */}
        <div className="mt-20 flex flex-col gap-0">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative flex flex-col md:flex-row gap-8 md:gap-16 py-12"
              style={{
                borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              {/* Number */}
              <div className="md:w-32 shrink-0 flex md:flex-col items-center md:items-start gap-4 md:gap-2">
                <span
                  className="text-5xl font-bold tabular-nums"
                  style={{ color: "rgba(99,102,241,0.25)", fontVariantNumeric: "tabular-nums" }}
                >
                  {step.number}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block w-px flex-1 mt-2 self-start ml-4"
                    style={{
                      background: "linear-gradient(to bottom, rgba(99,102,241,0.3), transparent)",
                      height: "48px",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3
                  className="text-xl md:text-2xl font-semibold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-base leading-relaxed mb-4 max-w-xl"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.description}
                </p>
                <div
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
