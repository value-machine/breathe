import { describe, expect, it, vi } from "vitest";
import type { BreathPhase } from "../types/breathwork.types";
import {
  audioSettingsForEffect,
  chimeSchedule,
  cueForPhase,
  DEFAULT_AUDIO_SETTINGS,
  EFFECT_PRESETS,
  scheduleBreathSession,
  validateAudioSettings,
  type BreathAudioSettings,
} from "./breathCueService";

const HEADPHONES: BreathAudioSettings = { ...DEFAULT_AUDIO_SETTINGS, mode: "headphones" };
const SPEAKERS: BreathAudioSettings = { ...DEFAULT_AUDIO_SETTINGS, mode: "speakers" };

describe("cueForPhase", () => {
  it("should return the given beat range and the breath level when the phase is an inhale", () => {
    const phase: BreathPhase = { kind: "inhale", seconds: 4, round: 1 };

    expect(cueForPhase(phase, HEADPHONES, { startHz: 6, endHz: 7.2 })).toEqual({
      mode: "headphones",
      carrierHz: 200,
      beatStartHz: 6,
      beatEndHz: 7.2,
      seconds: 4,
      peakGain: 0.15,
    });
  });

  it("should use half the breath level when the phase is a hold", () => {
    const phase: BreathPhase = { kind: "hold", seconds: 15, round: 1 };

    expect(cueForPhase(phase, HEADPHONES, { startHz: 7.2, endHz: 6 })).toMatchObject({
      peakGain: 0.075,
    });
  });

  it("should carry the speakers mode and the carrier into the cue when speakers mode is selected", () => {
    const phase: BreathPhase = { kind: "exhale", seconds: 4, round: 1 };

    expect(cueForPhase(phase, SPEAKERS, { startHz: 7, endHz: 5 })).toMatchObject({
      mode: "speakers",
      carrierHz: 200,
    });
  });
});

const createFakeContext = () => {
  const makeOscillator = () => ({
    type: "sine",
    frequency: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  });
  const oscillators: ReturnType<typeof makeOscillator>[] = [];
  const makeGain = () => ({
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  });
  const ctx = {
    currentTime: 10,
    destination: {},
    createOscillator: vi.fn(() => {
      const osc = makeOscillator();
      oscillators.push(osc);
      return osc;
    }),
    createGain: vi.fn(() => makeGain()),
    createChannelMerger: vi.fn(() => ({ connect: vi.fn() })),
  };
  return { ctx, oscillators };
};

// Calm: beat high 8, low 4, so the swing is 1 Hz and the session trend runs 7 → 5 Hz.
// Two phases of 2 s inhale and 3 s hold: the trend is 7 − 0.4·t, so it is 6.2 at 2 s and 5 at 5 s.
const INHALE_AND_HOLD: BreathPhase[] = [
  { kind: "inhale", seconds: 2, round: 1 },
  { kind: "hold", seconds: 3, round: 1 },
];

describe("scheduleBreathSession", () => {
  it("should carry the carrier in the left ear and the beat in the right ear when headphones mode is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();

    scheduleBreathSession(ctx as unknown as AudioContext, INHALE_AND_HOLD, HEADPHONES);

    const [left, right] = oscillators;
    expect(ctx.createChannelMerger).toHaveBeenCalledWith(2);
    expect(left.frequency.setValueAtTime).not.toHaveBeenCalled();
    expect(right.frequency.setValueAtTime).toHaveBeenCalledWith(expect.closeTo(206, 5), 10);
    expect(right.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(207.2, 5),
      12
    );
  });

  it("should keep the beat at the swing above the trend through the hold when the hold follows an inhale", () => {
    const { ctx, oscillators } = createFakeContext();

    scheduleBreathSession(ctx as unknown as AudioContext, INHALE_AND_HOLD, HEADPHONES);

    const [, right] = oscillators;
    expect(right.frequency.setValueAtTime).toHaveBeenCalledWith(expect.closeTo(207.2, 5), 12);
    expect(right.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(206, 5),
      15
    );
  });

  it("should drift the beat down over the session when later breaths start lower", () => {
    const { ctx, oscillators } = createFakeContext();
    const fourBreaths: BreathPhase[] = [
      { kind: "inhale", seconds: 2, round: 1 },
      { kind: "exhale", seconds: 2, round: 1 },
      { kind: "inhale", seconds: 2, round: 1 },
      { kind: "exhale", seconds: 2, round: 1 },
    ];

    scheduleBreathSession(ctx as unknown as AudioContext, fourBreaths, HEADPHONES);

    const right = oscillators[1];
    const firstInhaleStart = right.frequency.setValueAtTime.mock.calls[0][0];
    const secondInhaleStart = right.frequency.setValueAtTime.mock.calls[2][0];
    expect(secondInhaleStart).toBeLessThan(firstInhaleStart);
  });

  it("should keep every beat value between beat low and beat high when a session is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();
    const phases: BreathPhase[] = [
      { kind: "inhale", seconds: 4, round: 1 },
      { kind: "exhale", seconds: 6, round: 1 },
      { kind: "hold", seconds: 5, round: 1 },
      { kind: "inhale", seconds: 4, round: 1 },
      { kind: "hold", seconds: 15, round: 1 },
      { kind: "exhale", seconds: 6, round: 1 },
    ];

    scheduleBreathSession(ctx as unknown as AudioContext, phases, HEADPHONES);

    const right = oscillators[1];
    const values = [
      ...right.frequency.setValueAtTime.mock.calls.map((call) => call[0]),
      ...right.frequency.linearRampToValueAtTime.mock.calls.map((call) => call[0]),
    ];
    for (const hz of values) {
      expect(hz).toBeGreaterThanOrEqual(204 - 1e-9);
      expect(hz).toBeLessThanOrEqual(208 + 1e-9);
    }
  });

  it("should stop every oscillator at the end of the session when a session is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();

    scheduleBreathSession(ctx as unknown as AudioContext, INHALE_AND_HOLD, HEADPHONES);

    for (const osc of oscillators.slice(0, 2)) expect(osc.stop).toHaveBeenCalledWith(15);
  });

  it("should use two bed oscillators for the whole session and one per chime when there are many phases", () => {
    const { ctx, oscillators } = createFakeContext();
    const manyPhases: BreathPhase[] = Array.from({ length: 12 }, (_, i) => ({
      kind: i % 2 === 0 ? "inhale" : "exhale",
      seconds: 2,
      round: 1,
    }));

    scheduleBreathSession(ctx as unknown as AudioContext, manyPhases, HEADPHONES);

    expect(oscillators).toHaveLength(2 + chimeSchedule(manyPhases).length);
  });

  it("should crossfade the level from the inhale peak to the hold level when a hold follows an inhale", () => {
    const { ctx } = createFakeContext();

    scheduleBreathSession(ctx as unknown as AudioContext, INHALE_AND_HOLD, HEADPHONES);

    const level = ctx.createGain.mock.results[0].value.gain;
    expect(level.setValueAtTime).toHaveBeenCalledWith(0.15, 12);
    expect(level.linearRampToValueAtTime).toHaveBeenCalledWith(0.075, 12.3);
  });

  it("should modulate one carrier at the beat rate when speakers mode is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();

    scheduleBreathSession(ctx as unknown as AudioContext, INHALE_AND_HOLD, SPEAKERS);

    const [, lfo] = oscillators;
    expect(ctx.createChannelMerger).not.toHaveBeenCalled();
    expect(lfo.frequency.setValueAtTime).toHaveBeenCalledWith(expect.closeTo(6, 5), 10);
    expect(lfo.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(expect.closeTo(7.2, 5), 12);
  });

  it("should keep the speakers tone pulsing rather than gating off when speakers mode is scheduled", () => {
    const { ctx } = createFakeContext();

    scheduleBreathSession(ctx as unknown as AudioContext, INHALE_AND_HOLD, SPEAKERS);

    const modulation = ctx.createGain.mock.results[0].value.gain;
    expect(modulation.value).toBe(0.7);
  });
});

describe("scheduleBreathSession chimes", () => {
  it("should start one chime oscillator at each chime time when a session is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();

    scheduleBreathSession(ctx as unknown as AudioContext, INHALE_AND_HOLD, HEADPHONES);

    // Session starts at 10 s on the context clock. Chimes: inhale at 0 s, hold at 2 s, round end at 5 s.
    const chimeStarts = oscillators.slice(2).map((osc) => osc.start.mock.calls[0][0]);
    expect(chimeStarts).toEqual([10, 12, 15]);
  });
});

describe("chimeSchedule", () => {
  it("should place a chime at each phase start and at each round end when a session has two rounds", () => {
    const twoRounds: BreathPhase[] = [
      { kind: "inhale", seconds: 2, round: 1 },
      { kind: "hold", seconds: 3, round: 1 },
      { kind: "exhale", seconds: 2, round: 1 },
      { kind: "inhale", seconds: 2, round: 2 },
    ];

    expect(chimeSchedule(twoRounds)).toEqual([
      { at: 0, kind: "inhale" },
      { at: 2, kind: "hold" },
      { at: 5, kind: "exhale" },
      { at: 7, kind: "roundEnd" },
      { at: 9, kind: "roundEnd" },
    ]);
  });

  it("should play only the round-end chime at a round boundary when the next phase starts a round", () => {
    const boundary: BreathPhase[] = [
      { kind: "exhale", seconds: 2, round: 1 },
      { kind: "inhale", seconds: 2, round: 2 },
    ];

    expect(chimeSchedule(boundary)).toEqual([
      { at: 0, kind: "exhale" },
      { at: 2, kind: "roundEnd" },
      { at: 4, kind: "roundEnd" },
    ]);
  });
});

describe("effect presets", () => {
  const FORBIDDEN_CLAIMS = /heal|cure|treat|therap|anxiety|relax|sleep aid|improve|boost|enhance/i;

  it("should keep every preset inside the Hz bounds when presets are listed", () => {
    for (const preset of EFFECT_PRESETS) {
      expect(validateAudioSettings(audioSettingsForEffect(preset.id, "headphones"))).toBeNull();
    }
  });

  it("should keep the beat low below the beat high when a preset is listed", () => {
    for (const preset of EFFECT_PRESETS) {
      expect(preset.beatLowHz).toBeLessThan(preset.beatHighHz);
    }
  });

  it("should use the preset values and keep the output mode when an effect is chosen", () => {
    expect(audioSettingsForEffect("sleep", "speakers")).toEqual({
      mode: "speakers",
      effect: "sleep",
      carrierHz: 150,
      beatLowHz: 1,
      beatHighHz: 4,
    });
  });

  it("should contain no health or effect claims when labels and bands are listed", () => {
    for (const preset of EFFECT_PRESETS) {
      expect(`${preset.label} ${preset.band}`).not.toMatch(FORBIDDEN_CLAIMS);
    }
  });
});

describe("validateAudioSettings", () => {
  it("should accept the defaults when they are within bounds", () => {
    expect(validateAudioSettings(DEFAULT_AUDIO_SETTINGS)).toBeNull();
  });

  it("should reject a beat-low above beat-high when the range is inverted", () => {
    expect(
      validateAudioSettings({ ...DEFAULT_AUDIO_SETTINGS, beatLowHz: 12, beatHighHz: 6 })
    ).toMatch(/beat/);
  });

  it("should reject a carrier outside 100–400 Hz when the carrier is too high", () => {
    expect(validateAudioSettings({ ...DEFAULT_AUDIO_SETTINGS, carrierHz: 800 })).toMatch(/carrier/);
  });
});
