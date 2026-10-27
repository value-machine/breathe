import { useEffect, useRef, type RefObject } from "react";

const ECHO_KEYFRAMES: Keyframe[] = [
  { transform: "scale(1)", opacity: 0.6 },
  { transform: "scale(1.3)", opacity: 0 },
];
const ECHO_OPTIONS: KeyframeAnimationOptions = {
  duration: 1200,
  easing: "ease-out",
  fill: "forwards",
};

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Plays the golden echo once each time the breath-limit count goes up. A mount, a reset to zero
 * and a paused session (count unchanged) play nothing, and reduced motion plays nothing.
 */
export const useLimitEcho = (ref: RefObject<HTMLElement | null>, count: number): void => {
  const previousCountRef = useRef(count);

  useEffect(() => {
    const previous = previousCountRef.current;
    previousCountRef.current = count;
    if (count <= previous || prefersReducedMotion()) return;
    ref.current?.animate(ECHO_KEYFRAMES, ECHO_OPTIONS);
  }, [count, ref]);
};
