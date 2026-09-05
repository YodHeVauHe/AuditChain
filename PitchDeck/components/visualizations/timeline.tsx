"use client";

import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  ref: string;
  title: string;
  date: string;
  note?: string;
  anomaly?: boolean;
};

/**
 * Procurement lifecycle stepper. Horizontal on wide screens,
 * vertical on small ones. Anomaly items are flagged in restrained crimson.
 */
export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {/* Wide: horizontal stepper */}
      <ol className="relative hidden grid grid-cols-7 gap-0 md:grid">
        <div
          aria-hidden
          className="absolute top-[13px] right-2 left-2 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
        />
        {items.map((item) => (
          <li
            key={item.ref}
            className="relative flex flex-col items-center px-1 text-center"
          >
            {item.anomaly ? (
              <div className="stamp-in mb-2 flex items-center gap-1.5 rounded-sm border border-fail/50 bg-fail/10 px-2 py-1 font-mono text-[9px] tracking-[0.14em] whitespace-nowrap text-[#e0938b] uppercase">
                <TriangleAlert className="size-3" />
                Anomaly detected
              </div>
            ) : (
              <div className="mb-2 h-[26px]" />
            )}
            <span
              className={cn(
                "relative z-10 size-2.5 rotate-45 border",
                item.anomaly
                  ? "border-fail bg-fail/60 shadow-[0_0_12px_rgba(198,91,81,0.45)]"
                  : "border-gold bg-ink"
              )}
            />
            <div className="mt-3 font-mono text-[9px] tracking-[0.18em] text-smoke uppercase">
              {item.date}
            </div>
            <div
              className={cn(
                "mt-1 font-mono text-[10px] leading-snug tracking-wider",
                item.anomaly ? "text-[#e0938b]" : "text-cream"
              )}
            >
              {item.title}
            </div>
            <div className="mt-0.5 font-mono text-[9px] text-smoke">{item.ref}</div>
          </li>
        ))}
      </ol>

      {/* Small: vertical list */}
      <ol className="relative flex flex-col gap-0 md:hidden">
        <div
          aria-hidden
          className="absolute top-2 bottom-2 left-[5px] w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent"
        />
        {items.map((item) => (
          <li key={item.ref} className="relative flex items-start gap-4 py-2 pl-6">
            <span
              className={cn(
                "absolute top-[13px] left-0 z-10 size-2.5 rotate-45 border",
                item.anomaly
                  ? "border-fail bg-fail/60"
                  : "border-gold bg-ink"
              )}
            />
            <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[10px] text-cream">{item.title}</span>
              <span className="font-mono text-[9px] tracking-wider text-smoke">
                {item.ref} · {item.date}
              </span>
              {item.anomaly ? (
                <span className="inline-flex items-center gap-1 rounded-sm border border-fail/50 bg-fail/10 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.12em] text-[#e0938b] uppercase">
                  <TriangleAlert className="size-2.5" />
                  Anomaly detected
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
