import Reveal from "../Reveal";
import AnimatedCounter from "../AnimatedCounter";

const metrics = [
  { value: "42%", label: "Average MTTR reduction", sub: "within 60 days of deployment" },
  { value: "4.5×", label: "More requests resolved per analyst", sub: "vs. manual queue management" },
  { value: "< 2s", label: "Context surfaced per request", sub: "policies, assets, precedents" },
  { value: "100%", label: "Requests captured", sub: "regardless of source channel" },
];

export default function Metrics() {
  return (
    <section
      className="py-28 px-6"
      style={{
        background: "linear-gradient(180deg, var(--bg) 0%, var(--surface) 50%, var(--bg) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5 text-center"
          style={{ color: "var(--accent)" }}
        >
          Results
        </p>

        <h2
          className="text-3xl md:text-5xl font-bold tracking-tight text-center max-w-2xl mx-auto leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Real numbers.{" "}
          <span className="text-gradient-accent">Real impact.</span>
        </h2>

        <Reveal>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{ background: "var(--border)", borderRadius: "16px", overflow: "hidden" }}
          >
            {metrics.map((m) => (
              <div
                key={m.label}
                className="p-8 flex flex-col items-start"
                style={{ background: "var(--surface)" }}
              >
                <AnimatedCounter
                  value={m.value}
                  className="text-4xl md:text-5xl font-bold tracking-tight text-gradient-accent"
                />
                <p
                  className="mt-3 text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {m.label}
                </p>
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {m.sub}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
