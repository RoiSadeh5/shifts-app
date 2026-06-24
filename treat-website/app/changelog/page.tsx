import type { Metadata } from "next";
import PageHero from "../_components/ui/PageHero";
import Reveal from "../_components/Reveal";

export const metadata: Metadata = {
  title: "Changelog — Treat",
  description:
    "What's new in Treat. Every release, improvement, and fix — straight from the team.",
};

type ChangeType = "New" | "Improved" | "Fixed" | "Beta";

const colorMap: Record<ChangeType, { bg: string; text: string; border: string }> = {
  New:      { bg: "rgba(99,102,241,0.12)",  text: "#818CF8", border: "rgba(99,102,241,0.3)" },
  Improved: { bg: "rgba(34,197,94,0.1)",    text: "#4ADE80", border: "rgba(34,197,94,0.25)" },
  Fixed:    { bg: "rgba(245,158,11,0.1)",   text: "#FCD34D", border: "rgba(245,158,11,0.25)" },
  Beta:     { bg: "rgba(168,85,247,0.12)",  text: "#C084FC", border: "rgba(168,85,247,0.3)" },
};

function Tag({ type }: { type: ChangeType }) {
  const c = colorMap[type];
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {type}
    </span>
  );
}

const releases = [
  {
    version: "v1.4",
    date: "June 2026",
    summary: "Workflow builder, real-time MTTR dashboard, Wiz integration.",
    changes: [
      { type: "New" as ChangeType, text: "Visual workflow builder — drag and drop steps to codify any security policy without writing code." },
      { type: "New" as ChangeType, text: "Real-time MTTR dashboard with breakdown by risk type, analyst, and source channel." },
      { type: "New" as ChangeType, text: "Wiz integration — cloud misconfigurations now flow directly into the unified queue with asset context attached." },
      { type: "Improved" as ChangeType, text: "AI context engine now pulls historical precedents from the past 24 months rather than 6." },
      { type: "Improved" as ChangeType, text: "Queue sorting is now per-analyst configurable while retaining global risk ordering." },
      { type: "Fixed" as ChangeType, text: "PagerDuty sync occasionally duplicated incidents when the same alert fired twice within 30 seconds. Fixed." },
    ],
  },
  {
    version: "v1.3",
    date: "April 2026",
    summary: "Microsoft Sentinel integration, bulk actions, mobile-responsive queue.",
    changes: [
      { type: "New" as ChangeType, text: "Microsoft Sentinel integration — alerts are enriched with Azure identity and resource context on arrival." },
      { type: "New" as ChangeType, text: "Bulk actions — assign, reassign, close, or escalate up to 50 queue items at once." },
      { type: "New" as ChangeType, text: "Queue is now fully responsive on mobile — triage on the go." },
      { type: "Beta" as ChangeType, text: "Anomaly detection: Treat flags when a request type's average resolution time spikes unexpectedly." },
      { type: "Improved" as ChangeType, text: "Slack notifications now include the AI-generated context summary so you don't need to open the queue to get the picture." },
      { type: "Fixed" as ChangeType, text: "Okta group sync missed newly created groups for up to 15 minutes after creation. Now syncs in under 60 seconds." },
    ],
  },
  {
    version: "v1.2",
    date: "February 2026",
    summary: "Risk scoring, SLA enforcement, SentinelOne integration.",
    changes: [
      { type: "New" as ChangeType, text: "Risk scoring engine — every incoming request is scored across business impact, asset criticality, and threat signal. The queue is always ordered by what matters most." },
      { type: "New" as ChangeType, text: "SLA enforcement — set response time targets per risk level and get notified before they breach." },
      { type: "New" as ChangeType, text: "SentinelOne integration — endpoint detections land in Treat with full process tree context attached." },
      { type: "Improved" as ChangeType, text: "AI summaries are now shorter and more actionable — no more 10-line context blocks." },
      { type: "Fixed" as ChangeType, text: "Jira bidirectional sync lost comments made via Treat when the Jira ticket was updated externally. Fixed." },
    ],
  },
  {
    version: "v1.1",
    date: "January 2026",
    summary: "Email ingestion, audit log export, search.",
    changes: [
      { type: "New" as ChangeType, text: "Email ingestion — forward any email address into Treat. Security@ and abuse@ aliases are now first-class intake channels." },
      { type: "New" as ChangeType, text: "Audit log export — download a complete CSV of all decisions, assignees, and timestamps for any time range." },
      { type: "New" as ChangeType, text: "Full-text search across your entire request history." },
      { type: "Improved" as ChangeType, text: "Onboarding checklist now surfaces your top 3 integration recommendations based on your tool stack." },
    ],
  },
  {
    version: "v1.0",
    date: "December 2025",
    summary: "General availability. Treat is live.",
    changes: [
      { type: "New" as ChangeType, text: "Unified queue aggregating Slack, Jira, PagerDuty, and CrowdStrike." },
      { type: "New" as ChangeType, text: "AI context engine: policy, asset owner, and precedent surfaced automatically." },
      { type: "New" as ChangeType, text: "Expert workflow templates for access requests, firewall changes, and phishing triage." },
      { type: "New" as ChangeType, text: "Real-time MTTR tracking." },
      { type: "New" as ChangeType, text: "Okta and Google Workspace identity integrations." },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <PageHero
        label="Changelog"
        title="What's new"
        titleAccent="in Treat."
        description="Every release, every improvement, every fix. We ship fast and we document everything."
      />

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          {releases.map((release, ri) => (
            <Reveal key={release.version} delay={ri * 0.04}>
              <div className="relative flex gap-6 md:gap-10 mb-16">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 mt-1"
                    style={{ background: ri === 0 ? "var(--accent)" : "var(--border-bright)", boxShadow: ri === 0 ? "0 0 10px rgba(99,102,241,0.5)" : "none" }}
                  />
                  {ri < releases.length - 1 && (
                    <div className="flex-1 w-px mt-2" style={{ background: "var(--border)" }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {release.version}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {release.date}
                    </span>
                  </div>
                  <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                    {release.summary}
                  </p>
                  <div className="flex flex-col gap-3">
                    {release.changes.map((c, ci) => (
                      <div key={ci} className="flex items-start gap-3">
                        <Tag type={c.type} />
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
