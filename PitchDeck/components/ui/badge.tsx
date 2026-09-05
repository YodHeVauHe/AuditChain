import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.22em] uppercase",
  {
    variants: {
      variant: {
        gold: "border-gold/35 bg-gold/10 text-gold-bright",
        neutral: "border-line-strong bg-raise text-fog",
        ok: "border-ok/35 bg-ok/10 text-ok",
        fail: "border-fail/45 bg-fail/10 text-[#e0938b]",
        outline: "border-line-strong bg-transparent text-fog",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
