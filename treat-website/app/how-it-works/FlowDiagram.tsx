"use client";

import { motion, useReducedMotion } from "framer-motion";

const sources = ["Slack", "Jira", "Email", "SIEM", "PagerDuty", "Cloud"];
const outcomes = ["Triaged", "Routed", "Resolved", "Measured"];

function Node({
  label,
  accent = false,
}: {
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs font-medium text-center whitespace-nowrap"
      style={{
        background: accent ? "rgba(99,102,241,0.12)" : "var(--surface-raised)",
        border: accent ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--border)",
        color: accent ? "var(--accent)" : "var(--text-secondary)",
      }}
    >
      {label}
    </div>
  );
}

export default function FlowDiagram() {
  const reduce = useReducedMotion();

  const pulse = reduce
    ? {}
    : {
        animate: { opacity: [0.2, 1, 0.2] },
        transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <div
      className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="bg-grid absolute inset-0 opacity-40 pointer-events-none" />

      <div className="relative grid grid-cols-3 gap-6 md:gap-10 items-center">
        {/* Sources */}
        <div className="flex flex-col gap-2.5">
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            Sources
          </p>
          {sources.map((s, i) => (
            <motion.div
              key={s}
              initial={reduce ? { opacity: 1 } : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Node label={s} />
            </motion.div>
          ))}
        </div>

        {/* Center engine */}
        <div className="flex flex-col items-center gap-3">
          {/* Connecting pulse line (left) */}
          <motion.div
            className="absolute left-[33%] top-1/2 -translate-y-1/2 h-px w-[12%] hidden md:block"
            style={{ background: "linear-gradient(to right, transparent, var(--accent))" }}
            {...pulse}
          />
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glow-accent rounded-2xl px-5 py-6 text-center w-full"
            style={{
              background: "linear-gradient(180deg, rgba(99,102,241,0.15), var(--surface-raised))",
              border: "1px solid rgba(99,102,241,0.4)",
            }}
          >
            <div className="flex flex-col items-center gap-1.5 mb-3">
              <div className="h-[3px] w-6 rounded-full bg-[#6366F1]" />
              <div className="h-[3px] w-4 rounded-full bg-[#6366F1]" />
              <div className="h-[3px] w-2.5 rounded-full bg-[#6366F1]" />
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Treat
            </p>
            <p className="text-[10px] mt-1" style={{ color: "var(--accent)" }}>
              AI context + workflows
            </p>
          </motion.div>
          {/* Connecting pulse line (right) */}
          <motion.div
            className="absolute right-[33%] top-1/2 -translate-y-1/2 h-px w-[12%] hidden md:block"
            style={{ background: "linear-gradient(to right, var(--accent), transparent)" }}
            {...pulse}
          />
        </div>

        {/* Outcomes */}
        <div className="flex flex-col gap-2.5">
          <p className="text-[10px] uppercase tracking-widest mb-1 text-right" style={{ color: "var(--text-muted)" }}>
            Outcomes
          </p>
          {outcomes.map((o, i) => (
            <motion.div
              key={o}
              initial={reduce ? { opacity: 1 } : { opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
            >
              <Node label={o} accent />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
