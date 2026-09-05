"use client";

import {
  ArrowUpRight,
  Building2,
  FileCheck2,
  FileSpreadsheet,
  Landmark,
  Receipt,
  ScrollText,
  Stamp,
  Handshake,
} from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Badge } from "@/components/ui/badge";

const EXPANSION = [
  { icon: FileSpreadsheet, label: "Financial reporting" },
  { icon: FileCheck2, label: "Compliance submissions" },
  { icon: ScrollText, label: "Contracts" },
  { icon: Stamp, label: "Licensing" },
  { icon: Receipt, label: "Tax processes" },
  { icon: Handshake, label: "NGO funding" },
  { icon: Building2, label: "Public expenditure" },
];

export default function MarketSlide() {
  return (
    <Slide ariaLabel="Market — from procurement outward">
      <Reveal>
        <SectionLabel index="13" title="Market" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          Start where the stakes are highest:{" "}
          <span className="text-gold-metal italic">institutional procurement.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog md:text-base">
          High-value decisions, structured process, heavy documentation — the
          workflow where evidence integrity matters most, and where one focused
          MVP proves the whole proposition.
        </p>
      </Reveal>

      <Reveal delay={260}>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {EXPANSION.map((area, i) => (
            <div
              key={area.label}
              className="flex flex-col items-center rounded-lg border border-line bg-raise/60 px-3 py-5 text-center transition-colors duration-500 hover:border-gold/30"
            >
              <area.icon className="size-4.5 text-gold/80" strokeWidth={1.5} />
              <span className="mt-3 font-mono text-[9.5px] leading-snug tracking-[0.14em] text-fog uppercase">
                {area.label}
              </span>
              {i === 0 ? null : (
                <ArrowUpRight
                  aria-hidden
                  className="mt-2 size-3 text-smoke/60"
                />
              )}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={430}>
        <div className="mt-9 flex flex-col items-center gap-3 rounded-lg border border-gold-line bg-gold/[0.045] px-6 py-6 text-center md:flex-row md:justify-center md:gap-5 md:text-left">
          <Landmark className="size-5 shrink-0 text-gold-bright" strokeWidth={1.5} />
          <p className="font-display text-lg leading-snug text-cream md:text-xl">
            The long-term product is not a tool —{" "}
            <span className="text-gold-metal italic">
              it is shared institutional audit infrastructure.
            </span>
          </p>
        </div>
      </Reveal>

      <Reveal delay={540}>
        <div className="mt-5 flex justify-center">
          <Badge variant="outline">
            expansion directions — sequencing to be validated, not claimed
          </Badge>
        </div>
      </Reveal>
    </Slide>
  );
}
