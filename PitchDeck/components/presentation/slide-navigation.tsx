"use client";

import { ChevronDown, ChevronUp, Keyboard, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SlideNavigation({
  current,
  total,
  onPrev,
  onNext,
  onToggleFullscreen,
  isFullscreen,
  onOpenHelp,
  chromeClass,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenHelp: () => void;
  chromeClass: string;
}) {
  return (
    <div
      className={cn(
        chromeClass,
        "absolute right-4 bottom-4 z-30 flex items-center gap-3 md:right-7 md:bottom-6"
      )}
    >
      <div className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-smoke uppercase sm:flex">
        <span className="text-cream/70">
          {String(current + 1).padStart(2, "0")}
        </span>
        <span aria-hidden>/</span>
        <span>{String(total).padStart(2, "0")}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={current === 0}
          aria-label="Previous slide"
          className="rounded-full"
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={current === total - 1}
          aria-label="Next slide"
          className="rounded-full"
        >
          <ChevronDown className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenHelp}
          aria-label="Keyboard shortcuts"
          className="hidden rounded-full sm:inline-flex"
        >
          <Keyboard className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter presentation mode"}
          className="rounded-full"
        >
          {isFullscreen ? (
            <Minimize className="size-4" />
          ) : (
            <Maximize className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
