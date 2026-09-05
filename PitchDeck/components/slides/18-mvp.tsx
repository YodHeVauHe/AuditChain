"use client";

import { Check } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Badge } from "@/components/ui/badge";

const SCOPE = [
  "Institution identity",
  "Signed events",
  "Evidence hashing",
  "Chained blocks",
  "Multiple nodes",
  "Evidence verification",
  "Audit timeline",
  "Basic anomaly detection",
];

export default function MvpSlide() {
  return (
    <Slide ariaLabel="MVP — focused scope">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionLabel index="18" title="MVP" />
          <Badge variant="outline">in development</Badge>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          The MVP is deliberately{" "}
          <span className="text-gold-metal italic">small and complete.</span>
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-2.5 sm:grid-cols-2">
        {SCOPE.map((item, i) => (
          <Reveal key={item} delay={240 + i * 60}>
            <div className="flex items-center gap-3.5 rounded-md border border-line bg-raise/60 px-4 py-3.5 transition-colors duration-500 hover:border-gold/30">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-sm border border-gold/40 bg-gold/10">
                <Check className="size-3 text-gold-bright" strokeWidth={2.5} />
              </span>
              <span className="font-mono text-[11.5px] tracking-[0.1em] text-cream/90">
                {item}
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={760}>
        <div className="corner-frame mt-9 rounded-lg border border-gold-line bg-gold/[0.045] px-6 py-6 text-center">
          <p className="font-display text-lg leading-snug text-cream md:text-2xl">
            One focused procurement workflow{" "}
            <span className="text-gold-metal italic">
              proves the core proposition.
            </span>
          </p>
          <p className="mt-2.5 font-mono text-[9px] tracking-[0.28em] text-smoke uppercase md:text-[10px]">
            commitment → replication → independent verification → tamper detection
          </p>
        </div>
      </Reveal>
    </Slide>
  );
}
