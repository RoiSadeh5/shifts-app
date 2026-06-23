import type { Metadata } from "next";
import PageHero from "../_components/ui/PageHero";
import Button from "../_components/ui/Button";
import Reveal from "../_components/Reveal";
import FlowDiagram from "./FlowDiagram";
import HowItWorks from "../_components/sections/HowItWorks";
import FinalCTA from "../_components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "How it Works — Treat",
  description:
    "From scattered requests to resolved risk: see how Treat aggregates, contextualizes, and routes every security request through one intelligent workflow.",
};

const beforeAfter = [
  {
    label: "Before Treat",
    tone: "bad",
    points: [
      "Requests scattered across Slack, email, and tickets",
      "Analysts spend 20+ minutes gathering context per item",
      "Decisions vary by analyst, shift, and timezone",
      "No reliable data on where time actually goes",
    ],
  },
  {
    label: "With Treat",
    tone: "good",
    points: [
      "One unified, risk-prioritized queue for everything",
      "Context surfaced automatically in under 2 seconds",
      "Consistent, policy-aligned decisions every time",
      "Real-time MTTR and time-per-risk-type metrics",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        label="How It Works"
        title="From scattered requests"
        titleAccent="to resolved risk."
        description="Treat sits between your tools and your team — capturing every request, enriching it with context, and routing it through workflows that mirror your policies."
      >
        <Button href="/demo">Request a Demo</Button>
        <Button href="/product" variant="secondary">
          Explore the product →
        </Button>
      </PageHero>

      {/* Animated flow diagram */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <FlowDiagram />
          </Reveal>
          <Reveal>
            <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Every request, from every source, converges into one intelligent
              stream — and comes out triaged, routed, resolved, and measured.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Reuse the 4-step section */}
      <HowItWorks />

      {/* Before / After */}
      <section className="px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tight text-center max-w-2xl mx-auto leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              The difference is{" "}
              <span className="text-gradient-accent">night and day</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {beforeAfter.map((col, i) => (
              <Reveal key={col.label} delay={i * 0.1}>
                <div
                  className="p-8 rounded-3xl h-full"
                  style={{
                    background: "var(--surface)",
                    border:
                      col.tone === "good"
                        ? "1px solid rgba(99,102,241,0.3)"
                        : "1px solid var(--border)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-6"
                    style={{
                      color: col.tone === "good" ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {col.label}
                  </p>
                  <ul className="flex flex-col gap-4">
                    {col.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-3 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span
                          className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]"
                          style={
                            col.tone === "good"
                              ? {
                                  background: "rgba(99,102,241,0.15)",
                                  color: "var(--accent)",
                                  border: "1px solid rgba(99,102,241,0.3)",
                                }
                              : {
                                  background: "rgba(148,148,176,0.1)",
                                  color: "var(--text-muted)",
                                  border: "1px solid var(--border)",
                                }
                          }
                        >
                          {col.tone === "good" ? "✓" : "✕"}
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
