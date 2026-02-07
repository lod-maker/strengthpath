import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent gradient-accent text-white",
        secondary: "border-transparent bg-surface-lighter text-gray-300",
        outline: "border-border text-gray-300",
        high: "border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        medium: "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/30",
        low: "border-transparent bg-blue-500/20 text-blue-400 border-blue-500/30",
        strong: "border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        good: "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/30",
        developing: "border-transparent bg-blue-500/20 text-blue-400 border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
