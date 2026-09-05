"use client";

import { Layers, Lock, RefreshCw } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { GoldDivider } from "@/components/presentation/gold-divider";

const PILLARS = [
  {
    icon: Layers,
    title: "Independent",
    note: "verification does not depend on the party being verified — the ledger replica answers to consensus, not to the institution",
  },
  {
    icon: Lock,
    title: "Tamper-evident",
    note: "any change to evidence after commitment becomes cryptographically visible the moment it is re-checked",
  },
  {
    icon: RefreshCw,
    title: "Non-disruptive",
    note: "existing systems keep running exactly as they are — Audit Chain commits alongside them, not instead of them",
  },
];

export default function InnovationSlide() {
  return (
    <Slide
      ariaLabel="Innovation — the integrity layer"
      background={<div className="gold-aura absolute inset-0" />}
    >
      <Reveal>
        <SectionLabel index="12" title="Innovation" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-8 font-display text-[clamp(2.1rem,5vw,4.25rem)] leading-[1.06] text-cream">
          Existing systems generate the data.
          <br />
          <span className="text-gold-metal italic">
            Audit Chain provides the integrity layer.
          </span>
        </h2>
      </Reveal>

      <Reveal delay={280}>
        <GoldDivider className="mt-10 max-w-md" />
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.title} delay={380 + i * 110}>
            <div className="group h-full rounded-lg border border-line bg-raise/60 p-6 transition-colors duration-500 hover:border-gold/35">
              <span className="flex size-10 items-center justify-center rounded-sm border border-gold-line bg-gold/10">
                <pillar.icon className="size-4.5 text-gold" strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 font-mono text-[13px] tracking-[0.28em] text-cream uppercase">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-fog">
                {pillar.note}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Slide>
  );
}
