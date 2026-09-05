"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useSlide } from "@/components/presentation/slide-context";

type Node = {
  x: number; // 0..1 fractional position
  y: number;
  vx: number; // drift per second, fractional
  vy: number;
  gold: boolean;
  r: number;
};

/** Deterministic PRNG so client renders stay stable across re-mounts */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Ambient cryptographic network: slowly drifting nodes, proximity links,
 * occasional gold pulses travelling along an edge. Restrained by design —
 * low alpha, no neon. Pauses when its slide is not on screen.
 */
export function NetworkVisualization({
  className,
  density = 26,
  seed = 7,
  linkDistance = 0.22,
  opacity = 1,
}: {
  className?: string;
  density?: number;
  seed?: number;
  /** Fraction of canvas diagonal below which nodes link */
  linkDistance?: number;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { active } = useSlide();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = mulberry32(seed);
    const nodes: Node[] = Array.from({ length: density }, () => ({
      x: 0.06 + rand() * 0.88,
      y: 0.08 + rand() * 0.84,
      vx: (rand() - 0.5) * 0.006,
      vy: (rand() - 0.5) * 0.006,
      gold: rand() < 0.18,
      r: rand() < 0.82 ? 1 : 1.6,
    }));

    type Pulse = { a: number; b: number; t: number; speed: number };
    let pulse: Pulse | null = null;
    let nextPulseAt = 0;

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();
    let running = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const step = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < 0.03 || n.x > 0.97) n.vx *= -1;
        if (n.y < 0.04 || n.y > 0.96) n.vy *= -1;
      }

      ctx.clearRect(0, 0, width, height);
      const linkPx = linkDistance * Math.hypot(width, height);

      // Proximity links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = (a.x - b.x) * width;
          const dy = (a.y - b.y) * height;
          const dist = Math.hypot(dx, dy);
          if (dist < linkPx) {
            const alpha = (1 - dist / linkPx) * 0.14;
            ctx.strokeStyle = `rgba(201, 164, 92, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x * width, a.y * height);
            ctx.lineTo(b.x * width, b.y * height);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        const px = n.x * width;
        const py = n.y * height;
        ctx.beginPath();
        ctx.arc(px, py, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.gold
          ? "rgba(222, 190, 122, 0.75)"
          : "rgba(243, 238, 226, 0.34)";
        ctx.fill();
        if (n.gold) {
          ctx.beginPath();
          ctx.arc(px, py, n.r + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(201, 164, 92, 0.18)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // A single gold pulse travelling between linked nodes
      if (!pulse && now > nextPulseAt) {
        const a = Math.floor(rand() * nodes.length);
        for (let k = 0; k < nodes.length; k++) {
          const b = (a + k + 1) % nodes.length;
          const dist = Math.hypot(
            (nodes[a].x - nodes[b].x) * width,
            (nodes[a].y - nodes[b].y) * height
          );
          if (dist > 0 && dist < linkPx) {
            pulse = { a, b, t: 0, speed: 0.35 + rand() * 0.25 };
            break;
          }
        }
      }
      if (pulse) {
        pulse.t += pulse.speed * dt;
        if (pulse.t >= 1) {
          pulse = null;
          nextPulseAt = now + 1800 + rand() * 2600;
        } else {
          const a = nodes[pulse.a];
          const b = nodes[pulse.b];
          const px = (a.x + (b.x - a.x) * pulse.t) * width;
          const py = (a.y + (b.y - a.y) * pulse.t) * height;
          const grad = ctx.createRadialGradient(px, py, 0, px, py, 7);
          grad.addColorStop(0, "rgba(233, 208, 150, 0.85)");
          grad.addColorStop(1, "rgba(233, 208, 150, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden || !active) stop();
      else start();
    };

    if (active && !document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, density, seed, linkDistance]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("h-full w-full", className)}
      style={{ opacity }}
    />
  );
}
