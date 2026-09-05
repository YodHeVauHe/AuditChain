"use client";

import { useEffect, useRef, useState } from "react";
import { useSlide } from "@/components/presentation/slide-context";

/**
 * Counts up to `value` when its slide activates, and re-animates whenever
 * the target changes (used by the integrity demo's amount flip).
 */
export function AnimatedCounter({
  value,
  duration = 900,
  format,
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const { active } = useSlide();
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (value - from) * eased);
      setDisplay(current);
      fromRef.current = current;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, value, duration]);

  const text = format
    ? format(display)
    : display.toLocaleString("en-GB");

  return <span className={className}>{text}</span>;
}
