"use client";

const integrations = [
  { name: "Slack", category: "Communication" },
  { name: "Jira", category: "ITSM" },
  { name: "PagerDuty", category: "Alerting" },
  { name: "Splunk", category: "SIEM" },
  { name: "CrowdStrike", category: "EDR" },
  { name: "Okta", category: "Identity" },
  { name: "Microsoft Defender", category: "Security" },
  { name: "ServiceNow", category: "ITSM" },
  { name: "AWS Security Hub", category: "Cloud" },
  { name: "Google Cloud SCC", category: "Cloud" },
  { name: "Sentinel", category: "SIEM" },
  { name: "Wiz", category: "Cloud Security" },
];

export default function Integrations() {
  return (
    <section id="integrations" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5 text-center"
          style={{ color: "var(--accent)" }}
        >
          Integrations
        </p>

        <h2
          className="text-3xl md:text-5xl font-bold tracking-tight text-center max-w-3xl mx-auto leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Treat doesn&apos;t replace your stack.
          <br />
          <span className="text-gradient-accent">It activates it.</span>
        </h2>

        <p
          className="mt-5 text-center text-lg max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Connect your existing ITSM, SIEM, cloud, identity, and communication
          tools in minutes. Treat unlocks the context trapped inside each one.
        </p>

        {/* Integration grid */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex flex-col items-start gap-1 p-5 rounded-2xl transition-all duration-200"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mb-1"
                style={{
                  background: "var(--surface-raised)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                }}
              >
                {integration.name[0]}
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {integration.name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {integration.category}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          And 80+ more integrations via REST API and webhooks.{" "}
          <a
            href="#"
            className="underline underline-offset-2 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            See all integrations →
          </a>
        </p>
      </div>
    </section>
  );
}
