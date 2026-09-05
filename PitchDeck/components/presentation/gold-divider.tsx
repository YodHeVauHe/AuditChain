import { cn } from "@/lib/utils";

/** Fine hairline with a gold diamond at its centre */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center gap-3", className)}>
      <div className="gold-hairline flex-1" />
      <div className="size-1.5 rotate-45 border border-gold/60" />
      <div className="gold-hairline flex-1" />
    </div>
  );
}
