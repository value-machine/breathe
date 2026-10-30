import type { ComponentProps } from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/shared/utils/cn";

export type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root> & {
  /** Class names for the filled part (e.g. a transition that matches the value's update rate). */
  indicatorClassName?: string;
};

/** Determinate progress bar (shadcn/ui on Radix): `role="progressbar"` with `aria-valuenow`. */
export const Progress = ({ className, indicatorClassName, value, ...props }: ProgressProps) => (
  <ProgressPrimitive.Root
    data-slot="progress"
    value={value}
    className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-primary/15", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full w-full flex-1 rounded-full bg-primary", indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);
