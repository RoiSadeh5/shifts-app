import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./posts";
import PageHero from "../_components/ui/PageHero";
import Reveal from "../_components/Reveal";

export const metadata: Metadata = {
  title: "Blog — Treat",
  description:
    "Perspectives on cyber service management, security operations, and giving analysts their time back.",
};

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        label="Blog"
        title="Notes on"
        titleAccent="security operations."
        description="Perspectives on cyber service management, AI in the SOC, and the craft of running security at scale."
      />

      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Featured */}
          <Reveal>
            <Link href={`/blog/${featured.slug}`} className="block group">
              <article
                className="grid md:grid-cols-2 gap-8 p-8 rounded-3xl transition-all duration-300"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="aspect-[16/10] rounded-2xl relative overflow-hidden flex items-center justify-center"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <div className="absolute inset-0" style={{ background: "var(--gradient-card)" }} />
                  <div className="bg-grid absolute inset-0 opacity-50" />
                  <span className="relative text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                    {featured.category}
                  </span>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                    <span>{featured.date}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                  <h2
                    className="text-2xl md:text-3xl font-bold tracking-tight leading-tight transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {featured.excerpt}
                  </p>
                  <span className="mt-6 text-sm font-medium" style={{ color: "var(--accent)" }}>
                    Read article →
                  </span>
                </div>
              </article>
            </Link>
          </Reveal>

          {/* Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 2) * 0.08}>
                <Link href={`/blog/${post.slug}`} className="block group h-full">
                  <article
                    className="p-7 rounded-2xl h-full flex flex-col transition-all duration-300"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      <span
                        className="font-semibold uppercase tracking-widest"
                        style={{ color: "var(--accent)" }}
                      >
                        {post.category}
                      </span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3
                      className="text-lg font-semibold leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                      {post.excerpt}
                    </p>
                    <span className="mt-5 text-sm font-medium" style={{ color: "var(--accent)" }}>
                      Read article →
                    </span>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
