import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type ChoiceCardProps = Omit<ComponentProps<"button">, "children"> & {
  /** Short name; the button's accessible name. */
  label: string;
  /** Supporting line under the label; announced as the description, not the name. */
  description?: string;
  /** Decorative icon shown before the text. */
  icon?: ReactNode;
  selected: boolean;
};

/**
 * Selectable tile for picking one option from a small set (a richer segmented control).
 * A `button` with `aria-pressed`; put several in a `role="group"` with an `aria-label`.
 */
export const ChoiceCard = ({
  label,
  description,
  icon,
  selected,
  className,
  type = "button",
  ...props
}: ChoiceCardProps) => {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    <button
      type={type}
      data-slot="choice-card"
      aria-pressed={selected}
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-[background-color,border-color,box-shadow] duration-(--duration-normal) outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        selected
          ? "border-primary bg-background/80 elevation-sm"
          : "border-transparent bg-background/40 hover:bg-background/70",
        className
      )}
      {...props}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 items-center justify-center rounded-full transition-colors duration-(--duration-normal)",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span id={labelId} className="text-sm font-semibold text-foreground">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </button>
  );
};
