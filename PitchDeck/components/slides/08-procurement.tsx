"use client";

import { TriangleAlert } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Badge } from "@/components/ui/badge";
import { Timeline, type TimelineItem } from "@/components/visualizations/timeline";

const LIFECYCLE: TimelineItem[] = [
  { ref: "BUD-2026-0031", title: "Budget Created", date: "04 Feb" },
  { ref: "PR-2026-0117", title: "Procurement Started", date: "12 Feb" },
  { ref: "BID-2026-0089", title: "Bid Received", date: "21 Feb" },
  { ref: "EVAL-2026-0064", title: "Bid Evaluated", date: "27 Feb" },
  { ref: "SEL-2026-0058", title: "Supplier Selected", date: "05 Mar" },
  { ref: "CON-2026-0455", title: "Contract Approved", date: "16 Mar" },
  { ref: "PAY-2026-0123", title: "Payment Made", date: "14 Mar", anomaly: true },
];

export default function ProcurementSlide() {
  return (
    <Slide ariaLabel="Use case — procurement lifecycle">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionLabel index="08" title="Use Case · Procurement" />
          <Badge variant="outline">synthetic procurement data</Badge>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          One procurement lifecycle,{" "}
          <span className="text-gold-metal italic">committed step by step.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog md:text-base">
          Every stage is committed as it happens. Nothing is added afterwards —
          and nothing can be quietly rearranged.
        </p>
      </Reveal>

      <Reveal delay={280}>
        <div className="mt-12 rounded-lg border border-line bg-ink-soft/60 px-4 py-8 md:px-8">
          <Timeline items={LIFECYCLE} />
        </div>
      </Reveal>

      <Reveal delay={430}>
        <div className="mt-8 flex flex-col items-start gap-3 rounded-lg border border-fail/35 bg-fail-soft/40 px-5 py-4 md:flex-row md:items-center md:gap-5">
          <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] tracking-[0.24em] text-[#e0938b] uppercase">
            <TriangleAlert className="size-4" />
            Anomaly detected
          </div>
          <p className="text-xs leading-relaxed text-fog md:text-sm">
            Payment <span className="font-mono text-cream">PAY-2026-0123</span>{" "}
            was committed on <span className="text-cream">14 Mar</span> — two days
            before contract{" "}
            <span className="font-mono text-cream">CON-2026-0455</span> was
            approved. The ledger preserves both facts, so the sequencing breach
            is <span className="text-cream">visible — permanently.</span>
          </p>
        </div>
      </Reveal>
    </Slide>
  );
}
