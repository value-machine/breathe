import { describe, expect, it, vi } from "vitest";
import type { BreathPhase } from "../types/breathwork.types";
import {
  cueForPhase,
  DEFAULT_AUDIO_SETTINGS,
  scheduleBreathSession,
  scheduleCue,
  validateAudioSettings,
  type BreathAudioSettings,
} from "./breathCueService";

const HEADPHONES: BreathAudioSettings = { ...DEFAULT_AUDIO_SETTINGS, mode: "headphones" };
const SPEAKERS: BreathAudioSettings = { ...DEFAULT_AUDIO_SETTINGS, mode: "speakers" };

describe("cueForPhase", () => {
  it("should ramp the beat up from low to high across an inhale when the phase is an inhale", () => {
    const phase: BreathPhase = { kind: "inhale", seconds: 4, round: 1 };

    expect(cueForPhase(phase, HEADPHONES)).toEqual({
      mode: "headphones",
      carrierHz: 200,
      beatStartHz: 4,
      beatEndHz: 10,
      seconds: 4,
      peakGain: 0.15,
    });
  });

  it("should ramp the beat down from high to low across an exhale when the phase is an exhale", () => {
    const phase: BreathPhase = { kind: "exhale", seconds: 6, round: 1 };

    expect(cueForPhase(phase, HEADPHONES)).toMatchObject({
      beatStartHz: 10,
      beatEndHz: 4,
      seconds: 6,
    });
  });

  it("should keep the beat at the low value at half gain when the phase is a hold", () => {
    const phase: BreathPhase = { kind: "hold", seconds: 15, round: 1 };

    expect(cueForPhase(phase, HEADPHONES)).toMatchObject({
      beatStartHz: 4,
      beatEndHz: 4,
      peakGain: 0.075,
    });
  });

  it("should carry the speakers mode into the cue when speakers mode is selected", () => {
    const phase: BreathPhase = { kind: "inhale", seconds: 4, round: 1 };

    expect(cueForPhase(phase, SPEAKERS).mode).toBe("speakers");
  });

  it("should use the configured carrier and beat range when the settings are changed", () => {
    const phase: BreathPhase = { kind: "inhale", seconds: 4, round: 1 };

    expect(
      cueForPhase(phase, { mode: "headphones", carrierHz: 300, beatLowHz: 2, beatHighHz: 6 })
    ).toMatchObject({ carrierHz: 300, beatStartHz: 2, beatEndHz: 6 });
  });
});

const createFakeContext = () => {
  const makeOscillator = () => ({
    type: "sine",
    frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  });
  const oscillators: ReturnType<typeof makeOscillator>[] = [];
  const makeGain = () => ({
    gain: {
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

describe("scheduleCue", () => {
  it("should play the carrier in the left ear and carrier plus beat in the right ear when headphones mode is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();

    scheduleCue(
      ctx as unknown as AudioContext,
      cueForPhase({ kind: "inhale", seconds: 4, round: 1 }, HEADPHONES)
    );

    const [left, right] = oscillators;
    expect(ctx.createChannelMerger).toHaveBeenCalledWith(2);
    expect(left.frequency.setValueAtTime).toHaveBeenCalledWith(200, 10);
    expect(right.frequency.setValueAtTime).toHaveBeenCalledWith(204, 10);
    expect(right.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(210, 14);
  });

  it("should stop every oscillator at the end of the cue when a cue is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();

    scheduleCue(
      ctx as unknown as AudioContext,
      cueForPhase({ kind: "hold", seconds: 15, round: 1 }, HEADPHONES)
    );

    for (const osc of oscillators) expect(osc.stop).toHaveBeenCalledWith(25);
  });

  it("should modulate one carrier at the beat rate when speakers mode is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();

    scheduleCue(
      ctx as unknown as AudioContext,
      cueForPhase({ kind: "inhale", seconds: 4, round: 1 }, SPEAKERS)
    );

    const [carrier, lfo] = oscillators;
    expect(ctx.createChannelMerger).not.toHaveBeenCalled();
    expect(carrier.frequency.setValueAtTime).toHaveBeenCalledWith(200, 10);
    expect(lfo.frequency.setValueAtTime).toHaveBeenCalledWith(4, 10);
    expect(lfo.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(10, 14);
  });
});

describe("scheduleBreathSession", () => {
  it("should schedule one cue per phase, each starting where the previous one ends, when a session is scheduled", () => {
    const { ctx, oscillators } = createFakeContext();
    const phases: BreathPhase[] = [
      { kind: "inhale", seconds: 2, round: 1 },
      { kind: "hold", seconds: 3, round: 1 },
    ];

    scheduleBreathSession(ctx as unknown as AudioContext, phases, HEADPHONES);

    const startTimes = oscillators.map((osc) => osc.start.mock.calls[0][0]);
    expect(startTimes).toEqual([10, 10, 12, 12]);
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
