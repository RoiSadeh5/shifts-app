"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? (scrolled / total) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] origin-left pointer-events-none"
      style={{
        background: "var(--border)",
      }}
    >
      <div
        className="h-full transition-none"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(to right, #6366F1, #A78BFA)",
        }}
      />
    </div>
  );
}
