import { describe, expect, it } from "vitest";
import {
  buildBreathPhases,
  circleScaleAt,
  holdSecondsForRound,
  isCircleExpanded,
  roundProgressAt,
  validateBreathSettings,
} from "./breathSessionService";
import type { BreathPhase, BreathSettings } from "../types/breathwork.types";

const SUCCESS_CHECK_SETTINGS: BreathSettings = {
  breathsBeforeHold: 1,
  inhaleExhaleSeconds: 2,
  holdTargetSeconds: 6,
  rounds: 2,
};

describe("breathSessionService", () => {
  it("should return the design phase list when settings match the success check", () => {
    const phases = buildBreathPhases(SUCCESS_CHECK_SETTINGS);

    const expected: BreathPhase[] = [
      { kind: "inhale", seconds: 2, round: 1 },
      { kind: "exhale", seconds: 2, round: 1 },
      { kind: "hold", seconds: 2, round: 1 },
      { kind: "inhale", seconds: 2, round: 1 },
      { kind: "hold", seconds: 15, round: 1 },
      { kind: "exhale", seconds: 2, round: 1 },
      { kind: "inhale", seconds: 2, round: 2 },
      { kind: "exhale", seconds: 2, round: 2 },
      { kind: "hold", seconds: 6, round: 2 },
      { kind: "inhale", seconds: 2, round: 2 },
      { kind: "hold", seconds: 15, round: 2 },
      { kind: "exhale", seconds: 2, round: 2 },
    ];
    expect(phases).toEqual(expected);
  });

  it("should use one third of the target in round 1 and the full target in the last round when rounds is 3", () => {
    expect(holdSecondsForRound(1, 3, 60)).toBe(20);
    expect(holdSecondsForRound(2, 3, 60)).toBe(40);
    expect(holdSecondsForRound(3, 3, 60)).toBe(60);
  });

  it("should reject settings outside the allowed bounds when a value is too large", () => {
    const result = validateBreathSettings({ ...SUCCESS_CHECK_SETTINGS, rounds: 11 });

    expect(result.ok).toBe(false);
  });

  it("should reject settings with a non-integer value when breaths are fractional", () => {
    const result = validateBreathSettings({ ...SUCCESS_CHECK_SETTINGS, breathsBeforeHold: 1.5 });

    expect(result.ok).toBe(false);
  });

  it("should accept the success check settings when all values are within bounds", () => {
    expect(validateBreathSettings(SUCCESS_CHECK_SETTINGS)).toEqual({
      ok: true,
      value: SUCCESS_CHECK_SETTINGS,
    });
  });
});

describe("isCircleExpanded", () => {
  it("should keep the circle expanded through a hold when the last breath was an inhale", () => {
    const phases: BreathPhase[] = [
      { kind: "inhale", seconds: 2, round: 1 },
      { kind: "hold", seconds: 4, round: 1 },
    ];

    expect(isCircleExpanded(phases, 1)).toBe(true);
  });

  it("should keep the circle contracted through a hold when the last breath was an exhale", () => {
    const phases: BreathPhase[] = [
      { kind: "exhale", seconds: 2, round: 1 },
      { kind: "hold", seconds: 4, round: 1 },
    ];

    expect(isCircleExpanded(phases, 1)).toBe(false);
  });
});

describe("circleScaleAt", () => {
  const phases: BreathPhase[] = [
    { kind: "inhale", seconds: 4, round: 1 },
    { kind: "exhale", seconds: 4, round: 1 },
    { kind: "hold", seconds: 4, round: 1 },
    { kind: "inhale", seconds: 4, round: 1 },
  ];

  it("should grow to the expanded size across the whole inhale when the inhale is halfway done", () => {
    expect(circleScaleAt(phases, { phaseIndex: 0, remainingMs: 2000 })).toBeCloseTo(0.75);
  });

  it("should shrink to the contracted size across the whole exhale when the exhale is halfway done", () => {
    expect(circleScaleAt(phases, { phaseIndex: 1, remainingMs: 2000 })).toBeCloseTo(0.75);
  });

  it("should keep the expanded size through a hold when the last breath was an inhale", () => {
    const afterInhale: BreathPhase[] = [
      { kind: "inhale", seconds: 4, round: 1 },
      { kind: "hold", seconds: 4, round: 1 },
    ];
    expect(circleScaleAt(afterInhale, { phaseIndex: 1, remainingMs: 1000 })).toBe(1);
  });

  it("should keep the contracted size through a hold when the last breath was an exhale", () => {
    expect(circleScaleAt(phases, { phaseIndex: 2, remainingMs: 1000 })).toBe(0.5);
  });

  it("should start the next inhale at the contracted size when the hold ends", () => {
    expect(circleScaleAt(phases, { phaseIndex: 3, remainingMs: 4000 })).toBe(0.5);
  });
});

describe("roundProgressAt", () => {
  const phases: BreathPhase[] = [
    { kind: "inhale", seconds: 2, round: 1 },
    { kind: "exhale", seconds: 2, round: 1 },
    { kind: "inhale", seconds: 4, round: 2 },
    { kind: "exhale", seconds: 4, round: 2 },
  ];

  it("should report zero progress when a round starts", () => {
    expect(roundProgressAt(phases, { phaseIndex: 2, remainingMs: 4000 })).toBe(0);
  });

  it("should report the share of the current round including earlier phases when the round is midway", () => {
    expect(roundProgressAt(phases, { phaseIndex: 3, remainingMs: 2000 })).toBeCloseTo(0.75);
  });
});
