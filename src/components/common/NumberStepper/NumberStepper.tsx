import { useId } from "react";
import { Minus, Plus } from "lucide-react";
import { Label } from "@/components/common/Label";
import { cn } from "@/shared/utils/cn";
import { stepValue } from "@/shared/utils/stepValue";

export interface NumberStepperProps {
  /** Visible label, also the input's accessible name. */
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  /** Increment for the − / + buttons; typed values may sit between steps. @default 1 */
  step?: number;
  /** Unit shown after the value and announced with it (e.g. "s"). */
  unit?: string;
  /** Helper line under the control. */
  hint?: string;
  id?: string;
  className?: string;
}

const stepButtonClassName =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-background/70 text-foreground transition-colors duration-(--duration-fast) outline-none hover:bg-background focus-visible:ring-[3px] sm:size-10 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

/**
 * Labeled whole-number field with − / + buttons, sized for touch. The value stays typeable;
 * the buttons snap to `step` and stop at the bounds.
 */
export const NumberStepper = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  hint,
  id,
  className,
}: NumberStepperProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const unitId = `${inputId}-unit`;
  const describedBy = [unit && unitId, hint && hintId].filter(Boolean).join(" ") || undefined;
  const bounds = { min, max, step };

  return (
    <div data-slot="number-stepper" className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={inputId} className="text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-1 rounded-full bg-background/40 p-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          className={stepButtonClassName}
          disabled={value <= min}
          onClick={() => onValueChange(stepValue(value, -1, bounds))}
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-1 items-baseline justify-center gap-0.5">
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            step={1}
            min={min}
            max={max}
            value={value}
            aria-describedby={describedBy}
            onChange={(event) => onValueChange(Number(event.target.value))}
            className="w-[3.5ch] [appearance:textfield] rounded-md bg-transparent text-center text-xl font-medium text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {unit && (
            <span id={unitId} className="shrink-0 text-xs text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          className={stepButtonClassName}
          disabled={value >= max}
          onClick={() => onValueChange(stepValue(value, 1, bounds))}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
};
