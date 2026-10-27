import { useRef } from "react";
import { useLimitEcho } from "../../hooks/useLimitEcho";

export interface BreathEchoRingProps {
  /** Breath limits passed so far; each new one plays the echo once. */
  count: number;
}

/**
 * Decorative golden ring over the breathing circle. It starts at the circle's edge and fades as
 * it grows, once per breath limit. Invisible at rest, so it only shows during the echo.
 */
export const BreathEchoRing = ({ count }: BreathEchoRingProps) => {
  const ringRef = useRef<HTMLDivElement>(null);
  useLimitEcho(ringRef, count);

  return (
    <div
      ref={ringRef}
      data-echo-ring
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-4 ring-echo-gold"
    />
  );
};
