"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    // Placeholder — wire to your email provider when ready
    await new Promise((r) => setTimeout(r, 600));
    setState("done");
  }

  return (
    <section className="py-20 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-xl mx-auto text-center">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--accent)" }}
        >
          Newsletter
        </p>
        <h2
          className="text-2xl md:text-3xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Security operations, distilled.
        </h2>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Occasional notes on AI in the SOC, building security teams, and
          lessons from the field. No spam. Unsubscribe any time.
        </p>

        {state === "done" ? (
          <div
            className="mt-8 px-6 py-4 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "var(--accent)",
            }}
          >
            You&apos;re in. We&apos;ll be in touch.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-bright)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-bright)")
              }
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60 shrink-0"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              {state === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
