import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import type { BreathPhaseKind } from "../../types/breathwork.types";

export interface BreathCircleProps {
  /** Scale factor from CIRCLE_MIN_SCALE (contracted) to CIRCLE_MAX_SCALE (expanded). */
  scale: number;
  /** Current phase; a hold warms the orb so the phase reads without the label. */
  phase: BreathPhaseKind | null;
  /** Content centered over the orb (phase label, countdown). It does not scale. */
  children?: ReactNode;
  className?: string;
}

/**
 * Breathing guide: the orb follows the breath through the whole inhale and exhale, between
 * two guide rings that mark a full and an empty breath. The scale is driven by the session
 * clock, so it pauses together with the countdown.
 */
export const BreathCircle = ({ scale, phase, children, className }: BreathCircleProps) => (
  <div className={cn("relative flex size-72 items-center justify-center sm:size-80", className)}>
    <div aria-hidden="true" className="absolute inset-0 rounded-full border border-primary/25" />
    <div
      aria-hidden="true"
      className="absolute inset-1/4 rounded-full border border-dashed border-primary/25"
    />
    <div
      aria-hidden="true"
      className="absolute inset-0 transition-transform duration-100 ease-linear motion-reduce:transition-none"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl" />
      <div className="absolute inset-0 rounded-full bg-radial-[at_35%_30%] from-secondary from-30% to-primary/45" />
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-radial-[at_35%_30%] from-card from-30% to-primary/35 transition-opacity duration-(--duration-slow) ease-(--ease-standard)",
          phase === "hold" ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
    <div className="relative">{children}</div>
  </div>
);
