import { cn } from "@/lib/utils";

/** Eyebrow label: "07 — INTEGRITY DEMO" */
export function SectionLabel({
  index,
  title,
  className,
}: {
  index: string;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] uppercase",
        className
      )}
    >
      <span className="text-gold">{index}</span>
      <span aria-hidden className="h-px w-10 bg-gold/45" />
      <span className="text-fog">{title}</span>
    </div>
  );
}
