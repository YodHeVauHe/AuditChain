"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSlide } from "./slide-context";

/**
 * Staggered entrance animation. Invisible until its slide activates,
 * then fades up. Delay is staggered in milliseconds.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { active } = useSlide();
  return (
    <div
      style={{ transitionDelay: active ? `${delay}ms` : "0ms" }}
      className={cn("reveal", active && "reveal-run", className)}
    >
      {children}
    </div>
  );
}
