"use client";

import { ArrowDown, ArrowRight, FileLock2, Hash, KeyRound, Link2 } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Badge } from "@/components/ui/badge";
import { AuditEvent } from "@/components/visualizations/audit-event";

const PROOF_FLOW = [
  { icon: Link2, label: "Event" },
  { icon: Hash, label: "SHA-256 hash" },
  { icon: KeyRound, label: "Ed25519 signature" },
  { icon: FileLock2, label: "Permissioned ledger" },
];

export default function SolutionSlide() {
  return (
    <Slide ariaLabel="The solution — cryptographic commitments">
      <Reveal>
        <SectionLabel index="05" title="The Solution" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 max-w-4xl font-display text-[clamp(1.9rem,4.2vw,3.5rem)] leading-[1.1] text-cream">
          An independent cryptographic commitment to{" "}
          <span className="text-gold-metal italic">
            important institutional events.
          </span>
        </h2>
      </Reveal>

      <div className="mt-11 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div className="flex flex-col gap-0">
          {/* Off-chain lane */}
          <Reveal delay={250}>
            <div className="rounded-lg border border-line bg-raise/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] tracking-[0.28em] text-smoke uppercase">
                  Off-chain · inside the institution
                </span>
                <Badge variant="outline">evidence</Badge>
              </div>
              <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] tracking-wider text-fog">
                <span>Contract PDF</span>
                <span className="text-smoke">·</span>
                <span>Evaluation sheets</span>
                <span className="text-smoke">·</span>
                <span>Approvals</span>
                <span className="text-smoke">·</span>
                <span>Records</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={330}>
            <div className="flex items-center gap-3 py-2 pl-5">
              <ArrowDown aria-hidden className="size-3.5 text-gold/60" />
              <span className="font-mono text-[9px] tracking-[0.22em] text-gold/80 uppercase">
                only the hash crosses — never the document
              </span>
            </div>
          </Reveal>

          {/* On-chain lane */}
          <Reveal delay={410}>
            <div className="rounded-lg border border-gold-line bg-gold/[0.05] p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] tracking-[0.28em] text-gold uppercase">
                  On-chain · permissioned ledger
                </span>
                <Badge variant="gold">proofs</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
                {PROOF_FLOW.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-2.5 rounded-md border border-line-strong bg-ink-soft px-3.5 py-2.5">
                      <step.icon className="size-4 text-gold" strokeWidth={1.5} />
                      <span className="font-mono text-[10px] tracking-wider text-cream">
                        {step.label}
                      </span>
                    </div>
                    {i < PROOF_FLOW.length - 1 ? (
                      <ArrowRight aria-hidden className="size-3.5 text-gold/60" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={520}>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-fog">
              The commitment is anchored once, at the moment the event happens.
              From then on, <span className="text-cream">any authorised party can
              re-verify the evidence against it</span> — at any time, without
              asking the source system to vouch for itself.
            </p>
          </Reveal>
        </div>

        <Reveal delay={380} className="lg:pt-1">
          <div className="flex h-full flex-col">
            <AuditEvent
              event={{
                ref: "CON-2026-0455",
                type: "Contract Approved",
                timestamp: "2026-03-16 15:40 EAT",
                actor: "procurement-directorate",
                hash: "9f2c41aa67d8b0e5c314f7a92e8b6d401cf5a83b72e09d16c4f8a7b3e2d95c10",
              }}
              status="committed"
            />
            <div className="mt-4 rounded-md border border-line bg-raise/60 p-4">
              <div className="flex items-center gap-2.5">
                <FileLock2 className="size-4 shrink-0 text-gold" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-cream">
                  Sensitive evidence stays off-chain.
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-fog">
                Documents, amounts and identities never leave the institution —
                only unforgeable proofs are shared.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Slide>
  );
}
