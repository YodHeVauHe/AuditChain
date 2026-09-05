import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-mono text-[11px] tracking-[0.18em] uppercase transition-all duration-300 outline-none focus-visible:ring-1 focus-visible:ring-gold/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        gold: "border border-gold/40 bg-gold/10 text-gold-bright hover:border-gold/70 hover:bg-gold/20",
        solid: "border border-gold-deep/60 bg-gradient-to-b from-gold-bright via-gold to-gold-deep text-ink hover:brightness-110",
        ghost: "border border-transparent text-fog hover:border-line-strong hover:text-cream",
        danger:
          "border border-fail/40 bg-fail/10 text-[#e59891] hover:border-fail/70 hover:bg-fail/20",
        outline: "border border-line-strong bg-raise/40 text-cream hover:border-gold/40 hover:text-gold-bright",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-5",
        lg: "h-12 px-7 text-xs",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
