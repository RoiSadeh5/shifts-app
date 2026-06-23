"use client";

import { useState } from "react";

const fields = [
  { name: "name", label: "Full name", type: "text", placeholder: "Jane Doe", required: true },
  { name: "email", label: "Work email", type: "email", placeholder: "jane@company.com", required: true },
  { name: "company", label: "Company", type: "text", placeholder: "Acme Corp", required: true },
  { name: "title", label: "Job title", type: "text", placeholder: "VP of Security", required: false },
];

const teamSizes = ["1–10", "11–50", "51–200", "200+"];

export default function DemoForm() {
  const [submitted, setSubmitted] = useState(false);
  const [size, setSize] = useState(teamSizes[1]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          title: form.get("title"),
          teamSize: size,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="p-10 rounded-3xl text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        <div
          className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl mb-5"
          style={{
            background: "rgba(99,102,241,0.15)",
            color: "var(--accent)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          ✓
        </div>
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Thanks — we&apos;ll be in touch.
        </h2>
        <p
          className="mt-3 text-sm max-w-sm mx-auto leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          A member of our team will reach out within one business day to
          schedule your personalized demo of Treat.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 rounded-3xl flex flex-col gap-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <label
            htmlFor={field.name}
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {field.label}
            {field.required && (
              <span style={{ color: "var(--accent)" }}> *</span>
            )}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
            className="px-4 py-3 rounded-xl text-sm outline-none transition-colors"
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
        </div>
      ))}

      {/* Team size selector */}
      <div className="flex flex-col gap-2">
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Security team size
        </span>
        <div className="grid grid-cols-4 gap-2">
          {teamSizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: size === s ? "rgba(99,102,241,0.15)" : "var(--bg)",
                border:
                  size === s
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border-bright)",
                color: size === s ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p
          className="text-sm px-4 py-3 rounded-xl"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#FCA5A5",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="glow-accent mt-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "var(--accent)" }}
        onMouseEnter={(e) => {
          if (!submitting) e.currentTarget.style.background = "var(--accent-hover)";
        }}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--accent)")
        }
      >
        {submitting ? "Sending…" : "Request my demo"}
      </button>

      <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
        By submitting, you agree to our privacy policy. We&apos;ll never share
        your information.
      </p>
    </form>
  );
}
