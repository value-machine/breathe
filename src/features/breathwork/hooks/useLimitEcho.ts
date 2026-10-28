import { useEffect, useRef, type RefObject } from "react";

const ECHO_GROWTH = 1.3;
const ECHO_OPTIONS: KeyframeAnimationOptions = {
  duration: 1200,
  easing: "ease-out",
  fill: "forwards",
};

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Plays the golden echo once each time the breath-limit count goes up. The echo starts at the
 * circle's current scale, so it leaves from the circle's edge, and grows from there. A mount, a
 * reset to zero and a paused session (count unchanged) play nothing, and reduced motion plays
 * nothing.
 */
export const useLimitEcho = (
  ref: RefObject<HTMLElement | null>,
  count: number,
  scale: number
): void => {
  const previousCountRef = useRef(count);

  useEffect(() => {
    const previous = previousCountRef.current;
    previousCountRef.current = count;
    if (count <= previous || prefersReducedMotion()) return;
    ref.current?.animate(
      [
        { transform: `scale(${scale})`, opacity: 0.6 },
        { transform: `scale(${scale * ECHO_GROWTH})`, opacity: 0 },
      ],
      ECHO_OPTIONS
    );
  }, [count, scale, ref]);
};
