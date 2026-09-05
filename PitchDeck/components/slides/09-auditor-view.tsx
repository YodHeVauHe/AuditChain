"use client";

import {
  BadgeCheck,
  Blocks,
  FileSearch,
  Fingerprint,
  TriangleAlert,
} from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/visualizations/metric-card";
import { cn } from "@/lib/utils";

const EVENTS = [
  { ref: "BUD-2026-0031", type: "Budget Created", when: "04 Feb 2026 · 10:02", hash: "3b7e…" },
  { ref: "PR-2026-0117", type: "Procurement Started", when: "12 Feb 2026 · 08:47", hash: "a91c…" },
  { ref: "BID-2026-0089", type: "Bid Received", when: "21 Feb 2026 · 14:15", hash: "5d40…" },
  { ref: "EVAL-2026-0064", type: "Bid Evaluated", when: "27 Feb 2026 · 11:33", hash: "c2f8…" },
  { ref: "SEL-2026-0058", type: "Supplier Selected", when: "05 Mar 2026 · 09:26", hash: "7e61…" },
  { ref: "CON-2026-0455", type: "Contract Approved", when: "16 Mar 2026 · 15:40", hash: "9f2c…" },
  { ref: "PAY-2026-0123", type: "Payment Made", when: "14 Mar 2026 · 09:12", hash: "e4b0…", anomaly: true },
];

export default function AuditorViewSlide() {
  return (
    <Slide ariaLabel="Auditor view — verification console">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionLabel index="09" title="Auditor View" />
          <Badge variant="outline">fictional console · synthetic data</Badge>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(1.9rem,4.2vw,3.5rem)] leading-[1.06] text-cream">
          Verification, as the auditor{" "}
          <span className="text-gold-metal italic">actually experiences it.</span>
        </h2>
      </Reveal>

      {/* Console frame */}
      <Reveal delay={250}>
        <div className="mt-9 overflow-hidden rounded-lg border border-line bg-ink-soft/80">
          {/* Console header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-raise/60 px-5 py-3">
            <div className="flex items-center gap-3">
              <FileSearch className="size-4 text-gold" strokeWidth={1.5} />
              <span className="font-mono text-[11px] tracking-[0.22em] text-cream uppercase">
                Auditor console
              </span>
              <span className="hidden font-mono text-[10px] text-smoke sm:inline">
                PROC/2026/0417
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.18em] text-smoke uppercase">
              <span className="flex items-center gap-1.5">
                <Blocks className="size-3" /> height 128
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-ok pulse-soft" /> 3 nodes
              </span>
            </div>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Event timeline */}
            <div>
              <div className="mb-3 font-mono text-[9px] tracking-[0.26em] text-smoke uppercase">
                Committed event timeline
              </div>
              <ol className="flex flex-col">
                {EVENTS.map((e) => (
                  <li
                    key={e.ref}
                    className={cn(
                      "flex flex-wrap items-center gap-x-3 gap-y-1 border-l py-2 pl-4",
                      e.anomaly ? "border-fail/60" : "border-line"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rotate-45",
                        e.anomaly ? "bg-fail" : "bg-gold/70"
                      )}
                    />
                    <span className="font-mono text-[11px] text-cream">{e.type}</span>
                    <span className="font-mono text-[9px] text-smoke">{e.ref}</span>
                    <span className="ml-auto font-mono text-[9px] text-smoke">{e.when}</span>
                    <span className="font-mono text-[9px] text-gold/60">{e.hash}</span>
                    {e.anomaly ? (
                      <Badge variant="fail" className="ml-auto lg:ml-0">
                        breach
                      </Badge>
                    ) : (
                      <BadgeCheck aria-hidden className="hidden size-3.5 text-ok/80 lg:block" />
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Integrity metrics */}
            <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <MetricCard
                label="Evidence integrity"
                icon={FileSearch}
                value={<span className="font-mono text-lg text-ok">Verified</span>}
                detail="7 / 7 hashes match commitments"
                status={{ tone: "ok", text: "unchanged" }}
              />
              <MetricCard
                label="Institution signature"
                icon={Fingerprint}
                value={<span className="font-mono text-lg text-cream">Valid</span>}
                detail="Ed25519 · procurement-directorate"
                status={{ tone: "ok", text: "authentic" }}
              />
              <MetricCard
                label="Ledger integrity"
                icon={Blocks}
                value={<span className="font-mono text-lg text-cream">3 / 3</span>}
                detail="replica copies consistent"
                status={{ tone: "gold", text: "in sync" }}
              />
              <MetricCard
                label="Anomaly state"
                icon={TriangleAlert}
                value={<span className="font-mono text-lg text-[#eb9d94]">1 detected</span>}
                detail="PAY-2026-0123 precedes CON-2026-0455"
                status={{ tone: "fail", text: "sequencing breach" }}
              />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={430}>
        <p className="mt-7 text-center font-display text-lg text-fog italic md:text-xl">
          Complex cryptography underneath.{" "}
          <span className="text-gold-bright not-italic">
            Simple verification on top.
          </span>
        </p>
      </Reveal>
    </Slide>
  );
}
