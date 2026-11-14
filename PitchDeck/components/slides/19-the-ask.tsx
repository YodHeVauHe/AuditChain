"use client";

import { ArrowRight, FlaskConical, Hammer, Map } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";

const AREAS = [
  {
    icon: Hammer,
    title: "Build",
    note: "Working MVP and multi-node demonstration",
    points: ["core node implementation", "multi-node ledger + verification console"],
  },
  {
    icon: FlaskConical,
    title: "Validate",
    note: "Testing with auditors, procurement and compliance stakeholders",
    points: ["interviews and user tests", "tamper-detection scenarios reviewed by practitioners"],
  },
  {
    icon: Map,
    title: "Prepare",
    note: "Integration and pilot readiness",
    points: ["institutional integration patterns", "pilot governance and deployment plan"],
  },
];

export default function AskSlide() {
  return (
    <Slide ariaLabel="The ask — build, validate, prepare">
      <Reveal>
        <SectionLabel index="19" title="The Ask" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.5rem)] leading-[1.08] text-cream">
          Seed capital moves AuditLinkTrail from{" "}
          <span className="text-fog italic">technical concept</span>{" "}
          <span className="text-gold-metal italic">toward validated venture.</span>
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {AREAS.map((area, i) => (
          <Reveal key={area.title} delay={260 + i * 120}>
            <div className="flex h-full flex-col rounded-lg border border-gold-line bg-gradient-to-b from-gold/[0.06] to-transparent p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-sm border border-gold/45 bg-gold/12">
                  <area.icon className="size-4.5 text-gold-bright" strokeWidth={1.5} />
                </span>
                <span className="font-mono text-[9px] tracking-[0.3em] text-smoke uppercase">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-mono text-[15px] tracking-[0.32em] text-gold-bright uppercase">
                {area.title}
              </h3>
              <p className="mt-2.5 text-sm leading-snug font-medium text-cream">
                {area.note}
              </p>
              <ul className="mt-4 flex flex-col gap-2 border-t border-gold-line/60 pt-4">
                {area.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-xs leading-relaxed text-fog">
                    <ArrowRight aria-hidden className="mt-0.5 size-3 shrink-0 text-gold/70" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={660}>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-lg border border-line bg-ink-soft/70 px-6 py-5 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.28em] text-smoke uppercase">
              seed allocation
            </span>
            <span className="hidden h-4 w-px bg-line-strong md:block" />
            <span className="font-mono text-[10px] tracking-[0.18em] text-fog uppercase">
              build · validate · prepare
            </span>
          </div>
          <p className="font-mono text-[10px] leading-relaxed tracking-[0.14em] text-smoke uppercase">
            amounts to be finalised — shown once real, never invented
          </p>
        </div>
      </Reveal>
    </Slide>
  );
}
