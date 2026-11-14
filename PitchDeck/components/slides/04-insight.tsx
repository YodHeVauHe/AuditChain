"use client";

import { ArrowRight, Database, Landmark, Link2 } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";

export default function InsightSlide() {
  return (
    <Slide
      ariaLabel="The insight — add a trust layer"
      background={
        <div className="gold-aura absolute inset-0" />
      }
    >
      <Reveal>
        <SectionLabel index="04" title="The Insight" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2.2rem,5vw,4.25rem)] leading-[1.06] text-cream">
          We don&apos;t need to replace
          <br />
          institutional systems.
        </h2>
        <p className="mt-5 font-display text-[clamp(2.2rem,5vw,4.25rem)] leading-[1.06]">
          <span className="text-gold-metal italic">
            We need to add a trust layer.
          </span>
        </p>
      </Reveal>

      <div className="mt-14 flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-0">
        <Reveal delay={300} className="w-full max-w-xs lg:w-auto lg:flex-1">
          <div className="rounded-lg border border-line bg-raise/70 p-5 text-center lg:py-7">
            <Database className="mx-auto size-5 text-fog" strokeWidth={1.5} />
            <div className="mt-3 font-mono text-[11px] tracking-[0.22em] text-cream uppercase">
              Existing systems
            </div>
            <div className="mt-1.5 font-mono text-[9px] tracking-wider text-smoke">
              ERP · Finance · Procurement · Records
            </div>
            <div className="mt-2 font-mono text-[9px] tracking-[0.18em] text-smoke uppercase">
              keep running, unchanged
            </div>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <ArrowRight aria-hidden className="mx-2 size-4 rotate-90 text-gold/60 lg:rotate-0" />
        </Reveal>

        <Reveal delay={460} className="w-full max-w-xs lg:w-auto lg:flex-1">
          <div className="corner-frame rounded-lg border border-gold-line bg-gradient-to-b from-gold/[0.09] to-transparent p-5 text-center lg:px-8 lg:py-7">
            <Link2 className="mx-auto size-5 text-gold-bright" strokeWidth={1.5} />
            <div className="mt-3 font-mono text-[11px] tracking-[0.22em] text-gold-bright uppercase">
              AuditLinkTrail
            </div>
            <div className="mt-1.5 font-mono text-[9px] leading-relaxed tracking-wider text-fog">
              cryptographic commitments
              <br />
              beside every important event
            </div>
          </div>
        </Reveal>

        <Reveal delay={560}>
          <ArrowRight aria-hidden className="mx-2 size-4 rotate-90 text-gold/60 lg:rotate-0" />
        </Reveal>

        <Reveal delay={620} className="w-full max-w-xs lg:w-auto lg:flex-1">
          <div className="rounded-lg border border-line bg-raise/70 p-5 text-center lg:py-7">
            <Landmark className="mx-auto size-5 text-fog" strokeWidth={1.5} />
            <div className="mt-3 font-mono text-[11px] tracking-[0.22em] text-cream uppercase">
              Auditors
            </div>
            <div className="mt-1.5 font-mono text-[9px] tracking-wider text-smoke">
              independent verification
            </div>
            <div className="mt-2 font-mono text-[9px] tracking-[0.18em] text-smoke uppercase">
              without trusting the source system
            </div>
          </div>
        </Reveal>
      </div>
    </Slide>
  );
}
