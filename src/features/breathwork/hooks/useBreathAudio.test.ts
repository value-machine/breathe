import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_AUDIO_SETTINGS } from "../services/breathCueService";
import type { BreathPhase } from "../types/breathwork.types";
import { useBreathAudio } from "./useBreathAudio";

const PHASES: BreathPhase[] = [{ kind: "inhale", seconds: 2, round: 1 }];

const createFakeContextClass = () => {
  const instances: FakeContext[] = [];
  class FakeContext {
    currentTime = 0;
    destination = {};
    state = "running";
    resume = vi.fn(() => Promise.resolve());
    suspend = vi.fn(() => Promise.resolve());
    close = vi.fn(() => Promise.resolve());
    createOscillator = vi.fn(() => ({
      type: "sine",
      frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }));
    createGain = vi.fn(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }));
    createChannelMerger = vi.fn(() => ({ connect: vi.fn() }));

    constructor() {
      instances.push(this);
    }
  }
  return { FakeContext, instances };
};

describe("useBreathAudio", () => {
  let fake: ReturnType<typeof createFakeContextClass>;

  beforeEach(() => {
    fake = createFakeContextClass();
    vi.stubGlobal("AudioContext", fake.FakeContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should create no audio context when sound is off", () => {
    const { result } = renderHook(() => useBreathAudio());

    result.current.prepare(false);

    expect(fake.instances).toHaveLength(0);
  });

  it("should schedule the session on the audio context when sound is on and the session begins", () => {
    const { result } = renderHook(() => useBreathAudio());
    result.current.prepare(true);

    result.current.begin(PHASES, DEFAULT_AUDIO_SETTINGS);

    expect(fake.instances[0].createOscillator).toHaveBeenCalled();
  });

  it("should schedule the session only once when begin is called twice", () => {
    const { result } = renderHook(() => useBreathAudio());
    result.current.prepare(true);

    result.current.begin(PHASES, DEFAULT_AUDIO_SETTINGS);
    const callsAfterFirst = fake.instances[0].createOscillator.mock.calls.length;
    result.current.begin(PHASES, DEFAULT_AUDIO_SETTINGS);

    expect(fake.instances[0].createOscillator.mock.calls.length).toBe(callsAfterFirst);
  });

  it("should suspend and resume the context when the session is paused and resumed", () => {
    const { result } = renderHook(() => useBreathAudio());
    result.current.prepare(true);

    result.current.pause();
    result.current.resume();

    expect(fake.instances[0].suspend).toHaveBeenCalledTimes(1);
    expect(fake.instances[0].resume).toHaveBeenCalledTimes(2);
  });

  it("should close the context when the session is stopped", () => {
    const { result } = renderHook(() => useBreathAudio());
    result.current.prepare(true);

    result.current.stop();

    expect(fake.instances[0].close).toHaveBeenCalledTimes(1);
  });
});
