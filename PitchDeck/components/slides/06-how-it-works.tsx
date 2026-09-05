"use client";

import {
  Blocks,
  FilePlus2,
  Hash,
  ServerCog,
  ShieldCheck,
  Signature,
} from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";

const STEPS = [
  {
    icon: FilePlus2,
    title: "Institution creates event",
    note: "an approval, a payment, a decision — as it happens",
  },
  {
    icon: Hash,
    title: "Evidence is hashed",
    note: "SHA-256 fingerprint of the attached evidence",
  },
  {
    icon: Signature,
    title: "Institution signs event",
    note: "Ed25519 signature under the institution's identity",
  },
  {
    icon: Blocks,
    title: "Event enters ledger",
    note: "chained to everything committed before it",
  },
  {
    icon: ServerCog,
    title: "Authorised nodes validate & replicate",
    note: "consensus copies held across participants",
  },
  {
    icon: ShieldCheck,
    title: "Auditor later verifies evidence",
    note: "re-hash, compare, confirm — independently",
  },
];

export default function HowItWorksSlide() {
  return (
    <Slide ariaLabel="How it works — six steps">
      <Reveal>
        <SectionLabel index="06" title="How It Works" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          Six steps, one commitment —{" "}
          <span className="text-fog italic">verifiable forever after.</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={240 + i * 90}>
            <div className="group relative h-full rounded-lg border border-line bg-raise/60 p-5 transition-colors duration-500 hover:border-gold/30">
              <div className="flex items-start justify-between">
                <span className="flex size-9 items-center justify-center rounded-sm border border-gold-line bg-gold/10">
                  <step.icon
                    className="size-4 text-gold"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="font-mono text-[11px] tracking-[0.2em] text-smoke">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-4 text-sm leading-snug font-medium text-cream md:text-[15px]">
                {step.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-fog">{step.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={820}>
        <p className="mt-9 text-center font-mono text-[9px] tracking-[0.3em] text-smoke uppercase md:text-[10px]">
          committed once · verifiable at any time · by any authorised party
        </p>
      </Reveal>
    </Slide>
  );
}
