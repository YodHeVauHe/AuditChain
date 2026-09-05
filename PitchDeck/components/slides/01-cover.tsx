"use client";

import { Slide } from "@/components/presentation/slide";
import { Reveal } from "@/components/presentation/reveal";
import { NetworkVisualization } from "@/components/visualizations/network-visualization";

export default function CoverSlide() {
  return (
    <Slide
      ariaLabel="Cover — Audit Chain"
      background={
        <>
          <div className="gold-aura absolute inset-0" />
          <NetworkVisualization density={30} seed={11} opacity={0.8} />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#08080a_92%)]"
          />
        </>
      }
      className="flex items-center justify-center"
    >
      <div className="w-full text-center">
        <Reveal>
          <p className="font-mono text-[9px] tracking-[0.4em] text-smoke uppercase md:text-[10px]">
            Makerere Innovation and Incubation Centre
          </p>
          <p className="mt-1.5 font-mono text-[9px] tracking-[0.4em] text-gold/80 uppercase md:text-[10px]">
            Technology Entrepreneurship Seed — Pitch
          </p>
        </Reveal>

        <Reveal delay={150}>
          <h1 className="mt-8 font-display text-[clamp(3rem,11vw,8.75rem)] leading-[0.95] tracking-tight">
            <span className="text-cream">Audit</span>{" "}
            <span className="text-gold-metal italic">Chain</span>
          </h1>
        </Reveal>

        <Reveal delay={300}>
          <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 md:gap-4">
            <span aria-hidden className="gold-hairline hidden w-16 sm:block" />
            <p className="text-balance text-base leading-relaxed text-fog md:text-lg">
              A tamper-evident trust layer for institutional auditing.
            </p>
            <span aria-hidden className="gold-hairline hidden w-16 sm:block" />
          </div>
        </Reveal>

        <Reveal delay={450}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.35em] text-gold-bright/90 uppercase md:text-[11px]">
            <span>Record</span>
            <span aria-hidden className="size-1 rotate-45 bg-gold/70" />
            <span>Chain</span>
            <span aria-hidden className="size-1 rotate-45 bg-gold/70" />
            <span>Verify</span>
            <span aria-hidden className="size-1 rotate-45 bg-gold/70" />
            <span>Detect</span>
          </div>
        </Reveal>

        <Reveal delay={600}>
          <p className="mt-16 font-mono text-[9px] tracking-[0.3em] text-smoke uppercase md:mt-20">
            TES Pitch Presentation — September 2026
          </p>
        </Reveal>
      </div>
    </Slide>
  );
}
