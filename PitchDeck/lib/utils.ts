import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Group a hex string into readable blocks, e.g. "a1b2…" → "a1b2 c3d4 …" */
export function formatHashBlocks(hex: string, group = 4, maxChars = 32): string {
  const slice = hex.slice(0, maxChars);
  const grouped = slice.replace(new RegExp(`(.{${group}})`, "g"), "$1 ").trim();
  return hex.length > maxChars ? `${grouped} …` : grouped;
}

/** Index of the first differing character between two equal-length strings */
export function firstDifference(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : n;
}
