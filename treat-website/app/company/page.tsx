import type { Metadata } from "next";
import PageHero from "../_components/ui/PageHero";
import Reveal from "../_components/Reveal";
import FinalCTA from "../_components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Company — Treat",
  description:
    "Treat is on a mission to give security teams their time back. Meet the team and the principles behind AI-native cyber service management.",
};

const values = [
  {
    title: "Analysts first",
    body: "Every feature we ship is judged by one question: does it give a security analyst their time back? We automate the toil, not the judgment.",
  },
  {
    title: "Context over noise",
    body: "Alerts without context create work. We believe the right information, surfaced at the right moment, is the difference between reacting and deciding.",
  },
  {
    title: "Activate, don't replace",
    body: "Security teams have invested years in their stack. We unlock the value already there instead of forcing another rip-and-replace migration.",
  },
  {
    title: "Earn the trust",
    body: "We operate in the most sensitive corner of the business. Security, transparency, and reliability aren't features — they're the foundation.",
  },
];

const team = [
  { name: "Founder & CEO", role: "Ex-SOC leader", initials: "T" },
  { name: "Co-Founder & CTO", role: "Ex-platform engineering", initials: "T" },
  { name: "Head of Product", role: "Ex-security PM", initials: "T" },
  { name: "Head of Engineering", role: "Ex-infrastructure", initials: "T" },
];

const stats = [
  { value: "2024", label: "Founded" },
  { value: "Remote", label: "First" },
  { value: "SOC 2", label: "Type II" },
  { value: "24/7", label: "Support" },
];

export default function CompanyPage() {
  return (
    <>
      <PageHero
        label="Company"
        title="We give security teams"
        titleAccent="their time back."
        description="Treat was founded by security operators who lived the chaos firsthand — drowning in fragmented requests across a dozen tools. We built the platform we always wished we had."
      />

      {/* Mission */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div
              className="p-8 md:p-12 rounded-3xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--accent)" }}
              >
                Our Mission
              </p>
              <p
                className="text-xl md:text-2xl font-medium leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                Security teams shouldn&apos;t spend their days chasing requests
                across Slack, email, and ten dashboards. We&apos;re building the
                connective tissue that lets them focus on what actually matters
                — protecting the business at the speed it moves.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight text-center"
              style={{ color: "var(--text-primary)" }}
            >
              What we believe
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 0.08}>
                <div
                  className="p-7 rounded-2xl h-full"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {v.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {v.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
              style={{ background: "var(--border)" }}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="p-8 text-center"
                  style={{ background: "var(--surface)" }}
                >
                  <p className="text-3xl font-bold text-gradient-accent">
                    {s.value}
                  </p>
                  <p
                    className="mt-1 text-xs uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight text-center"
              style={{ color: "var(--text-primary)" }}
            >
              The team
            </h2>
            <p
              className="mt-3 text-center text-sm max-w-md mx-auto"
              style={{ color: "var(--text-muted)" }}
            >
              Operators, engineers, and builders who&apos;ve spent their careers
              in security operations.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 0.06}>
                <div
                  className="p-6 rounded-2xl text-center h-full"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-xl font-bold mb-4"
                    style={{
                      background: "var(--surface-raised)",
                      color: "var(--accent)",
                      border: "1px solid rgba(99,102,241,0.25)",
                    }}
                  >
                    {member.initials}
                  </div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {member.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {member.role}
                  </p>
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
