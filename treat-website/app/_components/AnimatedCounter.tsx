"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts up to a numeric target when scrolled into view.
 * `prefix`/`suffix` wrap the number (e.g. "42" + "%").
 * If `value` has no parseable number, it renders as-is.
 */
export default function AnimatedCounter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  // Split "42%" -> prefix "", number 42, suffix "%"  |  "4.5×" -> 4.5 + "×"
  const match = value.match(/^([^\d.]*)([\d.]+)(.*)$/);

  useEffect(() => {
    if (!match || reduce || !inView) {
      if (inView) setDisplay(value);
      return;
    }
    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr);
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
    const duration = 1200;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = (target * eased).toFixed(decimals);
      setDisplay(`${prefix}${current}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce, match]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
