import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost } from "../posts";
import Reveal from "../../_components/Reveal";
import Button from "../../_components/ui/Button";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found — Treat" };
  return {
    title: `${post.title} — Treat`,
    description: post.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="relative pt-40 pb-12 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        <Reveal>
          <Link
            href="/blog"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back to blog
          </Link>

          <div className="flex items-center gap-3 text-xs mt-8 mb-4" style={{ color: "var(--text-muted)" }}>
            <span className="font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              {post.category}
            </span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>

          <h1
            className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]"
            style={{ color: "var(--text-primary)" }}
          >
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mt-8 pb-8 border-b" style={{ borderColor: "var(--border)" }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: "var(--surface-raised)",
                color: "var(--accent)",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              {post.author[0]}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {post.author}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {post.authorRole}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Body */}
        <Reveal delay={0.05}>
          <div className="mt-10 flex flex-col gap-6">
            {post.body.map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="text-xl md:text-2xl font-bold tracking-tight mt-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="pl-5 py-1 text-lg md:text-xl font-medium leading-relaxed italic"
                    style={{
                      borderLeft: "3px solid var(--accent)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {block.text}
                  </blockquote>
                );
              }
              return (
                <p key={i} className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {block.text}
                </p>
              );
            })}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div
            className="mt-16 p-8 rounded-2xl text-center"
            style={{ background: "var(--surface)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              See Treat in action
            </h3>
            <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              Bring every security request into one intelligent queue. Book a
              personalized walkthrough with our team.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="/demo">Request a Demo</Button>
            </div>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
