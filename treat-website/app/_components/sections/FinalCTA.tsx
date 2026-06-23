"use client";

export default function FinalCTA() {
  return (
    <section id="demo" className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="relative">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: "var(--accent)" }}
            >
              Get started today
            </p>

            <h2
              className="text-3xl md:text-5xl font-bold tracking-tight leading-tight max-w-2xl mx-auto"
              style={{ color: "var(--text-primary)" }}
            >
              Stop managing requests.
              <br />
              <span className="text-gradient-accent">Start managing risk.</span>
            </h2>

            <p
              className="mt-6 text-lg max-w-lg mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Join security teams who have reclaimed their analysts&apos; time
              and brought clarity to their operations with Treat.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:hello@treat.security"
                className="glow-accent px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 text-white"
                style={{ background: "var(--accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--accent)")
                }
              >
                Request a Demo
              </a>
              <a
                href="mailto:hello@treat.security"
                className="px-8 py-4 rounded-xl font-semibold text-base transition-colors duration-200"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-bright)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
              >
                Talk to sales
              </a>
            </div>

            <p
              className="mt-6 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No credit card required · Setup in under 30 minutes · SOC 2 compliant
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
