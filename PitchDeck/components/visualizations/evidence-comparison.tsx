"use client";

import { ShieldCheck, TriangleAlert } from "lucide-react";
import { cn, firstDifference, formatHashBlocks } from "@/lib/utils";

function HashChars({
  committed,
  current,
  tone,
}: {
  committed: string;
  current: string;
  tone: "verified" | "failed";
}) {
  const shown = current.slice(0, 32);
  return (
    <span className="tracking-wide break-all">
      {shown.split("").map((ch, i) => {
        const differs = committed[i] !== ch;
        return (
          <span
            key={i}
            className={cn(
              differs && tone === "failed"
                ? "bg-fail/15 font-bold text-[#e59a91]"
                : "text-gold/85"
            )}
          >
            {ch}
          </span>
        );
      })}
      <span className="text-smoke"> …</span>
    </span>
  );
}

/**
 * Ledger commitment vs. live recomputation of the evidence hash.
 * In the failed state every differing character glows crimson — the
 * SHA-256 avalanche is the story.
 */
export function EvidenceComparison({
  committed,
  current,
  state,
  className,
}: {
  committed: string | null;
  current: string | null;
  state: "computing" | "verified" | "failed";
  className?: string;
}) {
  const diffAt =
    committed && current ? firstDifference(committed, current) : -1;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-gold-line bg-gold/[0.04] p-4">
          <div className="font-mono text-[9px] tracking-[0.24em] text-gold uppercase">
            Ledger commitment
          </div>
          <div className="mt-2.5 font-mono text-[11px] leading-relaxed text-gold-bright/90">
            {committed ? (
              <span className="tracking-wide break-all">
                {formatHashBlocks(committed)}{" "}
              </span>
            ) : (
              <span className="text-smoke pulse-soft">computing…</span>
            )}
          </div>
          <div className="mt-1.5 font-mono text-[9px] text-smoke">
            committed at event creation · replicated to 3 nodes
          </div>
        </div>

        <div
          className={cn(
            "rounded-md border p-4 transition-colors duration-500",
            state === "failed"
              ? "border-fail/50 bg-fail/[0.05]"
              : "border-line bg-raise/60"
          )}
        >
          <div
            className={cn(
              "font-mono text-[9px] tracking-[0.24em] uppercase transition-colors",
              state === "failed" ? "text-[#e0938b]" : "text-fog"
            )}
          >
            Hash of evidence today
          </div>
          <div className="mt-2.5 font-mono text-[11px] leading-relaxed">
            {current && committed ? (
              <HashChars committed={committed} current={current} tone={state === "failed" ? "failed" : "verified"} />
            ) : (
              <span className="text-smoke pulse-soft">computing…</span>
            )}
          </div>
          <div className="mt-1.5 font-mono text-[9px] text-smoke">
            {state === "failed" && diffAt >= 0
              ? `first difference at character ${String(diffAt + 1).padStart(2, "0")} — avalanche effect`
              : "SHA-256, recomputed locally by the auditor"}
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div
        className={cn(
          "flex items-center gap-4 rounded-md border px-4 py-3.5 transition-all duration-500",
          state === "failed"
            ? "border-fail/60 bg-fail-soft/60"
            : "border-ok/40 bg-ok-soft/50"
        )}
        aria-live="polite"
      >
        {state === "failed" ? (
          <>
            <div className="stamp-in flex shrink-0 items-center gap-2 rounded-sm border-2 border-fail px-3 py-1.5 font-mono text-xs font-bold tracking-[0.3em] text-[#eb9d94] uppercase">
              <TriangleAlert className="size-4" />
              Integrity failure
            </div>
            <p className="text-sm leading-relaxed text-cream/85">
              The evidence no longer matches its ledger commitment.{" "}
              <span className="text-fog">
                Someone changed the contract after it was committed.
              </span>
            </p>
          </>
        ) : (
          <>
            <div className="flex shrink-0 items-center gap-2 rounded-sm border border-ok/50 px-3 py-1.5 font-mono text-xs tracking-[0.3em] text-ok uppercase">
              <ShieldCheck className="size-4" />
              Verified
            </div>
            <p className="text-sm leading-relaxed text-cream/85">
              Hash matches the commitment on the ledger.{" "}
              <span className="text-fog">Evidence is unchanged since commitment.</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
