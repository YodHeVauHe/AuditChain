"use client";

import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";

const STEPS = [
  {
    text: "Digital institutional processes are expanding.",
    tone: "fog",
    width: "max-w-md",
  },
  {
    text: "Digital evidence is expanding.",
    tone: "fog",
    width: "max-w-lg",
  },
  {
    text: "The integrity of digital evidence becomes infrastructure.",
    tone: "gold",
    width: "max-w-3xl",
  },
] as const;

export default function WhyNowSlide() {
  return (
    <Slide
      ariaLabel="Why now — evidence integrity as infrastructure"
      background={
        <>
          <div className="gold-aura absolute inset-0" />
          <div
            aria-hidden
            className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
          />
        </>
      }
    >
      <Reveal>
        <SectionLabel index="17" title="Why Now" />
      </Reveal>

      <div className="mt-14 flex flex-col gap-10 md:gap-12">
        {STEPS.map((step, i) => (
          <Reveal key={step.text} delay={160 + i * 220}>
            <div className="flex items-center gap-5 md:gap-8">
              <span className="hidden w-10 shrink-0 text-right font-mono text-[10px] tracking-[0.2em] text-smoke sm:block">
                0{i + 1}
              </span>
              <span
                aria-hidden
                className={
                  step.tone === "gold"
                    ? "size-2 shrink-0 rotate-45 bg-gold shadow-[0_0_12px_rgba(201,164,92,0.5)]"
                    : "size-1.5 shrink-0 rotate-45 border border-smoke"
                }
              />
              <h2
                className={
                  step.tone === "gold"
                    ? `font-display text-[clamp(1.8rem,4.6vw,4rem)] leading-[1.06] ${step.width} text-gold-metal italic`
                    : `font-display text-[clamp(1.4rem,3.2vw,2.5rem)] leading-[1.1] ${step.width} text-fog`
                }
              >
                {step.text}
              </h2>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={880}>
        <p className="mt-14 font-mono text-[9px] tracking-[0.3em] text-smoke uppercase md:text-[10px]">
          therefore — build the layer now, before the evidence multiplies further
        </p>
      </Reveal>
    </Slide>
  );
}
