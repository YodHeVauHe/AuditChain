"use client";

import {
  Blocks,
  Braces,
  Database,
  Hash,
  KeyRound,
  Network,
  X,
} from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";

const STACK = [
  {
    icon: Network,
    title: "Permissioned blockchain",
    note: "an invite-only validator set — every participant is known",
  },
  {
    icon: Hash,
    title: "SHA-256",
    note: "evidence commitments — a fingerprint, not a copy",
  },
  {
    icon: KeyRound,
    title: "Ed25519 signatures",
    note: "every event signed under an institutional identity",
  },
  {
    icon: Braces,
    title: "Rust",
    note: "core node implementation — correct, fast, auditable",
  },
  {
    icon: Blocks,
    title: "Authenticated nodes",
    note: "consensus replication across authorised participants",
  },
  {
    icon: Database,
    title: "Off-chain evidence",
    note: "documents stay inside the institution; only hashes travel",
  },
];

const EXCLUDED = ["No cryptocurrency", "No mining", "No public blockchain"];

export default function TechnologySlide() {
  return (
    <Slide ariaLabel="Technology — concise stack">
      <Reveal>
        <SectionLabel index="11" title="Technology" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          Boring on purpose.{" "}
          <span className="text-fog italic">Proven primitives, assembled with care.</span>
        </h2>
      </Reveal>

      <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map((item, i) => (
          <Reveal key={item.title} delay={240 + i * 80}>
            <div className="h-full rounded-lg border border-line bg-raise/60 p-5 transition-colors duration-500 hover:border-gold/30">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-gold-line bg-gold/10">
                  <item.icon className="size-4 text-gold" strokeWidth={1.5} />
                </span>
                <span className="font-mono text-[12px] tracking-[0.12em] text-cream">
                  {item.title}
                </span>
              </div>
              <p className="mt-3.5 text-xs leading-relaxed text-fog">{item.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={760}>
        <div className="mt-9 flex flex-col items-center gap-4 rounded-lg border border-line bg-ink-soft/70 px-6 py-5 md:flex-row md:justify-center md:gap-0">
          <span className="mr-0 font-mono text-[9px] tracking-[0.3em] text-smoke uppercase md:mr-8">
            excluded by design
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-8">
            {EXCLUDED.map((label) => (
              <span
                key={label}
                className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-fog uppercase"
              >
                <X aria-hidden className="size-3.5 text-fail/80" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </Slide>
  );
}
