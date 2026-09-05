"use client";

import {
  Building2,
  Handshake,
  Landmark,
  Layers,
  LifeBuoy,
  Plug,
  ScrollText,
  University,
  Upload,
} from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Badge } from "@/components/ui/badge";

const CUSTOMERS = [
  { icon: Landmark, label: "Government agencies" },
  { icon: ScrollText, label: "Regulated institutions" },
  { icon: University, label: "Universities" },
  { icon: Handshake, label: "NGOs" },
  { icon: Building2, label: "Large enterprises" },
];

const REVENUE = [
  { icon: Upload, label: "Deployment", note: "standing up the permissioned network" },
  { icon: Plug, label: "Integration", note: "connecting existing institutional systems" },
  { icon: Layers, label: "Platform licensing", note: "ongoing node and console licences" },
  { icon: LifeBuoy, label: "Support", note: "operations, upgrades, auditor enablement" },
];

export default function BusinessModelSlide() {
  return (
    <Slide ariaLabel="Business model — high level">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionLabel index="16" title="Business Model" />
          <Badge variant="outline">directional — shaped by pilot learning</Badge>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          Institutions buy assurance.{" "}
          <span className="text-gold-metal italic">We sell the layer that provides it.</span>
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <Reveal delay={260}>
          <div className="h-full rounded-lg border border-line bg-raise/50 p-6">
            <div className="font-mono text-[10px] tracking-[0.26em] text-gold uppercase">
              Potential institutional customers
            </div>
            <ul className="mt-5 flex flex-col divide-y divide-line">
              {CUSTOMERS.map((c) => (
                <li key={c.label} className="flex items-center gap-3.5 py-3">
                  <c.icon className="size-4 shrink-0 text-fog" strokeWidth={1.5} />
                  <span className="text-sm text-cream/90">{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={360}>
          <div className="h-full rounded-lg border border-gold-line bg-gold/[0.04] p-6">
            <div className="font-mono text-[10px] tracking-[0.26em] text-gold uppercase">
              Potential revenue streams
            </div>
            <ul className="mt-5 flex flex-col divide-y divide-gold-line/60">
              {REVENUE.map((r) => (
                <li key={r.label} className="flex items-start gap-3.5 py-3">
                  <r.icon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <div>
                    <span className="text-sm text-cream">{r.label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-fog">
                      {r.note}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={500}>
        <p className="mt-8 text-center text-[13px] leading-relaxed text-fog md:text-sm">
          Kept deliberately high-level —{" "}
          <span className="text-cream">
            pricing and packaging follow what the pilot teaches us.
          </span>
        </p>
      </Reveal>
    </Slide>
  );
}
