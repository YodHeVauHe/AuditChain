"use client";

import { Slide } from "@/components/presentation/slide";
import { Reveal } from "@/components/presentation/reveal";
import { GoldDivider } from "@/components/presentation/gold-divider";
import { NetworkVisualization } from "@/components/visualizations/network-visualization";

export default function ClosingSlide() {
  return (
    <Slide
      ariaLabel="Closing — Audit Chain"
      background={
        <>
          <div className="gold-aura absolute inset-0" />
          <NetworkVisualization density={24} seed={23} opacity={0.55} />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#08080a_90%)]"
          />
        </>
      }
      className="flex items-center justify-center"
    >
      <div className="w-full text-center">
        <Reveal>
          <p className="mx-auto max-w-3xl font-display text-[clamp(1.7rem,4.2vw,3.5rem)] leading-[1.12] text-cream">
            Audit evidence should not depend
            <br />
            <span className="text-fog italic">entirely on trust.</span>
          </p>
        </Reveal>

        <Reveal delay={220}>
          <GoldDivider className="mx-auto mt-10 max-w-xs" />
        </Reveal>

        <Reveal delay={360}>
          <h2 className="mt-10 font-display text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.95] tracking-tight">
            <span className="text-cream">Audit</span>{" "}
            <span className="text-gold-metal italic">Chain</span>
          </h2>
        </Reveal>

        <Reveal delay={500}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.35em] text-gold-bright/90 uppercase md:text-[11px]">
            <span>Record</span>
            <span aria-hidden className="size-1 rotate-45 bg-gold/70" />
            <span>Chain</span>
            <span aria-hidden className="size-1 rotate-45 bg-gold/70" />
            <span>Verify</span>
            <span aria-hidden className="size-1 rotate-45 bg-gold/70" />
            <span>Detect</span>
          </div>
        </Reveal>

        <Reveal delay={640}>
          <p className="mx-auto mt-10 max-w-xl text-sm leading-relaxed text-fog md:text-base">
            Building a more independently verifiable
            <br />
            digital institutional future.
          </p>
        </Reveal>

        <Reveal delay={780}>
          <p className="mt-14 font-mono text-[9px] tracking-[0.3em] text-smoke uppercase">
            Makerere Innovation and Incubation Centre — Technology
            Entrepreneurship Seed · 2026
          </p>
        </Reveal>
      </div>
    </Slide>
  );
}
