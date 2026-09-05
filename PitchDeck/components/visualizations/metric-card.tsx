"use client";

import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  status,
  className,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  icon?: LucideIcon;
  status?: { tone: "ok" | "fail" | "gold" | "neutral"; text: string };
  className?: string;
}) {
  return (
    <Card className={cn("p-4 md:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] leading-relaxed tracking-[0.22em] text-smoke uppercase">
          {label}
        </span>
        {Icon ? <Icon className="size-4 shrink-0 text-gold/70" /> : null}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2 text-cream">{value}</div>
      {detail ? (
        <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-smoke">
          {detail}
        </p>
      ) : null}
      {status ? (
        <Badge variant={status.tone} className="mt-3">
          {status.text}
        </Badge>
      ) : null}
    </Card>
  );
}
