"use client";

import { FileCheck2, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatHashBlocks } from "@/lib/utils";

export type AuditEventDatum = {
  ref: string;
  type: string;
  timestamp: string;
  actor: string;
  hash: string;
};

/** A single committed event, as it appears on the permissioned ledger */
export function AuditEvent({
  event,
  status = "committed",
  className,
}: {
  event: AuditEventDatum;
  status?: "committed" | "verified";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "corner-frame rounded-md border border-line bg-raise/80 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-sm border border-gold-line bg-gold/10">
            {status === "verified" ? (
              <FileCheck2 className="size-3.5 text-gold-bright" />
            ) : (
              <Hash className="size-3.5 text-gold" />
            )}
          </span>
          <div>
            <div className="font-mono text-xs tracking-wider text-cream">
              {event.ref}
            </div>
            <div className="font-mono text-[10px] tracking-[0.18em] text-smoke uppercase">
              {event.type}
            </div>
          </div>
        </div>
        <Badge variant={status === "verified" ? "ok" : "gold"}>
          {status === "verified" ? "Verified" : "Committed"}
        </Badge>
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] text-fog">
        <span>
          <span className="text-smoke">actor </span>
          {event.actor}
        </span>
        <span>
          <span className="text-smoke">at </span>
          {event.timestamp}
        </span>
      </div>
      <div className="mt-2.5 border-t border-line pt-2.5 font-mono text-[10px] leading-relaxed break-all text-gold/80">
        <span className="text-smoke">sha256 </span>
        {formatHashBlocks(event.hash)}
      </div>
    </div>
  );
}
