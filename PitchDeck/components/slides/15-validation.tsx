"use client";

import { ArrowRight, MessagesSquare, Rocket, SearchCheck, TestTube2 } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Badge } from "@/components/ui/badge";

const MILESTONES = [
  {
    icon: MessagesSquare,
    label: "Interview",
    note: "structured interviews with auditors and procurement officers",
  },
  {
    icon: TestTube2,
    label: "Prototype",
    note: "interactive integrity workflow on the procurement MVP",
  },
  {
    icon: SearchCheck,
    label: "User test",
    note: "verification tasks against real audit questions",
  },
  {
    icon: Rocket,
    label: "Pilot",
    note: "one institutional procurement cycle, sandboxed",
  },
];

export default function ValidationSlide() {
  return (
    <Slide ariaLabel="Validation — next milestone">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionLabel index="15" title="Validation" />
          <Badge variant="outline">no traction claimed — none invented</Badge>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          We present our{" "}
          <span className="text-gold-metal italic">next validation milestone</span>{" "}
          — not traction we cannot evidence.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog md:text-base">
          No user research has been conducted yet. That is the honest starting
          point — and the first thing seed capital would change.
        </p>
      </Reveal>

      <div className="mt-11 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {MILESTONES.map((m, i) => (
          <div key={m.label} className="flex flex-1 items-center gap-3">
            <Reveal delay={260 + i * 130} className="flex-1">
              <div
                className={
                  i === 0
                    ? "corner-frame h-full rounded-lg border border-gold-line bg-gold/[0.06] p-5"
                    : "h-full rounded-lg border border-line bg-raise/60 p-5"
                }
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      i === 0
                        ? "flex size-9 items-center justify-center rounded-sm border border-gold/50 bg-gold/15"
                        : "flex size-9 items-center justify-center rounded-sm border border-line-strong bg-ink-soft"
                    }
                  >
                    <m.icon
                      className={i === 0 ? "size-4 text-gold-bright" : "size-4 text-fog"}
                      strokeWidth={1.5}
                    />
                  </span>
                  {i === 0 ? (
                    <Badge variant="gold">next up</Badge>
                  ) : (
                    <span className="font-mono text-[10px] tracking-[0.2em] text-smoke">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-mono text-[12px] tracking-[0.24em] text-cream uppercase">
                  {m.label}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-fog">{m.note}</p>
              </div>
            </Reveal>
            {i < MILESTONES.length - 1 ? (
              <Reveal delay={260 + i * 130 + 70}>
                <ArrowRight
                  aria-hidden
                  className="hidden size-4 shrink-0 text-gold/60 lg:block"
                />
              </Reveal>
            ) : null}
          </div>
        ))}
      </div>

      <Reveal delay={820}>
        <p className="mt-9 text-center font-mono text-[9px] tracking-[0.3em] text-smoke uppercase md:text-[10px]">
          each gate must pass before the next opens
        </p>
      </Reveal>
    </Slide>
  );
}
