"use client";

import { useEffect, useState } from "react";
import { ArrowRight, FileText, Hash, PenLine, RotateCcw, TriangleAlert } from "lucide-react";
import { Slide } from "@/components/presentation/slide";
import { SectionLabel } from "@/components/presentation/section-label";
import { Reveal } from "@/components/presentation/reveal";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/visualizations/animated-counter";
import { EvidenceComparison } from "@/components/visualizations/evidence-comparison";
import { cn } from "@/lib/utils";

const ORIGINAL_AMOUNT = 80_000_000;
const TAMPERED_AMOUNT = 120_000_000;

function contractDocument(amountUgx: number): string {
  return [
    "AUDITLINKTRAIL DEMO — PROCUREMENT CONTRACT (SYNTHETIC)",
    "reference: PROC/2026/0417",
    "supplier: Synthetic Supplier Ltd",
    "description: Supply of ICT equipment",
    `amount_ugx: ${amountUgx}`,
    "committed_by: procurement-directorate",
  ].join("\n");
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function IntegrityDemoSlide() {
  const [tampered, setTampered] = useState(false);
  const [committed, setCommitted] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);

  // The commitment is anchored once — from the original, untampered evidence
  useEffect(() => {
    let alive = true;
    void sha256Hex(contractDocument(ORIGINAL_AMOUNT)).then((h) => {
      if (!alive) return;
      setCommitted(h);
    });
    return () => {
      alive = false;
    };
  }, []);

  // The auditor's local re-computation follows whatever the evidence says today
  useEffect(() => {
    if (!committed) return;
    let alive = true;
    void sha256Hex(contractDocument(tampered ? TAMPERED_AMOUNT : ORIGINAL_AMOUNT)).then(
      (h) => {
        if (alive) setCurrent(h);
      }
    );
    return () => {
      alive = false;
    };
  }, [committed, tampered]);

  const state: "computing" | "verified" | "failed" =
    !committed || !current
      ? "computing"
      : committed === current
        ? "verified"
        : "failed";

  return (
    <Slide ariaLabel="Integrity demo — tamper detection">
      <Reveal>
        <SectionLabel index="07" title="Integrity Demo" />
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] text-cream">
          Change one digit.{" "}
          <span className="text-gold-metal italic">Break the chain.</span>
        </h2>
      </Reveal>

      <div className="mt-9 grid gap-6 lg:mt-11 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
        {/* The evidence */}
        <Reveal delay={240}>
          <div className="corner-frame rounded-lg border border-line bg-raise/80 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileText className="size-4 text-gold" strokeWidth={1.5} />
                <span className="font-mono text-[10px] tracking-[0.24em] text-fog uppercase">
                  Procurement contract — excerpt
                </span>
              </div>
              <span
                className={cn(
                  "size-1.5 rounded-full transition-colors duration-500",
                  tampered ? "bg-fail" : "bg-ok",
                  "pulse-soft"
                )}
                aria-hidden
              />
            </div>

            <dl className="mt-5 flex flex-col gap-2.5 font-mono text-[11px]">
              <div className="flex justify-between gap-4 border-b border-line pb-2.5">
                <dt className="text-smoke">reference</dt>
                <dd className="text-cream">PROC/2026/0417</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-2.5">
                <dt className="text-smoke">supplier</dt>
                <dd className="text-cream">Synthetic Supplier Ltd</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-2.5">
                <dt className="text-smoke">description</dt>
                <dd className="text-fog">Supply of ICT equipment</dd>
              </div>
              <div className="mt-1">
                <dt className="text-[9px] tracking-[0.22em] text-smoke uppercase">
                  Contract amount
                </dt>
                <dd className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-smoke">UGX</span>
                  <span
                    className={cn(
                      "font-mono text-[clamp(1.6rem,3.4vw,2.4rem)] leading-none tracking-tight transition-colors duration-500",
                      tampered ? "text-[#eb9d94]" : "text-cream"
                    )}
                  >
                    <AnimatedCounter
                      value={tampered ? TAMPERED_AMOUNT : ORIGINAL_AMOUNT}
                      format={(n) => n.toLocaleString("en-GB")}
                    />
                  </span>
                  {tampered ? (
                    <span className="font-mono text-[10px] text-smoke line-through">
                      80,000,000 as committed
                    </span>
                  ) : null}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              {tampered ? (
                <Button variant="gold" size="md" onClick={() => setTampered(false)} className="w-full">
                  <RotateCcw className="size-3.5" />
                  Restore original evidence
                </Button>
              ) : (
                <Button variant="danger" size="md" onClick={() => setTampered(true)} className="w-full">
                  <PenLine className="size-3.5" />
                  Tamper with the evidence
                </Button>
              )}
              <p className="mt-3 text-center font-mono text-[9px] tracking-[0.2em] text-smoke uppercase">
                synthetic data · real SHA-256, computed live in this browser
              </p>
            </div>
          </div>
        </Reveal>

        {/* The verification */}
        <Reveal delay={360}>
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-center gap-2.5 rounded-md border border-line bg-ink-soft px-4 py-3 md:gap-4">
              <span className="font-mono text-[9px] tracking-[0.18em] text-fog uppercase">
                evidence
              </span>
              <ArrowRight aria-hidden className="size-3.5 text-gold/60" />
              <span className="flex items-center gap-1.5 rounded-sm border border-gold-line bg-gold/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-gold-bright uppercase">
                <Hash className="size-3" />
                SHA-256
              </span>
              <ArrowRight aria-hidden className="size-3.5 text-gold/60" />
              <span className="font-mono text-[9px] tracking-[0.18em] text-fog uppercase">
                commitment
              </span>
            </div>

            <EvidenceComparison
              committed={committed}
              current={current}
              state={state}
              className="flex-1"
            />
          </div>
        </Reveal>
      </div>

      <Reveal delay={520}>
        <div className="mt-7 flex items-start gap-2.5 border-t border-line pt-4">
          <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0 text-smoke" />
          <p className="text-[11px] leading-relaxed text-smoke md:text-xs">
            AuditLinkTrail proves the integrity of committed evidence relative to
            its cryptographic commitment — it does not prove that the underlying
            event occurred.
          </p>
        </div>
      </Reveal>
    </Slide>
  );
}
