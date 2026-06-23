const testimonials = [
  {
    quote:
      "Before Treat, our analysts were spending half their day just figuring out where requests came from and what the context was. Now that's instant. We went from 3-day average resolution to same-day.",
    name: "Sarah Chen",
    title: "VP of Security Operations",
    company: "Series C Fintech",
  },
  {
    quote:
      "The consistency alone is worth it. Every analyst follows the same workflow, every time — whether it's 2pm on a Tuesday or 2am on a Sunday. Our posture has never been more uniform.",
    name: "Marcus Webb",
    title: "CISO",
    company: "Global Healthcare Provider",
  },
  {
    quote:
      "We finally have real metrics on our security operations. I can walk into a board meeting and tell them exactly how long we spend per risk type and how we're trending. That was impossible before.",
    name: "Priya Nair",
    title: "Head of Security Engineering",
    company: "Enterprise SaaS Platform",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5 text-center"
          style={{ color: "var(--accent)" }}
        >
          From the field
        </p>

        <h2
          className="text-3xl md:text-5xl font-bold tracking-tight text-center max-w-2xl mx-auto leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Security leaders{" "}
          <span className="text-gradient-accent">trust Treat</span>
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-7 rounded-2xl flex flex-col"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Quote mark */}
              <div
                className="text-4xl font-serif leading-none mb-4 select-none"
                style={{ color: "rgba(99,102,241,0.3)" }}
              >
                &ldquo;
              </div>

              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.quote}
              </p>

              <div
                className="mt-6 pt-5 border-t flex items-center gap-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "var(--surface-raised)",
                    color: "var(--accent)",
                    border: "1px solid rgba(99,102,241,0.25)",
                  }}
                >
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {t.title} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
