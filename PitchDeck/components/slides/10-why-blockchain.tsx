"use client";

import { FileSearch, Landmark, Scale, ScrollText } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import {
  ArchitectureDiagram,
  type DiagramNode,
} from "@/components/visualizations/architecture-diagram";

const NODES: DiagramNode[] = [
  {
    id: "institution",
    title: "Institution Node",
    sub: "commits events",
    icon: Landmark,
    x: 15,
    y: 15,
  },
  {
    id: "auditor",
    title: "Auditor Node",
    sub: "verifies independently",
    icon: FileSearch,
    x: 85,
    y: 15,
  },
  {
    id: "oversight",
    title: "Oversight Node",
    sub: "cross-checks consensus",
    icon: Scale,
    x: 50,
    y: 88,
  },
];

export default function WhyBlockchainSlide() {
  return (
    <Slide ariaLabel="Why blockchain — independent verifiable copies">
      <Reveal>
        <SectionLabel index="10" title="Why Blockchain?" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 max-w-4xl font-display text-[clamp(1.9rem,4.2vw,3.5rem)] leading-[1.08] text-cream">
          One copy can be altered silently.{" "}
          <span className="text-gold-metal italic">
            Consensus copies cannot.
          </span>
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Conventional world */}
        <Reveal delay={260}>
          <div className="flex h-full flex-col rounded-lg border border-line bg-raise/50 p-5 md:p-6">
            <div className="font-mono text-[10px] tracking-[0.26em] text-smoke uppercase">
              A conventional audit log
            </div>
            <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-4 py-6">
              <div className="rounded-lg border border-dashed border-line-strong bg-ink-soft px-10 py-7 text-center">
                <ScrollText className="mx-auto size-6 text-fog" strokeWidth={1.25} />
                <div className="mt-3 font-mono text-[10px] tracking-[0.2em] text-fog uppercase">
                  records · evidence · logs
                </div>
                <div className="mt-1.5 font-mono text-[9px] text-smoke">
                  maintained by the institution
                </div>
              </div>
              <div className="font-mono text-[9px] tracking-[0.22em] text-smoke uppercase">
                auditor asks the institution for its own trail
              </div>
            </div>
            <p className="border-t border-line pt-4 text-xs leading-relaxed text-fog md:text-sm">
              An audit log can be{" "}
              <span className="text-cream">
                controlled by the organisation maintaining it
              </span>{" "}
              — edited, deleted or regenerated without leaving a trace.
            </p>
          </div>
        </Reveal>

        {/* Audit Chain world */}
        <Reveal delay={360}>
          <div className="flex h-full flex-col rounded-lg border border-gold-line bg-gold/[0.04] p-5 md:p-6">
            <div className="font-mono text-[10px] tracking-[0.26em] text-gold uppercase">
              Audit Chain — permissioned ledger
            </div>
            <div className="mt-2 flex-1">
              <ArchitectureDiagram nodes={NODES} className="mx-auto max-w-md" />
            </div>
            <p className="border-t border-gold-line pt-4 text-xs leading-relaxed text-fog md:text-sm">
              Independently verifiable ledger copies across{" "}
              <span className="text-cream">authorised participants</span> —
              rewriting one copy contradicts the others, visibly.
            </p>
          </div>
        </Reveal>
      </div>
    </Slide>
  );
}
