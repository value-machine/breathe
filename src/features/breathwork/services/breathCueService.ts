import type {
  BreathAudioMode,
  BreathAudioSettings,
  BreathAudioSettingsBounds,
  BreathPhase,
} from "../types/breathwork.types";

export type { BreathAudioMode, BreathAudioSettings };

export const DEFAULT_AUDIO_SETTINGS: BreathAudioSettings = {
  mode: "headphones",
  carrierHz: 200,
  beatLowHz: 4,
  beatHighHz: 10,
};

export const AUDIO_SETTINGS_BOUNDS: BreathAudioSettingsBounds = {
  carrierHz: { min: 100, max: 400 },
  beatLowHz: { min: 1, max: 40 },
  beatHighHz: { min: 1, max: 40 },
} as const;

/** What to play for one phase. The beat ramps linearly from start to end over the phase. */
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
/** Level changes at each phase boundary take this long, so the sound crossfades instead of gapping. */
const CROSSFADE_SECONDS = 0.3;
const SILENCE_GAIN = 0.0001;

/**
 * Cue for a phase. The beat rises across an inhale and falls across an exhale. A hold keeps the
 * beat where the previous breath ended, so the sound does not jump at the phase boundary.
 */
export const cueForPhase = (
  phase: BreathPhase,
  audio: BreathAudioSettings,
  beatBeforeHz: number
): BreathCueSpec => {
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
    beatStartHz: beatBeforeHz,
    beatEndHz: beatBeforeHz,
    peakGain: BREATH_PEAK_GAIN * HOLD_GAIN_SHARE,
  };
};

/**
 * The sound sources for one session. Headphones: a fixed carrier in the left ear and a right
 * ear whose frequency carries the beat. Speakers: a fixed carrier whose loudness is driven by
 * an LFO that carries the beat. Either way the beat parameter takes absolute Hz as
 * beatOffsetHz + beat.
 */
interface Voice {
  output: AudioNode;
  sources: OscillatorNode[];
  beat: AudioParam;
  beatOffsetHz: number;
}

const createBinauralVoice = (ctx: AudioContext, carrierHz: number): Voice => {
  const merger = ctx.createChannelMerger(2);
  const left = ctx.createOscillator();
  const right = ctx.createOscillator();
  left.frequency.value = carrierHz;
  left.connect(merger, 0, 0);
  right.connect(merger, 0, 1);
  return { output: merger, sources: [left, right], beat: right.frequency, beatOffsetHz: carrierHz };
};

const createIsochronicVoice = (ctx: AudioContext, carrierHz: number): Voice => {
  const carrier = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const modulation = ctx.createGain();
  const depth = ctx.createGain();
  carrier.frequency.value = carrierHz;
  modulation.gain.value = 0.5;
  depth.gain.value = 0.5;
  carrier.connect(modulation);
  lfo.connect(depth);
  depth.connect(modulation.gain);
  return { output: modulation, sources: [carrier, lfo], beat: lfo.frequency, beatOffsetHz: 0 };
};

const createVoice = (ctx: AudioContext, audio: BreathAudioSettings): Voice =>
  audio.mode === "headphones"
    ? createBinauralVoice(ctx, audio.carrierHz)
    : createIsochronicVoice(ctx, audio.carrierHz);

/** Beat and level for each phase, in order. The beat carries from one phase into the next. */
const cuesForSession = (phases: BreathPhase[], audio: BreathAudioSettings): BreathCueSpec[] => {
  let beatHz = audio.beatLowHz;
  return phases.map((phase) => {
    const cue = cueForPhase(phase, audio, beatHz);
    beatHz = cue.beatEndHz;
    return cue;
  });
};

/** Automates the beat across the session. Each phase starts where the previous one ended. */
const scheduleSessionBeat = (voice: Voice, cues: BreathCueSpec[], startAt: number): void => {
  let at = startAt;
  for (const cue of cues) {
    voice.beat.setValueAtTime(voice.beatOffsetHz + cue.beatStartHz, at);
    voice.beat.linearRampToValueAtTime(voice.beatOffsetHz + cue.beatEndHz, at + cue.seconds);
    at += cue.seconds;
  }
};

/** Automates the level: silence, then a crossfade at each phase boundary, then silence at the end. */
const scheduleSessionLevel = (level: GainNode, cues: BreathCueSpec[], window: CueWindow): void => {
  level.gain.setValueAtTime(SILENCE_GAIN, window.start);
  let at = window.start;
  let previousPeak = SILENCE_GAIN;
  for (const cue of cues) {
    level.gain.setValueAtTime(previousPeak, at);
    level.gain.linearRampToValueAtTime(cue.peakGain, at + CROSSFADE_SECONDS);
    previousPeak = cue.peakGain;
    at += cue.seconds;
  }
  level.gain.setValueAtTime(previousPeak, window.end - CROSSFADE_SECONDS);
  level.gain.linearRampToValueAtTime(SILENCE_GAIN, window.end);
};

/** Start and end of the session on the AudioContext clock, in seconds. */
interface CueWindow {
  start: number;
  end: number;
}

/**
 * Schedules a whole session as one continuous voice from now. Beat and level are automated per
 * phase on the AudioContext clock, so phase changes are crossfades, not gaps. Suspending the
 * context pauses the session exactly where it is.
 */
export const scheduleBreathSession = (
  ctx: AudioContext,
  phases: BreathPhase[],
  audio: BreathAudioSettings
): void => {
  const cues = cuesForSession(phases, audio);
  const window: CueWindow = {
    start: ctx.currentTime,
    end: ctx.currentTime + cues.reduce((sum, cue) => sum + cue.seconds, 0),
  };
  const voice = createVoice(ctx, audio);
  const level = ctx.createGain();
  voice.output.connect(level);
  level.connect(ctx.destination);

  scheduleSessionBeat(voice, cues, window.start);
  scheduleSessionLevel(level, cues, window);
  for (const source of voice.sources) {
    source.start(window.start);
    source.stop(window.end);
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
