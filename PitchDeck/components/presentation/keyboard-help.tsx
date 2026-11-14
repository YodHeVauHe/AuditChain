"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS: { keys: string[]; action: string }[] = [
  { keys: ["↑", "↓"], action: "Previous / next slide" },
  { keys: ["←", "→"], action: "Previous / next slide" },
  { keys: ["PgUp", "PgDn"], action: "Previous / next slide" },
  { keys: ["Space"], action: "Next (Shift + Space to go back)" },
  { keys: ["Home", "End"], action: "First / last slide" },
  { keys: ["F"], action: "Toggle presentation mode (fullscreen)" },
  { keys: ["Esc"], action: "Exit presentation mode / close this panel" },
  { keys: ["?"], action: "Toggle this panel" },
  { keys: ["Scroll", "Swipe"], action: "Navigate slides" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-sm border border-line-strong bg-raise px-1.5 font-mono text-[10px] text-cream/90">
      {children}
    </kbd>
  );
}

export function KeyboardHelp({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-center justify-center bg-ink/75 p-6 backdrop-blur-[2px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md rounded-lg border border-gold-line bg-ink-soft p-6",
          "rise-soft"
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">
            Presentation Controls
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-sm p-1 text-fog transition-colors hover:text-cream"
          >
            <X className="size-4" />
          </button>
        </div>
        <ul className="flex flex-col divide-y divide-line">
          {KEYS.map((row) => (
            <li key={row.action} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-fog">{row.action}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                {row.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-center font-mono text-[10px] tracking-[0.25em] text-smoke uppercase">
          AuditLinkTrail — Seed Pitch Presentation
        </p>
      </div>
    </div>
  );
}
