"use client";

import { cn } from "@/lib/utils";

type RailSlide = { id: string; num: string; title: string };

export function ProgressIndicator({
  slides,
  current,
  onSelect,
  chromeClass,
}: {
  slides: RailSlide[];
  current: number;
  onSelect: (index: number) => void;
  chromeClass: string;
}) {
  return (
    <>
      {/* Mobile: thin progress hairline at the top edge */}
      <div
        className={cn(chromeClass, "absolute inset-x-0 top-0 z-30 h-px bg-line md:hidden")}
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright transition-all duration-500"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Desktop: clickable diamond rail on the right edge */}
      <nav
        aria-label="Slide progress"
        className={cn(
          chromeClass,
          "absolute top-1/2 right-5 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex lg:right-7"
        )}
      >
        {slides.map((slide, i) => {
          const active = i === current;
          return (
            <button
              key={slide.id}
              onClick={() => onSelect(i)}
              aria-label={`Go to slide ${slide.num}: ${slide.title}`}
              aria-current={active ? "true" : undefined}
              className="group relative flex cursor-pointer items-center justify-center p-1 outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
            >
              <span
                className={cn(
                  "block size-1.5 rotate-45 border transition-all duration-300",
                  active
                    ? "scale-125 border-gold bg-gold shadow-[0_0_10px_rgba(201,164,92,0.5)]"
                    : "border-smoke/70 bg-transparent group-hover:border-gold/70 group-hover:bg-gold/30"
                )}
              />
              <span
                className={cn(
                  "pointer-events-none absolute right-5 rounded-sm border border-line-strong bg-ink-soft px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] whitespace-nowrap text-fog uppercase transition-all duration-200",
                  active ? "text-gold-bright" : "group-hover:text-cream",
                  "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                  active && "opacity-100"
                )}
              >
                {slide.num} · {slide.title}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
