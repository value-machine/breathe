import { BreathEchoRing } from "../BreathEchoRing/BreathEchoRing";

export interface BreathCircleProps {
  /** Scale factor from CIRCLE_MIN_SCALE (contracted) to CIRCLE_MAX_SCALE (expanded). */
  scale: number;
  /** Breath limits passed so far; drives the echo ring. */
  echoCount: number;
}

/**
 * Breathing guide: the circle follows the breath through the whole inhale and exhale.
 * The scale is driven by the session clock, so it pauses together with the countdown.
 */
export const BreathCircle = ({ scale, echoCount }: BreathCircleProps) => (
  <div className="relative size-64">
    <div
      aria-hidden="true"
      className="size-64 rounded-full bg-secondary ring-4 ring-primary/40 transition-transform duration-100 ease-linear motion-reduce:transition-none"
      style={{ transform: `scale(${scale})` }}
    />
    <BreathEchoRing count={echoCount} scale={scale} />
  </div>
);
