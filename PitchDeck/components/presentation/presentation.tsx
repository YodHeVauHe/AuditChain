"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { SlideContext } from "./slide-context";
import { ProgressIndicator } from "./progress-indicator";
import { SlideNavigation } from "./slide-navigation";
import { KeyboardHelp } from "./keyboard-help";

export type SlideMeta = {
  /** Anchor id, e.g. "07-integrity-demo" */
  id: string;
  /** Two-digit display number, e.g. "07" */
  num: string;
  /** Short title for the progress rail tooltip */
  title: string;
  component: () => ReactNode;
};

const WHEEL_LOCK_MS = 950;
const WHEEL_THRESHOLD = 56;
const CHROME_IDLE_MS = 2600;

export function Presentation({ slides }: { slides: SlideMeta[] }) {
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [helpOpen, setHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const lockUntilRef = useRef(0);
  const wheelAccRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent((prev) => {
        const next = Math.max(0, Math.min(total - 1, index));
        if (next !== prev) {
          setVisited((v) => (v.has(next) ? v : new Set(v).add(next)));
        }
        return next;
      });
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* Deep-linking: restore position from the URL on load.
     Named paths (/problem) are canonical; a legacy #07 hash is honoured once
     and normalised away. Reads an external system (location) once on mount —
     the sanctioned exception to set-state-in-effect. */
  useEffect(() => {
    const fromSeg = window.location.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.toLowerCase();
    const legacy = window.location.hash.replace("#", "").toLowerCase();
    const token = fromSeg && fromSeg.length > 1 ? fromSeg : legacy || null;
    if (!token) return;

    const byNum = token.match(/^(\d{1,2})$/);
    let index = -1;
    if (byNum) {
      const n = parseInt(byNum[1], 10);
      if (n >= 1 && n <= total) index = n - 1;
    } else {
      index = slides.findIndex((s) => s.id === token);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (index >= 0) setCurrent(index);
    // Run once on mount; slides/total are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Keep the URL path in sync with the slide, without polluting history */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = current === 0 ? "/" : `/${slides[current].id}`;
    if (
      window.location.pathname !== path ||
      window.location.hash !== ""
    ) {
      window.history.replaceState(null, "", path);
    }
  }, [current, slides]);

  /* Fullscreen -------------------------------------------------------------- */
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current?.requestFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Keyboard navigation ------------------------------------------------------ */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case "ArrowUp":
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case " ":
          e.preventDefault();
          if (e.shiftKey) prev();
          else next();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(total - 1);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "?":
          setHelpOpen((o) => !o);
          break;
        case "Escape":
          setHelpOpen(false);
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, goTo, total, toggleFullscreen]);

  /* Wheel navigation (with inner-scroll awareness + trackpad lock) --------- */
  useEffect(() => {
    const canScrollInner = (target: EventTarget | null, dir: number) => {
      let el = target instanceof Element ? target : null;
      while (el && el !== document.body) {
        if (
          el.hasAttribute("data-slide-content") &&
          el.scrollHeight > el.clientHeight + 1
        ) {
          const atTop = el.scrollTop <= 1;
          const atBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          if (dir > 0 && !atBottom) return true;
          if (dir < 0 && !atTop) return true;
          return false;
        }
        el = el.parentElement;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now < lockUntilRef.current) {
        e.preventDefault();
        return;
      }
      if (canScrollInner(e.target, e.deltaY)) return;

      e.preventDefault();
      if (Math.abs(e.deltaY) < 4) return;
      if (Math.sign(e.deltaY) !== Math.sign(wheelAccRef.current)) {
        wheelAccRef.current = 0;
      }
      wheelAccRef.current += e.deltaY;
      if (Math.abs(wheelAccRef.current) >= WHEEL_THRESHOLD) {
        const down = wheelAccRef.current > 0;
        wheelAccRef.current = 0;
        lockUntilRef.current = now + WHEEL_LOCK_MS;
        if (down) next();
        else prev();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  /* Touch swipe --------------------------------------------------------------- */
  useEffect(() => {
    const findScrollable = (target: EventTarget | null): HTMLElement | null => {
      let el = target instanceof Element ? target : null;
      while (el && el !== document.body) {
        if (
          el instanceof HTMLElement &&
          el.hasAttribute("data-slide-content") &&
          el.scrollHeight > el.clientHeight + 1
        ) {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    };

    const touchScrollRef = { scroller: null as HTMLElement | null, top: 0 };

    const onStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? null;
      const scroller = findScrollable(e.target);
      touchScrollRef.scroller = scroller;
      touchScrollRef.top = scroller ? scroller.scrollTop : 0;
    };
    const onEnd = (e: TouchEvent) => {
      const start = touchYRef.current;
      touchYRef.current = null;
      if (start == null) return;
      const delta = start - (e.changedTouches[0]?.clientY ?? start);
      if (Math.abs(delta) <= 64) return;

      // If the gesture scrolled slide content, it was not a navigation swipe
      const { scroller, top } = touchScrollRef;
      if (scroller && Math.abs(scroller.scrollTop - top) > 2) return;
      if (scroller) {
        const atTop = scroller.scrollTop <= 1;
        const atBottom =
          scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
        if (delta > 0 && !atBottom) return;
        if (delta < 0 && !atTop) return;
      }

      if (delta > 0) next();
      else prev();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  /* Chrome auto-hides when the presenter is idle ------------------------------ */
  useEffect(() => {
    const wake = () => {
      setChromeVisible(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(
        () => setChromeVisible(false),
        CHROME_IDLE_MS
      );
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("mousedown", wake);
    window.addEventListener("touchstart", wake);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("mousedown", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, []);

  const chromeClass = useMemo(
    () => cn("chrome", !chromeVisible && "chrome-hidden"),
    [chromeVisible]
  );

  return (
    <div
      ref={rootRef}
      className="relative h-dvh w-full overflow-hidden bg-ink text-cream select-none"
    >
      {slides.map((slide, i) => {
        const state = i === current ? "active" : i < current ? "before" : "after";
        const shouldRender = Math.abs(i - current) <= 1 || visited.has(i);
        return (
          <SlideContext.Provider
            key={slide.id}
            value={{ active: i === current, index: i }}
          >
            <section
              id={slide.id}
              data-state={state}
              aria-hidden={i !== current}
              aria-label={`${slide.num} — ${slide.title}`}
              className="slide-frame"
            >
              {shouldRender ? slide.component() : null}
            </section>
          </SlideContext.Provider>
        );
      })}

      {/* Ambient brand mark, top-left */}
      <div
        className={cn(
          "chrome pointer-events-none absolute top-5 left-6 z-30 md:top-6 md:left-8",
          !chromeVisible && "chrome-hidden"
        )}
      >
        <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.3em] uppercase">
          <span aria-hidden className="size-1.5 rotate-45 bg-gold" />
          <span className="text-cream/80">Audit Chain</span>
          <span className="text-smoke">/</span>
          <span className="text-smoke">Seed Pitch</span>
        </div>
      </div>

      <ProgressIndicator
        slides={slides.map(({ id, num, title }) => ({ id, num, title }))}
        current={current}
        onSelect={goTo}
        chromeClass={chromeClass}
      />

      <SlideNavigation
        current={current}
        total={total}
        onPrev={prev}
        onNext={next}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenHelp={() => setHelpOpen(true)}
        chromeClass={chromeClass}
      />

      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
