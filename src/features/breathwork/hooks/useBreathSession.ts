import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceBreathProgress,
  CIRCLE_MIN_SCALE,
  circleScaleAt,
  roundProgressAt,
  startBreathProgress,
  type BreathSessionProgress,
} from "../services/breathSessionService";
import type { BreathPhase } from "../types/breathwork.types";

export type BreathSessionStatus = "idle" | "running" | "paused" | "finished";

/** How often the running session is advanced. Elapsed time is measured, so drift stays small. */
const TICK_MS = 100;

interface SessionState {
  status: BreathSessionStatus;
  progress: BreathSessionProgress;
}

export interface UseBreathSessionResult {
  status: BreathSessionStatus;
  /** Phase being played, or null when the session is idle or finished. */
  current: BreathPhase | null;
  /** Circle scale at this moment, from CIRCLE_MIN_SCALE to CIRCLE_MAX_SCALE. */
  circleScale: number;
  /** Share of the current round that has elapsed, from 0 to 1. */
  roundProgress: number;
  phaseRemainingSeconds: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

/** Runs a precomputed phase list. Time comes from performance.now(), not tick counts. */
export const useBreathSession = (phases: BreathPhase[]): UseBreathSessionResult => {
  const [session, setSession] = useState<SessionState>(() => ({
    status: "idle",
    progress: startBreathProgress(phases),
  }));
  const lastTickRef = useRef(0);

  const applyElapsed = useCallback(
    (elapsedMs: number): void => {
      setSession((prev) => {
        if (prev.status !== "running") return prev;
        const next = advanceBreathProgress(phases, prev.progress, elapsedMs);
        return next
          ? { status: "running", progress: next }
          : { status: "finished", progress: prev.progress };
      });
    },
    [phases]
  );

  useEffect(() => {
    if (session.status !== "running") return undefined;
    lastTickRef.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const elapsedMs = now - lastTickRef.current;
      lastTickRef.current = now;
      applyElapsed(elapsedMs);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [session.status, applyElapsed]);

  const pause = useCallback((): void => {
    applyElapsed(performance.now() - lastTickRef.current);
    setSession((prev) => (prev.status === "running" ? { ...prev, status: "paused" } : prev));
  }, [applyElapsed]);

  const resume = useCallback((): void => {
    setSession((prev) => (prev.status === "paused" ? { ...prev, status: "running" } : prev));
  }, []);

  const start = useCallback((): void => {
    setSession({ status: "running", progress: startBreathProgress(phases) });
  }, [phases]);

  const stop = useCallback((): void => {
    setSession({ status: "idle", progress: startBreathProgress(phases) });
  }, [phases]);

  const isLive = session.status === "running" || session.status === "paused";
  return {
    status: session.status,
    current: isLive ? (phases[session.progress.phaseIndex] ?? null) : null,
    circleScale: isLive ? circleScaleAt(phases, session.progress) : CIRCLE_MIN_SCALE,
    roundProgress: isLive ? roundProgressAt(phases, session.progress) : 0,
    phaseRemainingSeconds: Math.ceil(session.progress.remainingMs / 1000),
    start,
    pause,
    resume,
    stop,
  };
};
