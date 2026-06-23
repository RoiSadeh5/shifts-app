"use client";

const features = [
  {
    icon: "⚡",
    title: "Unified Request Queue",
    description:
      "Every request — from Slack, email, Jira, PagerDuty, and more — lands in one risk-prioritized queue. No more context switching. No more lost tickets.",
    highlight: "Zero fragmentation",
  },
  {
    icon: "🧠",
    title: "AI Context Engine",
    description:
      "Before you open a request, Treat has already surfaced the relevant policy, asset data, past decisions, and institutional precedents. Zero detective work.",
    highlight: "Instant context",
  },
  {
    icon: "⚙️",
    title: "Expert Workflow Automation",
    description:
      "Expert-built workflows mirror your exact security policies, ensuring every decision is consistent across every analyst, team, and timezone.",
    highlight: "Policy-consistent",
  },
  {
    icon: "📊",
    title: "Real Operational Metrics",
    description:
      "Finally, factual data on your team's performance. Track average MTTR, time spent per risk type, and throughput — in real time.",
    highlight: "Actual visibility",
  },
  {
    icon: "🔌",
    title: "Stack Activation",
    description:
      "Treat doesn't replace your existing tools. It unlocks the context trapped in your ITSM, SIEM, cloud, and identity systems and bridges the gap to policy.",
    highlight: "Works with your stack",
  },
  {
    icon: "🛡️",
    title: "Risk-Aware Prioritization",
    description:
      "Not all requests are equal. Treat scores and ranks every item using business context, asset criticality, and threat intelligence — so teams always know what to do next.",
    highlight: "Always prioritized",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5 text-center"
          style={{ color: "var(--accent)" }}
        >
          The Platform
        </p>

        <h2
          className="text-3xl md:text-5xl font-bold tracking-tight text-center max-w-3xl mx-auto leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Everything your team needs.{" "}
          <span className="text-gradient-accent">Nothing it doesn&apos;t.</span>
        </h2>

        <p
          className="mt-5 text-center text-lg max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Treat is purpose-built for security operations teams that need to
          move at business speed without losing posture.
        </p>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-7 rounded-2xl transition-all duration-300"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.3)";
                (e.currentTarget as HTMLDivElement).style.background = "var(--surface-raised)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
              }}
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <div
                className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  color: "var(--accent)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                {f.highlight}
              </div>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
