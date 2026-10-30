import { cn } from "@/shared/utils/cn";

export interface SegmentedControlOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface SegmentedControlProps<TValue extends string> {
  options: SegmentedControlOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  className?: string;
  /** Accessible name for the group. */
  "aria-label"?: string;
}

/** Single-select row of toggle buttons (each a `button` with `aria-pressed`). */
export const SegmentedControl = <TValue extends string>({
  options,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<TValue>) => {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex w-full gap-1 rounded-full bg-background/40 p-1", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-10 flex-1 rounded-full text-sm font-medium transition-[background-color,color,box-shadow] duration-(--duration-normal) focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none",
              selected
                ? "bg-background text-foreground elevation-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
