import type { Metadata } from "next";
import PageHero from "../_components/ui/PageHero";
import Button from "../_components/ui/Button";
import Reveal from "../_components/Reveal";
import FinalCTA from "../_components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Product — Treat",
  description:
    "The Treat platform: a unified queue, an AI context engine, expert workflows, and real operational metrics for security teams.",
};

const capabilities = [
  {
    name: "Unified Queue",
    headline: "One inbox for every security request.",
    body: "Slack DMs, Jira tickets, email threads, PagerDuty incidents, SIEM alerts — they all converge into a single, deduplicated, risk-ranked stream. Analysts stop tab-hopping and start working the highest-impact items first.",
    points: [
      "Bi-directional sync with your source tools",
      "Automatic deduplication of related requests",
      "Risk scoring from business + threat context",
    ],
  },
  {
    name: "AI Context Engine",
    headline: "The research is done before you arrive.",
    body: "For every request, Treat's agents pull the governing policy, the asset owner, related historical decisions, and current system state — then summarize it in plain language. No more 20-minute detective sessions per ticket.",
    points: [
      "Policy + asset + identity context in under 2 seconds",
      "Institutional precedent from past decisions",
      "Plain-language summaries, not raw log dumps",
    ],
  },
  {
    name: "Expert Workflows",
    headline: "Consistent decisions, every time.",
    body: "Codify your security policies into guided workflows. Every analyst follows the same steps for the same request type — whether it's an access grant, a firewall change, or a phishing triage — across every team and timezone.",
    points: [
      "Templates built from real security playbooks",
      "Branching logic that mirrors your policy",
      "Full audit trail on every decision",
    ],
  },
  {
    name: "Operational Metrics",
    headline: "Finally, numbers you can trust.",
    body: "Treat measures what actually happens. Track mean time to resolution, time spent per risk category, throughput per analyst, and SLA adherence — all in real time, all exportable for your next board deck.",
    points: [
      "Real-time MTTR and dwell-time tracking",
      "Time-spent breakdown by risk type",
      "Board-ready reporting and exports",
    ],
  },
];

export default function ProductPage() {
  return (
    <>
      <PageHero
        label="The Platform"
        title="One platform to run"
        titleAccent="security operations."
        description="Treat turns scattered requests and disconnected tools into a single, intelligent workflow — so your team spends time on decisions, not data retrieval."
      >
        <Button href="/demo">Request a Demo</Button>
        <Button href="/integrations" variant="secondary">
          See integrations →
        </Button>
      </PageHero>

      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {capabilities.map((cap, i) => (
            <Reveal key={cap.name} delay={0.05}>
              <div
                className="grid md:grid-cols-2 gap-8 md:gap-16 items-center p-8 md:p-12 rounded-3xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Text */}
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-4"
                    style={{ color: "var(--accent)" }}
                  >
                    {cap.name}
                  </p>
                  <h2
                    className="text-2xl md:text-3xl font-bold tracking-tight leading-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cap.headline}
                  </h2>
                  <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {cap.body}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {cap.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-3 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span
                          className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]"
                          style={{
                            background: "rgba(99,102,241,0.15)",
                            color: "var(--accent)",
                            border: "1px solid rgba(99,102,241,0.3)",
                          }}
                        >
                          ✓
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual placeholder panel */}
                <div className={i % 2 === 1 ? "md:order-1" : ""}>
                  <div
                    className="aspect-[4/3] rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ background: "var(--gradient-card)" }}
                    />
                    <span
                      className="relative text-6xl font-bold tabular-nums"
                      style={{ color: "rgba(99,102,241,0.2)" }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
