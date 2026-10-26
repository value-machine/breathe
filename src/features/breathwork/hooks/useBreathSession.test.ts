import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildBreathPhases } from "../services/breathSessionService";
import type { BreathPhase } from "../types/breathwork.types";
import { useBreathSession } from "./useBreathSession";

// 1 + 1 (breath) + 5 (hold) + 1 (inhale) + 15 (hold) + 1 (exhale) = 24 seconds
const SHORT_PHASES: BreathPhase[] = buildBreathPhases({
  breathsBeforeHold: 1,
  inhaleExhaleSeconds: 1,
  holdTargetSeconds: 5,
  rounds: 1,
});

const advance = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe("useBreathSession", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show the first phase as running when start is called", () => {
    const { result } = renderHook(() => useBreathSession(SHORT_PHASES));

    act(() => result.current.start());

    expect(result.current.status).toBe("running");
    expect(result.current.current).toEqual(SHORT_PHASES[0]);
    expect(result.current.phaseRemainingSeconds).toBe(1);
  });

  it("should keep the remaining time frozen when paused", () => {
    const { result } = renderHook(() => useBreathSession(SHORT_PHASES));
    act(() => result.current.start());
    advance(500);

    act(() => result.current.pause());
    const remainingAtPause = result.current.phaseRemainingSeconds;
    advance(5000);

    expect(result.current.status).toBe("paused");
    expect(result.current.phaseRemainingSeconds).toBe(remainingAtPause);
  });

  it("should continue from the paused point when resumed", () => {
    const { result } = renderHook(() => useBreathSession(SHORT_PHASES));
    act(() => result.current.start());
    act(() => result.current.pause());
    act(() => result.current.resume());

    advance(1000);

    expect(result.current.status).toBe("running");
    expect(result.current.current).toEqual(SHORT_PHASES[1]);
  });

  it("should end the session after the last phase when time runs out", () => {
    const { result } = renderHook(() => useBreathSession(SHORT_PHASES));
    act(() => result.current.start());

    advance(25_000);

    expect(result.current.status).toBe("finished");
    expect(result.current.current).toBeNull();
  });

  it("should return to idle when stop is called during a session", () => {
    const { result } = renderHook(() => useBreathSession(SHORT_PHASES));
    act(() => result.current.start());
    advance(2000);

    act(() => result.current.stop());

    expect(result.current.status).toBe("idle");
    expect(result.current.current).toBeNull();
  });
});
