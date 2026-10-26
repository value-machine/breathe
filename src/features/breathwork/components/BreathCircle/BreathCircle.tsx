import { cn } from "@/shared/utils/cn";

export interface BreathCircleProps {
  /** true = fully expanded (after an inhale); false = contracted (after an exhale). */
  expanded: boolean;
}

/** Breathing guide: a circle that grows on inhale and shrinks on exhale, with smooth transitions. */
export const BreathCircle = ({ expanded }: BreathCircleProps) => (
  <div
    aria-hidden="true"
    data-expanded={expanded}
    className={cn(
      "size-64 rounded-full bg-secondary ring-4 ring-primary/40 transition-transform ease-standard duration-(--duration-slow) motion-reduce:transition-none",
      expanded ? "scale-100" : "scale-50"
    )}
  />
);
