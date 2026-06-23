import type { Metadata } from "next";
import DemoForm from "./DemoForm";
import Reveal from "../_components/Reveal";

export const metadata: Metadata = {
  title: "Request a Demo — Treat",
  description:
    "See how Treat unifies every security request into one intelligent queue. Book a personalized demo with our team.",
};

const benefits = [
  {
    title: "See your stack unified",
    body: "We'll show you how Treat pulls requests from the exact tools your team uses today.",
  },
  {
    title: "Tailored to your workflows",
    body: "A walkthrough built around your security policies and real request types — not a generic tour.",
  },
  {
    title: "ROI in plain numbers",
    body: "We'll estimate the analyst hours you'd reclaim and how much faster you'd resolve risk.",
  },
];

export default function DemoPage() {
  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left: pitch */}
        <div>
          <Reveal>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "var(--accent)" }}
            >
              Request a Demo
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]"
              style={{ color: "var(--text-primary)" }}
            >
              See Treat in action.
            </h1>
            <p
              className="mt-5 text-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Book a 30-minute personalized walkthrough. We&apos;ll connect it
              to the way your team actually works — no generic sales tour.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-6">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={0.1 + i * 0.08}>
                <div className="flex items-start gap-4">
                  <span
                    className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      color: "var(--accent)",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                  >
                    ✓
                  </span>
                  <div>
                    <p
                      className="text-base font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {b.title}
                    </p>
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {b.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <Reveal delay={0.15}>
          <DemoForm />
        </Reveal>
      </div>
    </section>
  );
}
