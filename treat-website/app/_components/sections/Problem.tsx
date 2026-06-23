const stats = [
  {
    value: "73%",
    label: "of security requests get lost across Slack, email, and ticketing systems",
  },
  {
    value: "4.5 hrs",
    label: "per day spent by analysts on manual triage instead of actual threats",
  },
  {
    value: "3×",
    label: "faster response when context is surfaced automatically, without detective work",
  },
];

export default function Problem() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5 text-center"
          style={{ color: "var(--accent)" }}
        >
          The Problem
        </p>

        <h2
          className="text-3xl md:text-5xl font-bold tracking-tight text-center max-w-3xl mx-auto leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Your security team is{" "}
          <span className="text-gradient-accent">drowning in noise</span>
        </h2>

        <p
          className="mt-5 text-center text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Requests arrive from everywhere — Slack DMs, email, Jira tickets,
          SIEM alerts. There&apos;s no single source of truth, no consistent
          prioritization, and analysts spend more time finding context than
          actually fixing anything.
        </p>

        {/* Stat grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div
              key={s.value}
              className="p-8 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-5xl font-bold tracking-tight text-gradient-accent"
              >
                {s.value}
              </p>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
