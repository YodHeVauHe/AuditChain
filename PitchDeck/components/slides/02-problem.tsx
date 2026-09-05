"use client";

import {
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  Mail,
  PenLine,
  Sheet,
} from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";

const FRAGMENTS = [
  { icon: FileText, name: "Signed PDF", risk: "exported copy" },
  { icon: Sheet, name: "Spreadsheet", risk: "editable cells" },
  { icon: Database, name: "Database", risk: "direct DB access" },
  { icon: Mail, name: "Email trail", risk: "no custody chain" },
  { icon: PenLine, name: "Approval", risk: "undated memo" },
  { icon: ClipboardList, name: "Report", risk: "recompiled" },
];

export default function ProblemSlide() {
  return (
    <Slide ariaLabel="The problem — fragmented digital evidence">
      <Reveal>
        <SectionLabel index="02" title="The Problem" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2.2rem,5vw,4.25rem)] leading-[1.04] text-cream">
          Digital records are everywhere.
        </h2>
        <p className="mt-4 font-display text-[clamp(1.5rem,3.2vw,2.6rem)] leading-[1.1] text-fog italic">
          But can auditors prove they haven&apos;t changed?
        </p>
      </Reveal>

      <Reveal delay={250}>
        <p className="mt-7 max-w-2xl text-sm leading-relaxed text-fog md:text-base">
          A single procurement decision leaves its evidence scattered across
          disconnected systems — every copy detached from the moment it was
          approved, and none of it independently verifiable.
        </p>
      </Reveal>

      <Reveal delay={380}>
        <div className="mt-12">
          <div className="flex flex-wrap items-stretch justify-center gap-2 md:flex-nowrap md:gap-0">
            {FRAGMENTS.map((f, i) => (
              <div key={f.name} className="flex items-center">
                <div className="flex w-28 flex-col items-center rounded-md border border-line bg-raise/70 px-2 py-4 text-center md:w-32">
                  <f.icon
                    className={`size-5 ${i === 0 ? "text-gold" : "text-fog"}`}
                    strokeWidth={1.5}
                  />
                  <span className="mt-2.5 font-mono text-[10px] tracking-wider text-cream">
                    {f.name}
                  </span>
                  <span className="mt-1 font-mono text-[8.5px] tracking-[0.14em] text-smoke uppercase">
                    {f.risk}
                  </span>
                </div>
                {i < FRAGMENTS.length - 1 ? (
                  <ChevronRight
                    aria-hidden
                    className="mx-0.5 size-3.5 shrink-0 text-smoke md:mx-1"
                  />
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span aria-hidden className="gold-hairline w-14" />
            <span className="font-mono text-[9px] tracking-[0.3em] text-smoke uppercase">
              one decision — six disconnected copies
            </span>
            <span aria-hidden className="gold-hairline w-14" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={520}>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-fog md:text-base">
          Evidence lives in systems the institution itself operates —{" "}
          <span className="text-cream">
            detachable, editable, and unverifiable after the fact.
          </span>
        </p>
      </Reveal>
    </Slide>
  );
}
