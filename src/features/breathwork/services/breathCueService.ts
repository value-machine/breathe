import type { BreathPhase } from "../types/breathwork.types";

export type BreathAudioMode = "headphones" | "speakers";

/** Audio settings the user can change. Ranges are enforced by the settings form. */
export interface BreathAudioSettings {
  mode: BreathAudioMode;
  /** Tone heard in the left ear (headphones) or carried by the speaker (speakers), in Hz. */
  carrierHz: number;
  /** Beat frequency at the start of an inhale and the end of an exhale, in Hz. */
  beatLowHz: number;
  /** Beat frequency at the end of an inhale and the start of an exhale, in Hz. */
  beatHighHz: number;
}

export const DEFAULT_AUDIO_SETTINGS: BreathAudioSettings = {
  mode: "headphones",
  carrierHz: 200,
  beatLowHz: 4,
  beatHighHz: 10,
};

export const AUDIO_SETTINGS_BOUNDS = {
  carrierHz: { min: 100, max: 400 },
  beatLowHz: { min: 1, max: 40 },
  beatHighHz: { min: 1, max: 40 },
} as const;

/** What to play for one phase. Frequencies ramp linearly from start to end over the phase. */
export interface BreathCueSpec {
  mode: BreathAudioMode;
  carrierHz: number;
  beatStartHz: number;
  beatEndHz: number;
  seconds: number;
  peakGain: number;
}

const BREATH_PEAK_GAIN = 0.15;
const HOLD_GAIN_SHARE = 0.5;
/** Fade in and out at each end of a cue, so it does not click. */
const FADE_SECONDS = 0.3;

/** Cue for a phase: the beat rises across an inhale, falls across an exhale, and stays low in a hold. */
export const cueForPhase = (phase: BreathPhase, audio: BreathAudioSettings): BreathCueSpec => {
  const base = {
    mode: audio.mode,
    carrierHz: audio.carrierHz,
    seconds: phase.seconds,
  };
  if (phase.kind === "inhale") {
    return {
      ...base,
      beatStartHz: audio.beatLowHz,
      beatEndHz: audio.beatHighHz,
      peakGain: BREATH_PEAK_GAIN,
    };
  }
  if (phase.kind === "exhale") {
    return {
      ...base,
      beatStartHz: audio.beatHighHz,
      beatEndHz: audio.beatLowHz,
      peakGain: BREATH_PEAK_GAIN,
    };
  }
  return {
    ...base,
    beatStartHz: audio.beatLowHz,
    beatEndHz: audio.beatLowHz,
    peakGain: BREATH_PEAK_GAIN * HOLD_GAIN_SHARE,
  };
};

/** Start and end of a cue on the AudioContext clock, in seconds. */
interface CueWindow {
  start: number;
  end: number;
}

/** Fades the envelope gain in at the start and out at the end of the cue. */
const applyEnvelope = (envelope: GainNode, spec: BreathCueSpec, window: CueWindow): void => {
  envelope.gain.setValueAtTime(0.0001, window.start);
  envelope.gain.exponentialRampToValueAtTime(spec.peakGain, window.start + FADE_SECONDS);
  envelope.gain.setValueAtTime(spec.peakGain, window.end - FADE_SECONDS);
  envelope.gain.exponentialRampToValueAtTime(0.0001, window.end);
};

const startAndStop = (sources: OscillatorNode[], window: CueWindow): void => {
  for (const source of sources) {
    source.start(window.start);
    source.stop(window.end);
  }
};

/** Headphones: left ear at the carrier, right ear at carrier plus beat, each on its own channel. */
const scheduleBinaural = (ctx: AudioContext, spec: BreathCueSpec, window: CueWindow): void => {
  const merger = ctx.createChannelMerger(2);
  const envelope = ctx.createGain();
  const left = ctx.createOscillator();
  const right = ctx.createOscillator();

  left.frequency.setValueAtTime(spec.carrierHz, window.start);
  right.frequency.setValueAtTime(spec.carrierHz + spec.beatStartHz, window.start);
  right.frequency.linearRampToValueAtTime(spec.carrierHz + spec.beatEndHz, window.end);

  left.connect(merger, 0, 0);
  right.connect(merger, 0, 1);
  merger.connect(envelope);
  envelope.connect(ctx.destination);
  applyEnvelope(envelope, spec, window);
  startAndStop([left, right], window);
};

/** Carrier loudness follows an LFO at the beat rate, so the beat is audible without stereo. */
const createBeatModulation = (
  ctx: AudioContext,
  spec: BreathCueSpec,
  window: CueWindow
): { modulation: GainNode; lfo: OscillatorNode } => {
  const modulation = ctx.createGain();
  const depth = ctx.createGain();
  const lfo = ctx.createOscillator();

  lfo.frequency.setValueAtTime(spec.beatStartHz, window.start);
  lfo.frequency.linearRampToValueAtTime(spec.beatEndHz, window.end);
  modulation.gain.setValueAtTime(0.5, window.start);
  depth.gain.setValueAtTime(0.5, window.start);
  lfo.connect(depth);
  depth.connect(modulation.gain);
  return { modulation, lfo };
};

/** Speakers: one carrier whose loudness follows the beat rate. */
const scheduleIsochronic = (ctx: AudioContext, spec: BreathCueSpec, window: CueWindow): void => {
  const carrier = ctx.createOscillator();
  const envelope = ctx.createGain();
  const { modulation, lfo } = createBeatModulation(ctx, spec, window);

  carrier.frequency.setValueAtTime(spec.carrierHz, window.start);
  carrier.connect(modulation);
  modulation.connect(envelope);
  envelope.connect(ctx.destination);
  applyEnvelope(envelope, spec, window);
  startAndStop([carrier, lfo], window);
};

/** Schedules one cue on an AudioContext, starting at startAt (default: now). */
export const scheduleCue = (
  ctx: AudioContext,
  spec: BreathCueSpec,
  startAt = ctx.currentTime
): void => {
  const window: CueWindow = { start: startAt, end: startAt + spec.seconds };
  if (spec.mode === "headphones") {
    scheduleBinaural(ctx, spec, window);
  } else {
    scheduleIsochronic(ctx, spec, window);
  }
};

/**
 * Schedules a whole session at once, back to back from now. Because everything sits on the
 * AudioContext clock, suspending the context pauses the session exactly where it is.
 */
export const scheduleBreathSession = (
  ctx: AudioContext,
  phases: BreathPhase[],
  audio: BreathAudioSettings
): void => {
  let startAt = ctx.currentTime;
  for (const phase of phases) {
    const spec = cueForPhase(phase, audio);
    scheduleCue(ctx, spec, startAt);
    startAt += phase.seconds;
  }
};

/** Returns a message for the first invalid audio setting, or null when all are valid. */
export const validateAudioSettings = (audio: BreathAudioSettings): string | null => {
  const { carrierHz, beatLowHz, beatHighHz } = audio;
  const { min: carrierMin, max: carrierMax } = AUDIO_SETTINGS_BOUNDS.carrierHz;
  if (carrierHz < carrierMin || carrierHz > carrierMax) {
    return `carrier must be between ${carrierMin} and ${carrierMax} Hz`;
  }
  const { min: beatMin, max: beatMax } = AUDIO_SETTINGS_BOUNDS.beatLowHz;
  if (beatLowHz < beatMin || beatLowHz > beatMax || beatHighHz < beatMin || beatHighHz > beatMax) {
    return `beat must be between ${beatMin} and ${beatMax} Hz`;
  }
  if (beatLowHz > beatHighHz) return "beat low must not be above beat high";
  return null;
};
