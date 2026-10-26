import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceBreathProgress,
  isCircleExpanded,
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
  current: BreathPhase | null;
  phaseIndex: number;
  /** Whether the breathing circle is expanded at the current phase. */
  circleExpanded: boolean;
  phaseRemainingSeconds: number;
  /** Rounds from the current one through the last, counting the current round. */
  roundsRemaining: number;
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

  const current = phases[session.progress.phaseIndex] ?? null;
  const lastRound = phases[phases.length - 1]?.round ?? 0;
  return {
    status: session.status,
    current: session.status === "idle" || session.status === "finished" ? null : current,
    phaseIndex: session.progress.phaseIndex,
    circleExpanded: isCircleExpanded(phases, session.progress.phaseIndex),
    phaseRemainingSeconds: Math.ceil(session.progress.remainingMs / 1000),
    roundsRemaining: current ? lastRound - current.round + 1 : 0,
    start,
    pause,
    resume,
    stop,
  };
};
