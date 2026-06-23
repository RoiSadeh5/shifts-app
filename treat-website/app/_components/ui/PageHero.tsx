import Reveal from "../Reveal";
import type { ReactNode } from "react";

/**
 * Standard top-of-page hero for sub-pages (Product, Integrations, etc.).
 */
export default function PageHero({
  label,
  title,
  titleAccent,
  description,
  children,
}: {
  label: string;
  title: string;
  titleAccent?: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative pt-40 pb-20 px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center">
        <Reveal>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "var(--accent)" }}
          >
            {label}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08]"
            style={{ color: "var(--text-primary)" }}
          >
            {title}{" "}
            {titleAccent && <span className="text-gradient-accent">{titleAccent}</span>}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            className="mt-6 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        </Reveal>
        {children && (
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {children}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
