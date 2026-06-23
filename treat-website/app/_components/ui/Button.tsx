"use client";

import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm px-7 py-3.5 transition-all duration-200";

  if (variant === "primary") {
    return (
      <a
        href={href}
        className={`glow-accent text-white ${base} ${className}`}
        style={{ background: "var(--accent)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`${base} ${className}`}
      style={{
        color: "var(--text-secondary)",
        background: "var(--surface)",
        border: "1px solid var(--border-bright)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
    >
      {children}
    </a>
  );
}
