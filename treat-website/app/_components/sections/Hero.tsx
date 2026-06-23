"use client";

import { motion, useReducedMotion } from "framer-motion";

const queueItems = [
  { id: "REQ-041", channel: "Slack", title: "Access request: prod DB — finance team", risk: "High", time: "2m ago", color: "#EF4444" },
  { id: "REQ-040", channel: "Jira", title: "Firewall rule change for new SaaS vendor", risk: "Med", time: "8m ago", color: "#F59E0B" },
  { id: "REQ-039", channel: "Email", title: "Phishing report from sales@acme.com", risk: "High", time: "12m ago", color: "#EF4444" },
  { id: "REQ-038", channel: "PagerDuty", title: "Anomalous login: 3 failed attempts, Chicago", risk: "Med", time: "19m ago", color: "#F59E0B" },
  { id: "REQ-037", channel: "Slack", title: "New endpoint enrolled without MDM", risk: "Low", time: "34m ago", color: "#22C55E" },
];

function RiskBadge({ risk, color }: { risk: string; color: string }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {risk}
    </span>
  );
}

function ChannelTag({ channel }: { channel: string }) {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded"
      style={{ background: "var(--surface-raised)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
    >
      {channel}
    </span>
  );
}

function MockDashboard() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-bright)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "var(--border)", background: "var(--bg)" }}
      >
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        <div
          className="ml-4 text-xs px-10 py-0.5 rounded"
          style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          app.treat.security — unified queue
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className="hidden md:flex flex-col w-48 p-3 gap-1 border-r shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          {["Queue", "Workflows", "Policies", "Analytics", "Integrations"].map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-default"
              style={{
                background: i === 0 ? "var(--accent-glow)" : "transparent",
                color: i === 0 ? "var(--accent)" : "var(--text-muted)",
                border: i === 0 ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? "var(--accent)" : "var(--border-bright)" }} />
              {item}
            </div>
          ))}
          <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Metrics</div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>MTTR ↓ <span style={{ color: "#22C55E" }}>42%</span></div>
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Open <span className="font-mono">5</span></div>
          </div>
        </div>

        {/* Main queue */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Unified Queue</h3>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>5 items · prioritized by risk</p>
            </div>
            <div
              className="text-[10px] px-2.5 py-1 rounded-lg font-medium"
              style={{ background: "rgba(99,102,241,0.12)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              AI agent active
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {queueItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: i > 2 ? 0.55 : 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.12, duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: i === 0 ? "var(--surface-raised)" : "transparent",
                  border: i === 0 ? "1px solid var(--border-bright)" : "1px solid transparent",
                }}
              >
                <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>{item.id}</span>
                <ChannelTag channel={item.channel} />
                <span className="text-xs flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{item.title}</span>
                <RiskBadge risk={item.risk} color={item.color} />
                <span className="text-[10px] shrink-0 hidden sm:block" style={{ color: "var(--text-muted)" }}>{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const } },
};

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="bg-grid absolute inset-0 pointer-events-none opacity-100" />

      <motion.div
        className="relative flex flex-col items-center w-full"
        variants={reduce ? undefined : container}
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
      >
        {/* Badge */}
        <motion.div variants={item} className="flex items-center gap-2 mb-8">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#A5B4FC",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
            AI-Native Cyber Service Management
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-center text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.05]"
          style={{ color: "var(--text-primary)" }}
        >
          Every security request.
          <br />
          <span className="text-gradient-accent">One unified queue.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={item}
          className="mt-6 text-center text-lg md:text-xl max-w-2xl leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Treat aggregates fragmented requests from Slack, Jira, email, and every
          security tool into a single risk-aware stream — with AI agents that
          surface context and run workflows automatically.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/demo"
            className="glow-accent px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 text-white"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            Request a Demo
          </a>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors duration-200"
            style={{
              color: "var(--text-secondary)",
              background: "var(--surface)",
              border: "1px solid var(--border-bright)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            See how it works →
          </a>
        </motion.div>
      </motion.div>

      {/* Dashboard preview */}
      <motion.div
        className="relative mt-20 w-full max-w-4xl"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.96 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {/* Glow under card */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-30 pointer-events-none blur-2xl"
          style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.3), transparent 70%)" }}
        />
        <motion.div
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
        >
          <MockDashboard />
        </motion.div>
      </motion.div>
    </section>
  );
}
