"use client";

import { CircleDot, Map, Network } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";

const PHASES = [
  {
    icon: CircleDot,
    tag: "Now",
    title: "Procurement MVP",
    note: "committed events, chained blocks, verification, basic anomaly detection",
    active: true,
  },
  {
    icon: Map,
    tag: "Next",
    title: "Institutional pilot",
    note: "one real procurement workflow running under agreed governance",
    active: false,
  },
  {
    icon: Network,
    tag: "Future",
    title: "Cross-institution audit network",
    note: "shared ledger copies across institutions and oversight bodies",
    active: false,
  },
];

export default function RoadmapSlide() {
  return (
    <Slide ariaLabel="Roadmap — now, next, future">
      <Reveal>
        <SectionLabel index="20" title="Roadmap" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          One workflow. One pilot.{" "}
          <span className="text-gold-metal italic">Then the network.</span>
        </h2>
      </Reveal>

      <div className="relative mt-12">
        <div
          aria-hidden
          className="absolute top-6 right-4 left-4 hidden h-px bg-gradient-to-r from-gold/55 via-gold/25 to-transparent md:block"
        />
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {PHASES.map((phase, i) => (
            <Reveal key={phase.tag} delay={260 + i * 160}>
              <div className="relative flex flex-col">
                <span
                  className={
                    phase.active
                      ? "relative z-10 mb-6 hidden size-3 rotate-45 border border-gold bg-gold shadow-[0_0_12px_rgba(201,164,92,0.5)] md:block"
                      : "relative z-10 mb-6 hidden size-3 rotate-45 border border-smoke bg-ink md:block"
                  }
                />
                <div
                  className={
                    phase.active
                      ? "corner-frame h-full rounded-lg border border-gold-line bg-gold/[0.06] p-6"
                      : "h-full rounded-lg border border-line bg-raise/60 p-6"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        phase.active
                          ? "font-mono text-[10px] tracking-[0.34em] text-gold-bright uppercase"
                          : "font-mono text-[10px] tracking-[0.34em] text-smoke uppercase"
                      }
                    >
                      {phase.tag}
                    </span>
                    <phase.icon
                      className={
                        phase.active ? "size-4 text-gold" : "size-4 text-fog"
                      }
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="mt-4 font-display text-xl leading-snug text-cream md:text-2xl">
                    {phase.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-fog">
                    {phase.note}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={820}>
        <div className="mt-12 flex items-center justify-center gap-4">
          <span aria-hidden className="gold-hairline w-12 md:w-20" />
          <p className="max-w-2xl text-center font-display text-base leading-snug text-fog italic md:text-xl">
            From one verifiable procurement trail to{" "}
            <span className="text-gold-bright not-italic">
              shared institutional trust infrastructure.
            </span>
          </p>
          <span aria-hidden className="gold-hairline w-12 md:w-20" />
        </div>
      </Reveal>
    </Slide>
  );
}
