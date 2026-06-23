import type { Metadata } from "next";
import PageHero from "../_components/ui/PageHero";
import Button from "../_components/ui/Button";
import Reveal from "../_components/Reveal";
import FinalCTA from "../_components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Integrations — Treat",
  description:
    "Treat connects to your ITSM, SIEM, cloud, identity, and communication tools — unlocking the context trapped inside each one.",
};

const categories = [
  {
    name: "Communication",
    tools: ["Slack", "Microsoft Teams", "Email / SMTP", "Zoom"],
  },
  {
    name: "ITSM & Ticketing",
    tools: ["Jira", "ServiceNow", "Linear", "Zendesk"],
  },
  {
    name: "SIEM & Detection",
    tools: ["Splunk", "Microsoft Sentinel", "Elastic Security", "Sumo Logic"],
  },
  {
    name: "Endpoint & EDR",
    tools: ["CrowdStrike", "SentinelOne", "Microsoft Defender", "Tanium"],
  },
  {
    name: "Identity",
    tools: ["Okta", "Microsoft Entra ID", "Google Workspace", "Duo"],
  },
  {
    name: "Cloud Security",
    tools: ["AWS Security Hub", "Google Cloud SCC", "Wiz", "Prisma Cloud"],
  },
  {
    name: "Alerting & On-Call",
    tools: ["PagerDuty", "Opsgenie", "VictorOps", "xMatters"],
  },
  {
    name: "Vulnerability",
    tools: ["Tenable", "Qualys", "Rapid7", "Snyk"],
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        label="Integrations"
        title="Connect everything."
        titleAccent="Replace nothing."
        description="Treat plugs into the security and communication tools your team already relies on. Setup takes minutes, and your existing workflows keep running — now with shared context."
      >
        <Button href="/demo">Request a Demo</Button>
        <Button href="#catalog" variant="secondary">
          Browse catalog ↓
        </Button>
      </PageHero>

      <section id="catalog" className="px-6 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} delay={(i % 2) * 0.08}>
              <div
                className="p-7 rounded-2xl h-full"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "var(--accent)" }}
                >
                  {cat.name}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {cat.tools.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: "var(--surface-raised)",
                          color: "var(--accent)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {tool[0]}
                      </span>
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {tool}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div
            className="max-w-6xl mx-auto mt-6 p-8 rounded-2xl text-center"
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Don&apos;t see your tool?
            </h3>
            <p
              className="mt-2 text-sm max-w-lg mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Treat exposes a full REST API and webhooks, so you can connect
              virtually any system. Our team will help you build custom
              integrations during onboarding.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="/demo">Talk to our team</Button>
            </div>
          </div>
        </Reveal>
      </section>

      <FinalCTA />
    </>
  );
}
