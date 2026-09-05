"use client";

import type { LucideIcon } from "lucide-react";
import { Landmark, Network } from "lucide-react";
import { cn } from "@/lib/utils";

export type DiagramNode = {
  id: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  /** anchor position within the diagram, in percent */
  x: number;
  y: number;
};

/**
 * Permissioned-network diagram: authorised node cards arranged around a
 * central ledger, linked by animated replication dashes. Every node holds
 * a replica the others can cross-check.
 */
export function ArchitectureDiagram({
  nodes,
  center = { title: "Permissioned Ledger", sub: "chained blocks of committed events" },
  className,
}: {
  nodes: DiagramNode[];
  center?: { title: string; sub: string };
  className?: string;
}) {
  return (
    <div className={cn("relative h-[340px] w-full md:h-[380px]", className)}>
      {/* Replication links */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {nodes.map((n) => (
          <line
            key={n.id}
            x1={n.x}
            y1={n.y}
            x2={50}
            y2={50}
            stroke="rgba(201, 164, 92, 0.4)"
            strokeWidth={1}
            strokeDasharray="0.6 1.2"
            vectorEffect="non-scaling-stroke"
            className="dash-flow"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((n) => (
        <div
          key={n.id}
          className="absolute w-40 -translate-x-1/2 -translate-y-1/2 md:w-44"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <div className="rounded-md border border-line bg-raise/90 p-3 text-center backdrop-blur-[2px]">
            <span className="mx-auto flex size-8 items-center justify-center rounded-sm border border-line-strong bg-ink-soft">
              <n.icon className="size-4 text-gold" />
            </span>
            <div className="mt-2 font-mono text-[10px] tracking-[0.16em] text-cream uppercase">
              {n.title}
            </div>
            <div className="mt-1 font-mono text-[8.5px] leading-relaxed text-smoke">
              {n.sub}
            </div>
          </div>
        </div>
      ))}

      {/* Central ledger */}
      <div
        className="absolute top-1/2 left-1/2 w-44 -translate-x-1/2 -translate-y-1/2 md:w-52"
        style={{ left: "50%", top: "50%" }}
      >
        <div className="corner-frame rounded-md border border-gold-line bg-gradient-to-b from-raise-2 to-raise p-3.5 text-center">
          <span className="mx-auto flex size-9 items-center justify-center rounded-sm border border-gold/40 bg-gold/10">
            {nodes.length ? (
              <Network className="size-4.5 text-gold-bright" />
            ) : (
              <Landmark className="size-4.5 text-gold-bright" />
            )}
          </span>
          <div className="mt-2 font-mono text-[10px] tracking-[0.18em] text-gold-bright uppercase">
            {center.title}
          </div>
          <div className="mt-1 font-mono text-[8.5px] leading-relaxed text-fog">
            {center.sub}
          </div>
          <div className="mt-2.5 border-t border-gold-line pt-2 font-mono text-[8px] leading-relaxed tracking-wider text-smoke">
            replica at every node
            <br />
            independently verifiable
          </div>
        </div>
      </div>
    </div>
  );
}
