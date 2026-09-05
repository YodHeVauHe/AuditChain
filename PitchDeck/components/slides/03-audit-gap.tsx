"use client";

import { ArrowRight, Landmark, ScrollText, Search } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";

const FLOW = [
  {
    icon: Landmark,
    title: "The institution controls the records",
    note: "documents, systems, access rights",
  },
  {
    icon: ScrollText,
    title: "The institution produces the evidence",
    note: "exports, extracts, attestations",
  },
  {
    icon: Search,
    title: "The auditor must verify the evidence",
    note: "against the party that controls it",
  },
];

export default function AuditGapSlide() {
  return (
    <Slide ariaLabel="The audit gap — the trust problem">
      <Reveal>
        <SectionLabel index="03" title="The Audit Gap" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2.2rem,5vw,4.25rem)] leading-[1.04] text-cream">
          Verification runs through
          <br />
          <span className="text-fog italic">the party being verified.</span>
        </h2>
      </Reveal>

      <div className="mt-12 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {FLOW.map((step, i) => (
          <div key={step.title} className="flex flex-1 items-center gap-3">
            <Reveal delay={220 + i * 130} className="flex-1">
              <div className="h-full rounded-lg border border-line bg-raise/70 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-ink-soft">
                    <step.icon className="size-4 text-fog" strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.25em] text-smoke uppercase">
                    Step {i + 1}
                  </span>
                </div>
                <p className="mt-3.5 text-sm leading-snug font-medium text-cream md:text-base">
                  {step.title}
                </p>
                <p className="mt-1.5 font-mono text-[10px] tracking-wide text-smoke">
                  {step.note}
                </p>
              </div>
            </Reveal>
            {i < FLOW.length - 1 ? (
              <Reveal delay={220 + i * 130 + 70}>
                <ArrowRight
                  aria-hidden
                  className="hidden size-4 shrink-0 text-gold/70 lg:block"
                />
              </Reveal>
            ) : null}
          </div>
        ))}
      </div>

      <Reveal delay={640}>
        <div className="corner-frame mt-10 rounded-lg border border-gold-line bg-gold/[0.045] px-6 py-7 md:px-10 md:py-9">
          <p className="text-center font-display text-[clamp(1.35rem,3vw,2.3rem)] leading-snug text-cream">
            The system being audited may also control the systems
            <br />
            <span className="text-gold-metal italic">
              maintaining the evidence.
            </span>
          </p>
          <p className="mt-4 text-center font-mono text-[9px] tracking-[0.3em] text-smoke uppercase md:text-[10px]">
            the trust gap — assurance depends on the assured
          </p>
        </div>
      </Reveal>
    </Slide>
  );
}
