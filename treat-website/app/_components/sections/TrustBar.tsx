const logos = [
  "CrowdStrike",
  "Splunk",
  "ServiceNow",
  "Okta",
  "Palo Alto",
  "Microsoft",
  "AWS",
];

export default function TrustBar() {
  return (
    <section className="py-14 px-6 border-y" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto">
        <p
          className="text-center text-xs font-semibold uppercase tracking-widest mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          Trusted by security teams at world-class companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {logos.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-tight select-none"
              style={{ color: "var(--text-muted)", opacity: 0.5 }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
