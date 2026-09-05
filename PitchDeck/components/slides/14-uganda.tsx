"use client";

import {
  ArrowRight,
  Building2,
  Eye,
  FileSearch,
  Handshake,
  Landmark,
  ScrollText,
  University,
} from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Badge } from "@/components/ui/badge";
import { Link2 } from "lucide-react";

const INSTITUTIONS = [
  { icon: Landmark, label: "Government institutions" },
  { icon: University, label: "Universities" },
  { icon: ScrollText, label: "Regulators" },
  { icon: Handshake, label: "NGOs" },
  { icon: Building2, label: "Large organisations" },
];

const BENEFICIARIES = [
  { icon: FileSearch, label: "Auditors" },
  { icon: Eye, label: "Oversight" },
  { icon: ScrollText, label: "Compliance" },
];

export default function UgandaSlide() {
  return (
    <Slide ariaLabel="Uganda relevance — conceptual ecosystem">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionLabel index="14" title="Uganda Relevance" />
          <Badge variant="outline">conceptual direction — no partnerships claimed</Badge>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.5rem)] leading-[1.08] text-cream">
          Digitising institutions create digital evidence —{" "}
          <span className="text-gold-metal italic">Uganda is digitising fast.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog md:text-base">
          Every digitised process produces records that must later stand up to
          scrutiny. Audit Chain is designed for exactly that environment:
          locally deployable, permissioned, and independent of any public
          cryptocurrency network.
        </p>
      </Reveal>

      {/* Conceptual ecosystem */}
      <Reveal delay={280}>
        <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-row flex-wrap justify-center gap-2.5 lg:flex-col lg:items-end">
            {INSTITUTIONS.map((org) => (
              <div
                key={org.label}
                className="flex items-center gap-2.5 rounded-md border border-line bg-raise/60 px-3.5 py-2.5"
              >
                <org.icon className="size-3.5 shrink-0 text-fog" strokeWidth={1.5} />
                <span className="font-mono text-[10px] tracking-[0.14em] text-fog uppercase">
                  {org.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 lg:flex-col">
            <ArrowRight aria-hidden className="size-4 text-gold/60 lg:rotate-90" />
            <div className="corner-frame flex items-center gap-2.5 rounded-md border border-gold-line bg-gradient-to-b from-gold/[0.1] to-transparent px-6 py-4">
              <Link2 className="size-4 text-gold-bright" />
              <span className="font-mono text-[11px] tracking-[0.26em] text-gold-bright uppercase">
                Audit Chain
              </span>
            </div>
            <ArrowRight aria-hidden className="size-4 text-gold/60 lg:rotate-90" />
          </div>

          <div className="flex flex-row flex-wrap justify-center gap-2.5 lg:flex-col lg:items-start">
            {BENEFICIARIES.map((role) => (
              <div
                key={role.label}
                className="flex items-center gap-2.5 rounded-md border border-gold-line bg-gold/[0.05] px-3.5 py-2.5"
              >
                <role.icon className="size-3.5 shrink-0 text-gold" strokeWidth={1.5} />
                <span className="font-mono text-[10px] tracking-[0.14em] text-cream/90 uppercase">
                  {role.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={440}>
        <p className="mt-9 text-center text-[13px] leading-relaxed text-fog md:text-sm">
          A trust layer grown here could serve the same institutions{" "}
          <span className="text-cream">that inspired it</span> — and become
          reference infrastructure for the region.
        </p>
      </Reveal>
    </Slide>
  );
}
