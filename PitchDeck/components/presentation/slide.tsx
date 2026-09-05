"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Structural shell for every slide. Every slide shares one identical
 * container — same max width, same padding — so content edges align
 * uniformly across the deck. Vertically centres content and keeps it
 * clear of the presentation chrome; hosts per-slide background visuals.
 */
export function Slide({
  children,
  background,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  /** Absolutely-positioned ambient visual layer (canvas, glows) */
  background?: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className="relative h-full w-full" aria-label={ariaLabel}>
      {background ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {background}
        </div>
      ) : null}
      <div
        data-slide-content
        className={cn(
          "no-scrollbar relative z-10 h-full w-full overflow-y-auto",
          className
        )}
      >
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center px-6 pt-16 pb-24 md:px-14 md:pt-20 md:pb-24 lg:px-20">
          {children}
        </div>
      </div>
    </div>
  );
}
